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

// Start a problem statement poll
router.post("/start-poll", authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatementId, duration } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify team exists and user is the team leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // REWRITTEN LEADER VERIFICATION - COMPREHENSIVE CHECK
    console.log('🔍 LEADER VERIFICATION DEBUG:');
    console.log('Team ID:', teamId);
    console.log('User ID from token:', userId);
    console.log('User ID from req.user:', req.user?.id);
    console.log('Team Leader:', team.teamLeader);
    console.log('Team Leader Type:', typeof team.teamLeader);
    console.log('Team Created By:', team.createdBy);
    console.log('Team Created By Type:', typeof team.createdBy);
    console.log('Team Members:', team.teamMembers);
    
    // Method 1: Check if user is the team leader (ObjectId comparison)
    const isTeamLeader = team.teamLeader && (
      team.teamLeader.toString() === userId ||
      team.teamLeader.toString() === req.user?.id ||
      team.teamLeader.equals(userId) ||
      team.teamLeader.equals(req.user?.id)
    );
    
    // Method 2: Check if user created the team
    const isTeamCreator = team.createdBy && (
      team.createdBy.toString() === userId ||
      team.createdBy.toString() === req.user?.id ||
      team.createdBy.equals(userId) ||
      team.createdBy.equals(req.user?.id)
    );
    
    // Method 3: Check if user is in team members AND has leader role
    const isTeamMember = team.teamMembers.some(member => 
      member.toString() === userId ||
      member.toString() === req.user?.id ||
      member.equals(userId) ||
      member.equals(req.user?.id)
    );
    
    // Method 4: Check user role from JWT token
    const hasLeaderRole = req.user?.role === 'leader';
    
    console.log('isTeamLeader:', isTeamLeader);
    console.log('isTeamCreator:', isTeamCreator);
    console.log('isTeamMember:', isTeamMember);
    console.log('hasLeaderRole:', hasLeaderRole);
    
    // FINAL DECISION: User is leader if ANY of these conditions are true
    const isLeader = isTeamLeader || isTeamCreator || (isTeamMember && hasLeaderRole);
    
    console.log('FINAL isLeader result:', isLeader);
    
    if (!isLeader) {
      console.log('❌ LEADER VERIFICATION FAILED');
      return res.status(403).json({ 
        message: "Only team leaders can start polls",
        debug: {
          teamLeader: team.teamLeader?.toString(),
          userId: userId,
          reqUserId: req.user?.id,
          createdBy: team.createdBy?.toString(),
          userRole: req.user?.role,
          isTeamLeader,
          isTeamCreator,
          isTeamMember,
          hasLeaderRole
        }
      });
    }
    
    console.log('✅ LEADER VERIFICATION PASSED');

    // Check if poll is already active
    if (team.pollActive) {
      return res.status(400).json({ message: "A poll is already active for this team" });
    }

    // Start the poll
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    await Team.findByIdAndUpdate(teamId, {
      pollActive: true,
      pollStartTime: startTime,
      pollEndTime: endTime,
      pollDuration: duration,
      pollProblemStatement: problemStatementId,
      problemStatementVotes: new Map(),
      problemStatementVoteCount: new Map()
    });

    res.json({ 
      message: "Poll started successfully", 
      pollActive: true,
      pollStartTime: startTime,
      pollEndTime: endTime,
      pollDuration: duration,
      pollProblemStatement: problemStatementId
    });

  } catch (error) {
    console.error("Error starting poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get poll status for a team
router.get("/poll-status/:teamId", authenticateUser, async (req, res) => {
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

    const isMember = team.teamMembers.some(member => member._id.toString() === userId) ||
                     team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Check if poll has expired
    let pollActive = team.pollActive;
    if (team.pollActive && team.pollEndTime && new Date() > team.pollEndTime) {
      // Poll has expired, update the team
      await Team.findByIdAndUpdate(teamId, { pollActive: false });
      pollActive = false;
    }

    res.json({
      pollActive,
      pollStartTime: team.pollStartTime,
      pollEndTime: team.pollEndTime,
      pollDuration: team.pollDuration,
      pollProblemStatement: team.pollProblemStatement,
      problemStatementVotes: team.problemStatementVotes ? Object.fromEntries(team.problemStatementVotes as any) : {},
      problemStatementVoteCount: team.problemStatementVoteCount ? Object.fromEntries(team.problemStatementVoteCount as any) : {}
    });

  } catch (error) {
    console.error("Error getting poll status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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

    // REWRITTEN LEADER VERIFICATION - COMPREHENSIVE CHECK (Same as start-poll)
    const isTeamLeader = team.teamLeader && (
      team.teamLeader.toString() === userId ||
      team.teamLeader.toString() === req.user?.id ||
      team.teamLeader.equals(userId) ||
      team.teamLeader.equals(req.user?.id)
    );
    
    const isTeamCreator = team.createdBy && (
      team.createdBy.toString() === userId ||
      team.createdBy.toString() === req.user?.id ||
      team.createdBy.equals(userId) ||
      team.createdBy.equals(req.user?.id)
    );
    
    const isTeamMember = team.teamMembers.some(member => 
      member.toString() === userId ||
      member.toString() === req.user?.id ||
      member.equals(userId) ||
      member.equals(req.user?.id)
    );
    
    const hasLeaderRole = req.user?.role === 'leader';
    const isLeader = isTeamLeader || isTeamCreator || (isTeamMember && hasLeaderRole);
    
    if (!isLeader) {
      return res.status(403).json({ 
        message: "Only team leaders can select problem statements",
        debug: {
          teamLeader: team.teamLeader?.toString(),
          userId: userId,
          reqUserId: req.user?.id,
          createdBy: team.createdBy?.toString(),
          userRole: req.user?.role,
          isTeamLeader,
          isTeamCreator,
          isTeamMember,
          hasLeaderRole
        }
      });
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
