import { Request, Response } from 'express';
import Team from '../model/team';
import User from '../model/user';
import TeamRequest from '../model/teamRequests';
import Hackathon from '../model/hackathon';
import { validateTeamName, canLeaveTeam, transferTeamOwnership, canTeamReceiveRequests, canUserSendRequests } from '../utils/teamUtils';
import { calculateRequestExpiry, isRequestExpired } from '../utils/teamUtils';
import { notificationService, createAutoTeamCreationNotification, createRequestReceivedNotification, createOwnershipTransferredNotification } from '../services/notificationService';

// Create a new team as a participant
export const createParticipantTeam = async (req: Request, res: Response) => {
  try {
    const { teamName, description, hackathonId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // VALIDATION 1: Check if all required fields are present
    if (!teamName || !hackathonId) {
      return res.status(400).json({ message: 'Team name and hackathon ID are required' });
    }

    // Validate team name
    if (!validateTeamName(teamName)) {
      return res.status(400).json({ 
        message: 'Team name must be 16 characters or less and contain only lowercase letters, underscores, and hyphens' 
      });
    }

    // VALIDATION 2: Check if hackathon exists and allows participant teams
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    if (!hackathon.allowParticipantTeams && hackathon.teamCreationMode === 'admin') {
      return res.status(403).json({ message: 'This hackathon does not allow participant team creation' });
    }

    // VALIDATION 3: Check if user is actually a member of this hackathon
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.hackathonIds || !user.hackathonIds.includes(hackathonId)) {
      return res.status(403).json({ message: 'You are not a member of this hackathon' });
    }

    // VALIDATION 4: Check for duplicate team names within the same hackathon
    const existingTeamName = await Team.findOne({
      hackathonId: hackathonId,
      teamName: teamName.toLowerCase()
    });

    if (existingTeamName) {
      return res.status(400).json({ message: 'A team with this name already exists in this hackathon' });
    }

    // Check if user already created a team in this hackathon
    const existingTeam = await Team.findOne({
      createdBy: userId,
      hackathonId: hackathonId,
      creationMethod: 'participant'
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You can only create one team per hackathon' });
    }

    // Check if user is already in a team
    if (user?.currentTeamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // VALIDATION 5: Validate team size against hackathon limits
    const minTeamSize = hackathon.teamSize?.min || 2;
    const maxTeamSize = hackathon.teamSize?.max || 4;

    if (minTeamSize < 1 || maxTeamSize > 10) {
      return res.status(400).json({ message: 'Invalid team size configuration for this hackathon' });
    }

    // Create the team
    const team = new Team({
      teamName: teamName.toLowerCase(),
      description,
      hackathonId,
      createdBy: userId,
      teamMembers: [userId],
      memberLimit: maxTeamSize, // Use validated team size
      creationMethod: 'participant',
      teamStatus: 'forming',
      canReceiveRequests: true,
      teamLeader: userId
    });

    await team.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      currentTeamId: team._id,
      teamsCreated: [...(user?.teamsCreated || []), team._id],
      canSendRequests: false,
      canReceiveRequests: false,
      lastTeamActivity: new Date()
    });

    console.log(`✅ Team created successfully: ${teamName} for hackathon ${hackathon.title}`);

    res.status(201).json({
      message: 'Team created successfully',
      team: {
        id: team._id,
        teamName: team.teamName,
        description: team.description,
        memberCount: team.teamMembers.length,
        memberLimit: team.memberLimit,
        status: team.teamStatus
      }
    });

  } catch (error) {
    console.error('Error creating participant team:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send join request to a team
export const sendJoinRequest = async (req: Request, res: Response) => {
  try {
    const { teamId, message } = req.body;
    const fromUserId = req.user?.id;

    if (!fromUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user can send requests
    const user = await User.findById(fromUserId);
    if (!user || !canUserSendRequests(user)) {
      return res.status(400).json({ message: 'You cannot send join requests at this time' });
    }

    // Get team details
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team can receive requests
    if (!canTeamReceiveRequests(team)) {
      return res.status(400).json({ message: 'This team is not accepting join requests' });
    }

    // Check if user is already in a team
    if (user.currentTeamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Check if user is already a member of this team
    if (team.teamMembers.includes(fromUserId)) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    // Check if user has already sent a request to this team
    const existingRequest = await TeamRequest.findOne({
      teamId,
      fromUser: fromUserId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already sent a join request to this team' });
    }

    // Create join request
    const teamRequest = new TeamRequest({
      teamId,
      fromUser: fromUserId,
      message: message || 'I would like to join your team!',
      status: 'pending',
      expiresAt: calculateRequestExpiry()
    });

    await teamRequest.save();

    // Add to team's pending requests
    await Team.findByIdAndUpdate(teamId, {
      $push: { pendingRequests: teamRequest._id }
    });

    // Create notification for team leader
    const teamLeader = await User.findById(team.teamLeader);
    if (teamLeader) {
      createRequestReceivedNotification(
        teamLeader._id.toString(),
        user.name,
        team.teamName,
        teamRequest._id.toString()
      );
    }

    res.status(201).json({
      message: 'Join request sent successfully',
      request: {
        id: teamRequest._id,
        status: teamRequest.status,
        message: teamRequest.message
      }
    });

  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send invitation to a participant
export const sendInvitation = async (req: Request, res: Response) => {
  try {
    const { participantId, teamId, message } = req.body;
    const fromUserId = req.user?.id;

    if (!fromUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is team leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.teamLeader.toString() !== fromUserId) {
      return res.status(403).json({ message: 'Only team leaders can send invitations' });
    }

    // Check if team can receive new members
    if (team.teamMembers.length >= team.memberLimit) {
      return res.status(400).json({ message: 'Team is already at maximum capacity' });
    }

    // Check if participant exists and is available
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (participant.currentTeamId) {
      return res.status(400).json({ message: 'Participant is already in a team' });
    }

    // Check if invitation already exists
    const existingInvitation = await TeamRequest.findOne({
      teamId,
      fromUser: fromUserId,
      toUser: participantId,
      type: 'invitation',
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this participant' });
    }

    // Create invitation
    const invitation = new TeamRequest({
      teamId,
      fromUser: fromUserId,
      toUser: participantId,
      message: message || 'You are invited to join our team!',
      type: 'invitation',
      status: 'pending',
      expiresAt: calculateRequestExpiry()
    });

    await invitation.save();

    // Create notification for participant
    createRequestReceivedNotification(
      participantId,
      team.teamName,
      'Team Invitation',
      invitation._id.toString()
    );

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        status: invitation.status,
        message: invitation.message
      }
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Respond to a join request (accept/reject)
export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { response, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get request
    const request = await TeamRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the team creator
    const team = await Team.findById(request.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only team creator can respond to requests' });
    }

    // Check if request has expired
    const expiryCheck = await isRequestExpired(request, Hackathon);
    if (expiryCheck.expired) {
      return res.status(400).json({ message: 'This request has expired' });
    }

    // Update request status
    request.status = response;
    request.respondedAt = new Date();
    request.responseMessage = message;
    await request.save();

    if (response === 'accepted') {
      // Add user to team
      await Team.findByIdAndUpdate(request.teamId, {
        $push: { teamMembers: request.fromUserId },
        $pull: { pendingRequests: request._id }
      });

      // Update user
      await User.findByIdAndUpdate(request.fromUserId, {
        currentTeamId: request.teamId,
        canSendRequests: false,
        canReceiveRequests: false,
        lastTeamActivity: new Date()
      });

      // Check if team is now full
      const updatedTeam = await Team.findById(request.teamId);
      if (updatedTeam && updatedTeam.teamMembers.length >= updatedTeam.memberLimit) {
        updatedTeam.canReceiveRequests = false;
        await updatedTeam.save();
      }

      res.json({ message: 'Request accepted successfully' });
    } else {
      // Remove from pending requests
      await Team.findByIdAndUpdate(request.teamId, {
        $pull: { pendingRequests: request._id }
      });

      res.json({ message: 'Request rejected successfully' });
    }

  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Finalize team
export const finalizeTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is team creator
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only team creator can finalize the team' });
    }

    // Check if team meets minimum size requirement
    if (!team.hackathonId) {
      return res.status(400).json({ message: 'Team is not associated with a hackathon' });
    }
    
    const hackathon = await Hackathon.findById(team.hackathonId);
    if (!hackathon) {
      return res.status(400).json({ message: 'Hackathon not found' });
    }
    
    if (team.teamMembers.length < hackathon.minTeamSizeForFinalization) {
      return res.status(400).json({ 
        message: `Team must have at least ${hackathon.minTeamSizeForFinalization} members to be finalized` 
      });
    }

    // Finalize team
    team.teamStatus = 'finalized';
    team.isFinalized = true;
    team.finalizedAt = new Date();
    team.canReceiveRequests = false;
    await team.save();

    res.json({ message: 'Team finalized successfully' });

  } catch (error) {
    console.error('Error finalizing team:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Leave team
export const leaveTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user can leave team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Fixed: Use the correct function signature
    if (!(await canLeaveTeam(userId, teamId, Team))) {
      return res.status(400).json({ message: 'You cannot leave this team at this time' });
    }

    // Remove user from team
    await Team.findByIdAndUpdate(teamId, {
      $pull: { teamMembers: userId }
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      currentTeamId: null,
      canSendRequests: true,
      canReceiveRequests: true,
      lastTeamActivity: new Date()
    });

    // Check if team is now empty
    const updatedTeam = await Team.findById(teamId);
    if (updatedTeam && updatedTeam.teamMembers.length === 0) {
      await Team.findByIdAndDelete(teamId);
      res.json({ message: 'Team deleted as it is now empty' });
    } else {
      res.json({ message: 'Left team successfully' });
    }

  } catch (error) {
    console.error('Error leaving team:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Transfer team ownership
export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { newOwnerId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is team creator
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only team creator can transfer ownership' });
    }

    // Check if new owner is a team member
    if (!team.teamMembers.includes(newOwnerId)) {
      return res.status(400).json({ message: 'New owner must be a team member' });
    }

    // Fixed: Use the correct function signature
    const success = await transferTeamOwnership(userId, newOwnerId, teamId, Team, User);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to transfer ownership' });
    }

    // Send notification
    if (team.hackathonId) {
      // Get the new owner's name for the notification
      const newOwner = await User.findById(newOwnerId);
      const newOwnerName = newOwner?.name || 'Unknown User';
      
      createOwnershipTransferredNotification(
        newOwnerId,
        team.hackathonId,
        team.teamName,
        newOwnerName
      );
    }

    res.json({ message: 'Team ownership transferred successfully' });

  } catch (error) {
    console.error('Error transferring team ownership:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's requests
export const getUserRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const requests = await TeamRequest.find({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }).populate('fromUserId', 'name email').populate('toUserId', 'name email').populate('teamId', 'teamName');

    res.json({ requests });

  } catch (error) {
    console.error('Error getting user requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get hackathon participants
export const getHackathonParticipants = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // FIXED: Get participants by finding users who have this hackathonId in their hackathonIds array
    const participants = await User.find({
      hackathonIds: { $in: [hackathonId] }
    }).select('-password');

    console.log(`🔍 Found ${participants.length} participants for hackathon ${hackathonId}`);

    res.json({ participants });

  } catch (error) {
    console.error('Error getting hackathon participants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fixed: Use the correct method name
    const notifications = notificationService.getNotifications(userId);
    res.json({ notifications });

  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fixed: Use the correct method signature
    const success = notificationService.markAsRead(userId, notificationId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fixed: Use the correct method name
    notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fixed: Use the correct method signature
    const success = notificationService.deleteNotification(userId, notificationId);
    
    if (success) {
      res.json({ message: 'Notification deleted' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 