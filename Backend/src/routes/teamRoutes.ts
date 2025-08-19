import express from "express";
import { createTeams, getTeams, deleteTeam } from "../controller/teamController";

const router = express.Router();

router.post("/create-team", createTeams);
router.get("/get-teams", getTeams); // Get all teams
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

