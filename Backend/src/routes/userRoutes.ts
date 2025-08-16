import express from "express";
import { verifyUser, getUserById, leaveTeam, createUser } from "../controller/userController";
import { validateUserInput } from "../middleware/validation";

const router = express.Router();

router.post("/create-user", validateUserInput, createUser);
router.post("/verify-user", validateUserInput, verifyUser);
router.get("/get-user/:userId", getUserById);
router.post("/leave-team", leaveTeam);


export default router;