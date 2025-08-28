import express from "express";
import { createTeams, getTeams, deleteTeam } from "../controller/teamController";

const router = express.Router();

router.post("/create-team", createTeams);
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
    
    // Find team where user is a member
    const team = await Team.findOne({
      hackathonId: hackathonId,
      teamMembers: { $in: [userId] }
    }).populate('teamMembers', 'name email role').populate('createdBy', 'name email');
    
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

