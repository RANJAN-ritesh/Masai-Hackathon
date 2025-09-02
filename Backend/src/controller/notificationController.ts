import { Request, Response } from 'express';
import {
  createAutoTeamCreationNotification,
  createTeamFinalizedNotification,
  createRequestReceivedNotification,
  createOwnershipTransferredNotification,
  getNotificationService
} from '../services/notificationService';

// Get notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '20' } = req.query;

    const notificationService = getNotificationService();
    const notifications = notificationService.getNotifications(userId, parseInt(limit as string));
    const unreadCount = notificationService.getUnreadCount(userId);

    res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, notificationId } = req.params;

    const notificationService = getNotificationService();
    const success = notificationService.markAsRead(userId, notificationId);

    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const notificationService = getNotificationService();
    notificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { userId, notificationId } = req.params;

    const notificationService = getNotificationService();
    const success = notificationService.deleteNotification(userId, notificationId);

    if (success) {
      res.json({ message: 'Notification deleted' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
