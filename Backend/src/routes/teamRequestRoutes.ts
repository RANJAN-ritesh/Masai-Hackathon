import express from "express";
import { getPendingJoinRequests, sendJoinRequest, acceptJoinRequest, declineJoinRequest } from "../controller/teamRequestController";

const router = express.Router();

router.post("/send-request", sendJoinRequest);
router.get("/:teamId/join-requests", getPendingJoinRequests);
router.post("/accept-request", acceptJoinRequest);
router.post("/decline-request", declineJoinRequest);
export default router;