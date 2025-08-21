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

    // Validate team name
    if (!validateTeamName(teamName)) {
      return res.status(400).json({ 
        message: 'Team name must be 16 characters or less and contain only lowercase letters, underscores, and hyphens' 
      });
    }

    // Check if hackathon allows participant teams
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    if (!hackathon.allowParticipantTeams && hackathon.teamCreationMode === 'admin') {
      return res.status(403).json({ message: 'This hackathon does not allow participant team creation' });
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
    const user = await User.findById(userId);
    if (user?.currentTeamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Create the team
    const team = new Team({
      teamName: teamName.toLowerCase(),
      description,
      hackathonId,
      createdBy: userId,
      teamMembers: [userId],
      memberLimit: hackathon.teamSize.max, // Fixed: use correct schema field
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
      return res.status(400).json({ message: 'This team is not accepting new members' });
    }

    // Check if user is already in a team
    if (user.currentTeamId) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Check if request already exists
    const existingRequest = await TeamRequest.findOne({
      fromUserId,
      teamId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request to this team' });
    }

    // Calculate expiry time
    if (!team.hackathonId) {
      return res.status(400).json({ message: 'Team is not associated with a hackathon' });
    }
    
    const expiresAt = await calculateRequestExpiry(team.hackathonId, Hackathon);

    // Create request
    const request = new TeamRequest({
      fromUserId,
      toUserId: team.createdBy,
      teamId,
      hackathonId: team.hackathonId,
      requestType: 'join',
      message,
      expiresAt
    });

    await request.save();

    // Add to team's pending requests
    await Team.findByIdAndUpdate(teamId, {
      $push: { pendingRequests: request._id }
    });

    // Send notification to team creator
    const fromUser = await User.findById(fromUserId);
    if (fromUser && team.hackathonId) {
      createRequestReceivedNotification(
        team.createdBy.toString(),
        team.hackathonId,
        fromUser.name || 'Unknown User',
        team.teamName
      );
    }

    res.status(201).json({
      message: 'Join request sent successfully',
      request: {
        id: request._id,
        expiresAt: request.expiresAt,
        status: request.status
      }
    });

  } catch (error) {
    console.error('Error sending join request:', error);
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

    if (!canLeaveTeam(userId, team)) {
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

    // Transfer ownership
    team.createdBy = newOwnerId;
    team.teamLeader = newOwnerId;
    await team.save();

    // Send notification
    if (team.hackathonId) {
      createOwnershipTransferredNotification(
        newOwnerId,
        team.hackathonId,
        team.teamName
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

    // Get hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Get participants
    const participants = await User.find({
      _id: { $in: hackathon.participants }
    }).select('-password');

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

    const notifications = await notificationService.getUserNotifications(userId);
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

    await notificationService.markAsRead(notificationId, userId);
    res.json({ message: 'Notification marked as read' });

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

    await notificationService.markAllAsRead(userId);
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

    await notificationService.deleteNotification(notificationId, userId);
    res.json({ message: 'Notification deleted' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 