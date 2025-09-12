import express from 'express';
import { authenticateUser } from '../middleware/auth';
import Team from '../model/team';
import Hackathon from '../model/hackathon';

const router = express.Router();

// Simple poll data structure
interface PollData {
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  duration: number; // in minutes
  problemStatements: Array<{track: string, description: string}>;
  votes: { [userId: string]: string }; // userId -> problemStatementTrack
  voteCounts: { [track: string]: number }; // track -> count
}

// Start a simple poll
router.post('/start', authenticateUser, async (req, res) => {
  try {
    const { teamId, duration = 30 } = req.body;
    const userId = req.user?.id;

    console.log('🚀 Starting simple poll:', { teamId, duration, userId });

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    const isLeader = team.createdBy?.toString() === userId || 
                    team.teamLeader?.toString() === userId;
    
    if (!isLeader) {
      return res.status(403).json({ message: 'Only team leaders can start polls' });
    }

    // Get hackathon problem statements
    const hackathon = await Hackathon.findById(team.hackathonId);
    if (!hackathon || !hackathon.problemStatements) {
      return res.status(404).json({ message: 'Hackathon or problem statements not found' });
    }

    // Create poll data
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    const pollData: PollData = {
      isActive: true,
      startTime,
      endTime,
      duration,
      problemStatements: hackathon.problemStatements,
      votes: {},
      voteCounts: {}
    };

    // Initialize vote counts
    hackathon.problemStatements.forEach(ps => {
      pollData.voteCounts[ps.track] = 0;
    });

    // Save to team
    await Team.findByIdAndUpdate(teamId, {
      simplePollData: pollData
    });

    console.log('✅ Poll started successfully');

    res.json({
      message: 'Poll started successfully',
      pollData
    });

  } catch (error) {
    console.error('❌ Error starting poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get poll status
router.get('/status/:teamId', authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const pollData = team.simplePollData || {
      isActive: false,
      startTime: null,
      endTime: null,
      duration: 0,
      problemStatements: [],
      votes: {},
      voteCounts: {}
    };

    // Check if poll has expired
    if (pollData.isActive && pollData.endTime && new Date() > pollData.endTime) {
      pollData.isActive = false;
      await Team.findByIdAndUpdate(teamId, { simplePollData: pollData });
    }

    res.json({ pollData });

  } catch (error) {
    console.error('❌ Error getting poll status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cast a vote
router.post('/vote', authenticateUser, async (req, res) => {
  try {
    const { teamId, track } = req.body;
    const userId = req.user?.id;

    console.log('🗳️ Casting vote:', { teamId, track, userId });

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team member
    const isMember = team.teamMembers.some(member => member.toString() === userId) ||
                    team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    let pollData = team.simplePollData;
    if (!pollData || !pollData.isActive) {
      return res.status(400).json({ message: 'No active poll' });
    }

    // Check if poll has expired
    if (pollData.endTime && new Date() > pollData.endTime) {
      pollData.isActive = false;
      await Team.findByIdAndUpdate(teamId, { simplePollData: pollData });
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Check if track exists
    const trackExists = pollData.problemStatements.some(ps => ps.track === track);
    if (!trackExists) {
      return res.status(400).json({ message: 'Invalid problem statement track' });
    }

    // Remove previous vote if exists
    const previousVote = userId ? pollData.votes[userId] : undefined;
    if (previousVote && pollData.voteCounts[previousVote]) {
      pollData.voteCounts[previousVote] = Math.max(0, pollData.voteCounts[previousVote] - 1);
    }

    // Add new vote
    if (userId) {
      pollData.votes[userId] = track;
    }
    pollData.voteCounts[track] = (pollData.voteCounts[track] || 0) + 1;

    // Save updated poll data
    await Team.findByIdAndUpdate(teamId, { simplePollData: pollData });

    console.log('✅ Vote recorded:', { track, newCount: pollData.voteCounts[track] });

    res.json({
      message: 'Vote recorded successfully',
      voteCounts: pollData.voteCounts,
      userVote: track
    });

  } catch (error) {
    console.error('❌ Error voting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// End poll
router.post('/end', authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user?.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    const isLeader = team.createdBy?.toString() === userId || 
                    team.teamLeader?.toString() === userId;
    
    if (!isLeader) {
      return res.status(403).json({ message: 'Only team leaders can end polls' });
    }

    let pollData = team.simplePollData;
    if (!pollData || !pollData.isActive) {
      return res.status(400).json({ message: 'No active poll to end' });
    }

    pollData.isActive = false;
    await Team.findByIdAndUpdate(teamId, { simplePollData: pollData });

    console.log('✅ Poll ended successfully');

    res.json({
      message: 'Poll ended successfully',
      finalResults: pollData.voteCounts
    });

  } catch (error) {
    console.error('❌ Error ending poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;