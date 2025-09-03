import express from "express";
import { 
  createParticipantTeam, 
  sendJoinRequest, 
  leaveTeam, 
  sendInvitation,
  respondToRequest,
  respondToInvitation,
  finalizeTeam,
  getUserRequests,
  getHackathonParticipants
} from "../controller/participantTeamController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Create a new team
router.post('/create-team', authenticateUser, createParticipantTeam);

// Send join request to a team
router.post('/send-request', authenticateUser, sendJoinRequest);

// Leave current team
router.post('/leave-team', authenticateUser, leaveTeam);

// Send invitation to a participant
router.post('/send-invitation', authenticateUser, sendInvitation);

// Respond to a join request (for team creators)
router.put('/respond-request/:requestId', authenticateUser, respondToRequest);

// Respond to an invitation (for participants receiving invitations)
router.put('/respond-invitation/:requestId', authenticateUser, respondToInvitation);

// Finalize team
router.put('/finalize-team/:teamId', authenticateUser, finalizeTeam);

// Get team requests (for team creators)
router.get('/requests', authenticateUser, getUserRequests);

// Get hackathon participants
router.get('/participants/:hackathonId', authenticateUser, getHackathonParticipants);

export default router; 