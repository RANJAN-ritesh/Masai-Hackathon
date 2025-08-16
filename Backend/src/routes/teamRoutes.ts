import express from "express";
import { createTeams, deleteTeam, getTeams } from "../controller/teamController";


const router = express.Router();

router.post("/create-team", createTeams);
router.get("/get-teams", getTeams);
// Add route that frontend expects - get teams by hackathon ID
router.get("/:hackathonId", getTeams); // For now, return all teams regardless of hackathon
router.post("/delete-team", deleteTeam);

export default router;

