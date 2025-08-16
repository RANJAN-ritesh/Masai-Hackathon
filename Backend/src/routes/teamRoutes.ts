import express from "express";
import { createTeams, deleteTeam, getTeams } from "../controller/teamController";


const router = express.Router();

router.post("/create-team", createTeams);
router.get("/get-teams", getTeams);
// router.get("/:user/my-team",);
router.post("/delete-team", deleteTeam);

export default router;

