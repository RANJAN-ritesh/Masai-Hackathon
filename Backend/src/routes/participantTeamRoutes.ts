import * as express from 'express';
import { authenticateUser } from '../middleware/auth';
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
  deleteNotification,
  sendInvitation
} from '../controller/participantTeamController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Team creation and management
router.post('/create-team', createParticipantTeam);
router.post('/send-request', sendJoinRequest);
router.post('/send-invitation', sendInvitation);
router.put('/respond-request/:requestId', respondToRequest);
router.put('/finalize-team/:teamId', finalizeTeam);
router.put('/leave-team/:teamId', leaveTeam);
router.put('/transfer-ownership/:teamId', transferOwnership);

// Data retrieval
router.get('/requests', getUserRequests);
router.get('/participants/:hackathonId', getHackathonParticipants);
router.get('/notifications', getUserNotifications);

// Notification management
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', deleteNotification);

export default router; 