import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import Hackathon from "../model/hackathon";
import { getWebSocketInstance } from "../services/websocketService";

const router = express.Router();

// Simple poll status endpoint
router.get("/poll-status/:teamId", authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a team member
    const isMember = team.teamMembers.some(member => 
      member.toString() === userId
    ) || team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Simple poll data structure
    const pollData = {
      pollActive: team.pollActive || false,
      pollStartTime: team.pollStartTime,
      pollEndTime: team.pollEndTime,
      pollDuration: team.pollDuration,
      pollProblemStatement: team.pollProblemStatement,
      votes: team.votes || {}, // Simple object: { userId: problemStatementId }
      voteCounts: team.voteCounts || {} // Simple object: { problemStatementId: count }
    };

    res.json(pollData);

  } catch (error) {
    console.error("Error getting poll status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Simple vote endpoint
router.post("/vote", authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatementId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!teamId || !problemStatementId) {
      return res.status(400).json({ message: "Team ID and problem statement ID are required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a team member
    const isMember = team.teamMembers.some(member => 
      member.toString() === userId
    ) || team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Check if poll is active
    if (!team.pollActive) {
      return res.status(400).json({ message: "No active poll" });
    }

    // Initialize simple vote storage if not exists
    if (!team.votes) {
      team.votes = {};
    }
    if (!team.voteCounts) {
      team.voteCounts = {};
    }

    // Check if user already voted
    if (team.votes[userId]) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Record the vote
    team.votes[userId] = problemStatementId;
    
    // Update vote count
    team.voteCounts[problemStatementId] = (team.voteCounts[problemStatementId] || 0) + 1;

    await team.save();

    // Send real-time update
    const teamMemberIds = team.teamMembers.map(member => member.toString());
    getWebSocketInstance().sendVoteUpdate(teamMemberIds, {
      problemStatementId,
      voterId: userId,
      voteCount: team.voteCounts[problemStatementId],
      totalVotes: Object.values(team.voteCounts).reduce((sum: number, count: number) => sum + count, 0),
      allVoteCounts: team.voteCounts
    });

    res.json({ 
      message: "Vote recorded successfully",
      voteCount: team.voteCounts[problemStatementId],
      totalVotes: Object.values(team.voteCounts).reduce((sum: number, count: number) => sum + count, 0)
    });

  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Simple start poll endpoint
router.post("/start-poll", authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatementId, duration = 120 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is team leader
    const isLeader = team.teamLeader?.toString() === userId || team.createdBy?.toString() === userId;
    if (!isLeader) {
      return res.status(403).json({ message: "Only team leaders can start polls" });
    }

    // Check if poll is already active
    if (team.pollActive) {
      return res.status(400).json({ message: "Poll is already active" });
    }

    // Start the poll
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    team.pollActive = true;
    team.pollStartTime = startTime;
    team.pollEndTime = endTime;
    team.pollDuration = duration;
    team.pollProblemStatement = problemStatementId;
    team.votes = {}; // Reset votes
    team.voteCounts = {}; // Reset vote counts

    await team.save();

    // Send real-time notification
    const teamMemberIds = team.teamMembers.map(member => member.toString());
    getWebSocketInstance().sendPollUpdate(teamMemberIds, {
      type: 'poll_started',
      message: `Poll started for problem statement: ${problemStatementId}`,
      pollData: {
        pollActive: true,
        pollStartTime: startTime,
        pollEndTime: endTime,
        pollDuration: duration,
        pollProblemStatement: problemStatementId
      }
    });

    res.json({ 
      message: "Poll started successfully",
      pollStartTime: startTime,
      pollEndTime: endTime,
      pollDuration: duration
    });

  } catch (error) {
    console.error("Error starting poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Simple conclude poll endpoint
router.post("/conclude-poll", authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is team leader
    const isLeader = team.teamLeader?.toString() === userId || team.createdBy?.toString() === userId;
    if (!isLeader) {
      return res.status(403).json({ message: "Only team leaders can conclude polls" });
    }

    // Check if poll is active
    if (!team.pollActive) {
      return res.status(400).json({ message: "No active poll to conclude" });
    }

    // Find winning problem statement
    let winningProblemStatement = null;
    let maxVotes = 0;

    if (team.voteCounts) {
      for (const [problemStatementId, count] of Object.entries(team.voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          winningProblemStatement = problemStatementId;
        }
      }
    }

    // Conclude the poll
    team.pollActive = false;
    team.pollEndTime = new Date();
    team.selectedProblemStatement = winningProblemStatement || undefined;
    team.problemStatementSelectedAt = new Date();

    await team.save();

    // Send real-time notification
    const teamMemberIds = team.teamMembers.map(member => member.toString());
    getWebSocketInstance().sendPollConclusion(teamMemberIds, {
      winningProblemStatement,
      totalVotes: maxVotes,
      concludedAt: new Date(),
      voteBreakdown: team.voteCounts || {}
    });

    res.json({ 
      message: "Poll concluded successfully",
      winningProblemStatement,
      totalVotes: maxVotes,
      voteBreakdown: team.voteCounts || {}
    });

  } catch (error) {
    console.error("Error concluding poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
