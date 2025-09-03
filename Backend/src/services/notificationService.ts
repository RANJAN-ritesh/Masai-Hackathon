import { INotification } from '../model/notification';

// Interface for notification data without Mongoose-specific fields
interface NotificationData {
  _id?: string;
  userId: string;
  hackathonId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

// In-memory notification store
class NotificationService {
  private notifications: Map<string, NotificationData[]> = new Map();
  private maxNotificationsPerUser = 50; // Keep only last 50 notifications per user

  // Add notification for a user
  addNotification(userId: string, notification: NotificationData, sendRealTime: boolean = true): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId)!;
    
    // Create notification object
    const newNotification = {
      ...notification,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to beginning of array
    userNotifications.unshift(newNotification);

    // Keep only last maxNotificationsPerUser notifications
    if (userNotifications.length > this.maxNotificationsPerUser) {
      userNotifications.splice(this.maxNotificationsPerUser);
    }

    // Update the map
    this.notifications.set(userId, userNotifications);

    // Send real-time notification via WebSocket if enabled
    if (sendRealTime) {
      this.sendRealTimeNotification(userId, newNotification);
    }
  }

  // Send real-time notification via WebSocket
  private sendRealTimeNotification(userId: string, notification: NotificationData): void {
    try {
      // Dynamically import WebSocket service to avoid circular dependencies
      import('../app').then(({ webSocketService }) => {
        if (webSocketService) {
          webSocketService.sendNotificationToUser(userId, notification);
        }
      }).catch(error => {
        console.log('WebSocket service not available:', error.message);
      });
    } catch (error) {
      console.log('Failed to send real-time notification:', error);
    }
  }

  // Get notifications for a user
  getNotifications(userId: string, limit: number = 20): NotificationData[] {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(0, limit);
  }

  // Mark notification as read
  markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n._id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      return true;
    }
    return false;
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(notification => {
        notification.isRead = true;
        notification.readAt = new Date();
      });
    }
  }

  // Get unread count for a user
  getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.isRead).length;
  }

  // Delete notification
  deleteNotification(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex(n => n._id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  // Clear all notifications for a user
  clearNotifications(userId: string): void {
    this.notifications.delete(userId);
  }

  // Send platform-wide notification (for auto team creation, etc.)
  sendPlatformNotification(hackathonId: string, type: string, title: string, message: string): void {
    // This would typically get all users in a hackathon
    // For now, we'll store it in a special "platform" key
    const platformKey = `platform_${hackathonId}`;
    
    this.addNotification(platformKey, {
      userId: "platform",
      hackathonId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Get platform notifications for a specific hackathon
  getPlatformNotifications(hackathonId: string): NotificationData[] {
    const platformKey = `platform_${hackathonId}`;
    return this.getNotifications(platformKey, 10);
  }

  // Generate unique ID for notifications
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clean up old notifications (run periodically)
  cleanupOldNotifications(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (const [userId, notifications] of Array.from(this.notifications.entries())) {
      const filteredNotifications = notifications.filter(
        notification => notification.createdAt > oneWeekAgo
      );
      
      if (filteredNotifications.length !== notifications.length) {
        this.notifications.set(userId, filteredNotifications);
      }
    }
  }
}

// Create notification for auto team creation
export const createAutoTeamCreationNotification = (
  userId: string,
  hackathonId: string,
  teamsCreated: number
): NotificationData => ({
  userId,
  hackathonId,
  type: "auto_team_creation",
  title: "Teams Auto-Created",
  message: `${teamsCreated} teams have been automatically created for remaining participants. Check your team assignment.`,
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const notificationService = new NotificationService();

// Helper functions for common notification types
export const createTeamFinalizedNotification = (userId: string, hackathonId: string, teamName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "team_finalized",
    title: "Team Finalized! 🎉",
    message: `Your team "${teamName}" has been finalized and is now locked for the hackathon.`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const createRequestReceivedNotification = (userId: string, hackathonId: string, fromUserName: string, teamName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "request_received",
    title: "New Team Request! 📨",
    message: `${fromUserName} wants to join your team "${teamName}". Check your requests to respond.`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const createOwnershipTransferredNotification = (userId: string, hackathonId: string, teamName: string, newOwnerName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "ownership_transferred",
    title: "Team Ownership Transferred 🔄",
    message: `Team ownership for "${teamName}" has been transferred to ${newOwnerName}.`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Singleton pattern for the notification service
export const getNotificationService = (): NotificationService => {
  return notificationService;
};

// Additional notification helper functions
export const createInvitationReceivedNotification = (userId: string, hackathonId: string, teamName: string, fromUserName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "team_invitation",
    title: "Team Invitation! 🎯",
    message: `${fromUserName} invited you to join team "${teamName}". Check your invitations to respond.`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const createInvitationAcceptedNotification = (userId: string, hackathonId: string, participantName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "invitation_accepted",
    title: "Invitation Accepted! ✅",
    message: `${participantName} has accepted your team invitation. Your team is growing!`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const createInvitationRejectedNotification = (userId: string, hackathonId: string, participantName: string) => {
  notificationService.addNotification(userId, {
    userId,
    hackathonId,
    type: "invitation_rejected",
    title: "Invitation Declined ❌",
    message: `${participantName} has declined your team invitation. You can invite other participants.`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}; 