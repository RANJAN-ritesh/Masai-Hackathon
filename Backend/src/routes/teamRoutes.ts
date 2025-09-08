import express from "express";
import { createTeams, getTeams, deleteTeam } from "../controller/teamController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/create-team", authenticateUser, createTeams);
router.get("/get-teams", getTeams); // Get all teams

// Get teams for a specific user and hackathon
router.get("/user/:userId/hackathon/:hackathonId", async (req, res) => {
  try {
    const { userId, hackathonId } = req.params;
    const Team = (await import("../model/team")).default;
    const User = (await import("../model/user")).default;
    
    // Get user's team in this hackathon
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find team where user is a member or team creator
    const teams = await Team.find({
      hackathonId: hackathonId,
      $or: [
        { teamMembers: { $in: [user._id] } },
        { createdBy: user._id }
      ]
    }).populate('teamMembers', 'name email role').populate('createdBy', 'name email');

    const team = teams && teams.length > 0 ? teams[0] : null;
    
    if (!team) {
      return res.status(200).json({
        message: "User is not in any team for this hackathon",
        team: null,
        isInTeam: false
      });
    }
    
    res.status(200).json({
      message: "Team found",
      team,
      isInTeam: true
    });
  } catch (error) {
    console.error("Error fetching user team:", error);
    res.status(500).json({ message: "Error fetching team", error: String(error) });
  }
});

router.get("/hackathon/:hackathonId", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const Team = (await import("../model/team")).default;
    
    // Get teams for specific hackathon
    const teams = await Team.find({ hackathonId }).populate('teamMembers', 'name email role').populate('createdBy', 'name email');
    
    res.status(200).json({
      message: `Found ${teams.length} teams for hackathon`,
      teams,
      count: teams.length
    });
  } catch (error) {
    console.error("Error fetching teams by hackathon:", error);
    res.status(500).json({ message: "Error fetching teams", error: String(error) });
  }
});
router.post("/delete-team", deleteTeam);

export default router; 