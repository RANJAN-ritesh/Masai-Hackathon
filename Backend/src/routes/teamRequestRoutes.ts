import express from "express";
import { getPendingJoinRequests, sendJoinRequest, acceptJoinRequest, declineJoinRequest } from "../controller/teamRequestController.js";

const router = express.Router();

router.post("/send-request", sendJoinRequest);
router.get("/get-requests", async (req, res) => {
  try {
    // For now, return empty array - can be implemented later
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team requests" });
  }
});
router.get("/:teamId/join-requests", getPendingJoinRequests);
router.post("/accept-request", acceptJoinRequest);
router.post("/decline-request", declineJoinRequest);
export default router;