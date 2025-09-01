import { Request, Response } from 'express';
import { ProblemStatement } from '../model/problemStatement';
import { TeamProblemSelection } from '../model/teamProblemSelection';
import { ProblemSelectionPoll } from '../model/problemSelectionPoll';
import { TeamSubmission } from '../model/teamSubmission';
import { Team } from '../model/team';
import { Hackathon } from '../model/hackathon';
import { User } from '../model/user';
import { notificationService } from '../services/notificationService';

// Get all problem statements for a hackathon
export const getProblemStatements = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    
    const problemStatements = await ProblemStatement.find({ 
      hackathonId, 
      isActive: true 
    }).populate('createdBy', 'name email');
    
    res.json({
      success: true,
      problemStatements
    });
  } catch (error) {
    console.error('Error fetching problem statements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem statements'
    });
  }
};

// Create a new problem statement
export const createProblemStatement = async (req: Request, res: Response) => {
  try {
    const { title, description, category, difficulty, hackathonId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const problemStatement = new ProblemStatement({
      title,
      description,
      category,
      difficulty,
      hackathonId,
      createdBy: userId
    });
    
    await problemStatement.save();
    
    res.status(201).json({
      success: true,
      problemStatement
    });
  } catch (error) {
    console.error('Error creating problem statement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create problem statement'
    });
  }
};

// Get team's selected problem statement
export const getTeamProblemSelection = async (req: Request, res: Response) => {
  try {
    const { teamId, hackathonId } = req.params;
    
    const selection = await TeamProblemSelection.findOne({
      teamId,
      hackathonId
    }).populate('selectedProblemId');
    
    res.json({
      success: true,
      selection
    });
  } catch (error) {
    console.error('Error fetching team problem selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team problem selection'
    });
  }
};

// Select a problem statement for team
export const selectProblemStatement = async (req: Request, res: Response) => {
  try {
    const { teamId, hackathonId, problemId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if selection window is open
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }
    
    const now = new Date();
    const selectionStart = new Date(hackathon.startDate.getTime() - 48 * 60 * 60 * 1000);
    const selectionEnd = new Date(hackathon.endDate.getTime() + 24 * 60 * 60 * 1000);
    
    if (now < selectionStart || now > selectionEnd) {
      return res.status(400).json({
        success: false,
        message: 'Problem selection window is closed'
      });
    }
    
    // Check if team already has a selection
    const existingSelection = await TeamProblemSelection.findOne({
      teamId,
      hackathonId
    });
    
    if (existingSelection && existingSelection.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Problem selection is already locked for this team'
      });
    }
    
    // Create or update selection
    const selection = await TeamProblemSelection.findOneAndUpdate(
      { teamId, hackathonId },
      {
        selectedProblemId: problemId,
        selectedBy: userId,
        selectedAt: new Date(),
        isLocked: true,
        selectionMethod: 'individual'
      },
      { upsert: true, new: true }
    ).populate('selectedProblemId');
    
    res.json({
      success: true,
      selection
    });
  } catch (error) {
    console.error('Error selecting problem statement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select problem statement'
    });
  }
};

// Create a poll for problem selection
export const createProblemSelectionPoll = async (req: Request, res: Response) => {
  try {
    const { teamId, hackathonId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if user is team leader
    const team = await Team.findById(teamId);
    if (!team || team.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leaders can create polls'
      });
    }
    
    // Check if there's already an active poll
    const existingPoll = await ProblemSelectionPoll.findOne({
      teamId,
      status: 'active'
    });
    
    if (existingPoll) {
      return res.status(400).json({
        success: false,
        message: 'There is already an active poll for this team'
      });
    }
    
    // Create poll (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const poll = new ProblemSelectionPoll({
      teamId,
      hackathonId,
      createdBy: userId,
      expiresAt
    });
    
    await poll.save();
    
    // Notify team members
    const teamMembers = await User.find({
      _id: { $in: team.teamMembers }
    });
    
    for (const member of teamMembers) {
      await notificationService.createNotification({
        userId: member._id,
        type: 'poll_created',
        title: 'Problem Selection Poll Created',
        message: `Your team leader has created a poll to select a problem statement. Vote now!`,
        data: { pollId: poll._id, teamId, hackathonId }
      });
    }
    
    res.status(201).json({
      success: true,
      poll
    });
  } catch (error) {
    console.error('Error creating problem selection poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create problem selection poll'
    });
  }
};

// Vote on a problem selection poll
export const voteOnProblemSelectionPoll = async (req: Request, res: Response) => {
  try {
    const { pollId, problemId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const poll = await ProblemSelectionPoll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    if (poll.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Poll is no longer active'
      });
    }
    
    if (new Date() > poll.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Poll has expired'
      });
    }
    
    // Check if user is team member
    const team = await Team.findById(poll.teamId);
    if (!team || !team.teamMembers.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }
    
    // Remove existing vote if any
    poll.votes = poll.votes.filter(vote => vote.userId.toString() !== userId);
    
    // Add new vote
    poll.votes.push({
      userId,
      problemId,
      votedAt: new Date()
    });
    
    await poll.save();
    
    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
};

// Complete a poll (leader can end early)
export const completeProblemSelectionPoll = async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const poll = await ProblemSelectionPoll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    // Check if user is poll creator
    if (poll.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the poll creator can complete the poll'
      });
    }
    
    if (poll.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Poll is already completed'
      });
    }
    
    // Count votes and determine winner
    const voteCounts: { [key: string]: number } = {};
    poll.votes.forEach(vote => {
      const problemId = vote.problemId.toString();
      voteCounts[problemId] = (voteCounts[problemId] || 0) + 1;
    });
    
    let selectedProblemId = null;
    let maxVotes = 0;
    
    for (const [problemId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        selectedProblemId = problemId;
      }
    }
    
    // Update poll status
    poll.status = 'completed';
    poll.completedAt = new Date();
    poll.selectedProblemId = selectedProblemId;
    
    await poll.save();
    
    // Create team problem selection if a problem was selected
    if (selectedProblemId) {
      await TeamProblemSelection.findOneAndUpdate(
        { teamId: poll.teamId, hackathonId: poll.hackathonId },
        {
          selectedProblemId,
          selectedBy: userId,
          selectedAt: new Date(),
          isLocked: true,
          selectionMethod: 'poll',
          pollId: poll._id
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({
      success: true,
      poll,
      selectedProblemId,
      voteCounts
    });
  } catch (error) {
    console.error('Error completing poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete poll'
    });
  }
};

// Submit team solution
export const submitTeamSolution = async (req: Request, res: Response) => {
  try {
    const { teamId, hackathonId, submissionUrl } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if user is team member
    const team = await Team.findById(teamId);
    if (!team || !team.teamMembers.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }
    
    // Check if team already submitted
    const existingSubmission = await TeamSubmission.findOne({
      teamId,
      hackathonId
    });
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Team has already submitted a solution'
      });
    }
    
    // Validate URL accessibility (basic check)
    try {
      const response = await fetch(submissionUrl, { method: 'HEAD' });
      if (!response.ok) {
        return res.status(400).json({
          success: false,
          message: 'Submission URL is not accessible'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inaccessible submission URL'
      });
    }
    
    // Create submission
    const submission = new TeamSubmission({
      teamId,
      hackathonId,
      submissionUrl,
      submittedBy: userId
    });
    
    await submission.save();
    
    res.status(201).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution'
    });
  }
};

// Get team submission
export const getTeamSubmission = async (req: Request, res: Response) => {
  try {
    const { teamId, hackathonId } = req.params;
    
    const submission = await TeamSubmission.findOne({
      teamId,
      hackathonId
    }).populate('submittedBy', 'name email');
    
    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error fetching team submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team submission'
    });
  }
};

// Get all team selections and submissions for admin
export const getAdminTeamData = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    
    const teams = await Team.find({ hackathonIds: hackathonId })
      .populate('teamMembers', 'name email')
      .populate('createdBy', 'name email');
    
    const teamData = await Promise.all(teams.map(async (team) => {
      const selection = await TeamProblemSelection.findOne({
        teamId: team._id,
        hackathonId
      }).populate('selectedProblemId');
      
      const submission = await TeamSubmission.findOne({
        teamId: team._id,
        hackathonId
      }).populate('submittedBy', 'name email');
      
      return {
        team,
        selection,
        submission
      };
    }));
    
    res.json({
      success: true,
      teamData
    });
  } catch (error) {
    console.error('Error fetching admin team data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team data'
    });
  }
};
