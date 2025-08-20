import express from 'express';
import {
  createParticipantTeam,
  sendJoinRequest,
  respondToRequest,
  finalizeTeam,
  leaveTeam,
  transferOwnership,
  getUserRequests,
  getHackathonParticipants,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controller/participantTeamController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Participant team creation and management
router.post('/create-team', createParticipantTeam);
router.post('/send-request', sendJoinRequest);
router.put('/request/:requestId/respond', respondToRequest);
router.post('/team/:teamId/finalize', finalizeTeam);
router.post('/team/:teamId/leave', leaveTeam);
router.post('/team/:teamId/transfer-ownership', transferOwnership);

// Get user's requests and hackathon participants
router.get('/requests', getUserRequests);
router.get('/hackathon/:hackathonId/participants', getHackathonParticipants);

// Notification management
router.get('/notifications', getUserNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', deleteNotification);

export default router; 