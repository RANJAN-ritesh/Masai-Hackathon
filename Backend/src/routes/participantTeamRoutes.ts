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

// TEMPORARY: Public endpoint to test participant fetching without auth
router.get('/test-participants/:hackathonId', async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const User = (await import('../model/user')).default;
    const Hackathon = (await import('../model/hackathon')).default;
    
    console.log(`🔍 TEST: Fetching participants for hackathon: ${hackathonId}`);
    
    // Check hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    console.log(`✅ TEST: Hackathon found: ${hackathon.title}`);
    
    // Get all users with this hackathonId
    const participants = await User.find({
      hackathonIds: { $in: [hackathonId] }
    }).select('-password');
    
    console.log(`🔍 TEST: Found ${participants.length} participants`);
    
    res.json({
      success: true,
      hackathonTitle: hackathon.title,
      participants,
      count: participants.length,
      message: `Found ${participants.length} participants in ${hackathon.title}`,
      debug: {
        hackathonId,
        query: `hackathonIds: { $in: [${hackathonId}] }`
      }
    });
    
  } catch (error) {
    console.error('TEST: Error fetching participants:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
});

// Debug authentication endpoint
router.get('/debug-auth', authenticateUser, (req, res) => {
  res.json({
    message: 'Authentication working',
    user: req.user,
    headers: {
      authorization: req.headers.authorization ? 'present' : 'missing'
    }
  });
});

// Apply authentication to all routes EXCEPT the test route
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