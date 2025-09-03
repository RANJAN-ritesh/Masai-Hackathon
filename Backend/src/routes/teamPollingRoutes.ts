import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import Hackathon from "../model/hackathon";
import User from "../model/user";

const router = express.Router();

// Add a simple test route to verify the polling routes are mounted
router.get("/test", (req, res) => {
  res.json({ message: "Team polling routes are working!", timestamp: new Date().toISOString() });
});

// Vote on problem statement
router.post("/vote-problem-statement", authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatementId, hackathonId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.teamMembers.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Verify hackathon exists and has the problem statement
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const problemExists = hackathon.problemStatements.some(ps => ps.track === problemStatementId);
    if (!problemExists) {
      return res.status(404).json({ message: "Problem statement not found" });
    }

    // Record the vote
    if (!team.problemStatementVotes) {
      team.problemStatementVotes = {};
    }

    // Check if user has already voted
    if (team.problemStatementVotes[userId]) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Record the vote
    team.problemStatementVotes[userId] = problemStatementId;
    
    // Update vote count
    if (!team.problemStatementVoteCount) {
      team.problemStatementVoteCount = {};
    }
    team.problemStatementVoteCount[problemStatementId] = (team.problemStatementVoteCount[problemStatementId] || 0) + 1;

    await team.save();

    res.json({ message: "Vote recorded successfully" });

  } catch (error) {
    console.error("Error voting on problem statement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get poll results
router.get("/poll-results/:teamId", authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.teamMembers.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    res.json({ 
      results: team.problemStatementVoteCount || {},
      userVote: team.problemStatementVotes?.[userId] || null
    });

  } catch (error) {
    console.error("Error getting poll results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Select problem statement (end poll)
router.post("/select-problem-statement", authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatementId, hackathonId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify team exists and user is the leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.teamLeader?.toString() !== userId) {
      return res.status(403).json({ message: "Only team leaders can select problem statements" });
    }

    // Verify hackathon exists and has the problem statement
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const problemExists = hackathon.problemStatements.some(ps => ps.track === problemStatementId);
    if (!problemExists) {
      return res.status(404).json({ message: "Problem statement not found" });
    }

    // Set the selected problem statement
    team.selectedProblemStatement = problemStatementId;
    team.problemStatementSelectedAt = new Date();
    await team.save();

    res.json({ message: "Problem statement selected successfully" });

  } catch (error) {
    console.error("Error selecting problem statement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
