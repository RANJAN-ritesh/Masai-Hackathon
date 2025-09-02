import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controller/notificationController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticateUser);

// Get notifications for a user
router.get('/:userId', getUserNotifications);

// Mark notification as read
router.put('/:userId/read/:notificationId', markNotificationAsRead);

// Mark all notifications as read
router.put('/:userId/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:userId/:notificationId', deleteNotification);

export default router;
