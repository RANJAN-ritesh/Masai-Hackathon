import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, Users, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useWebSocket } from '../context/WebSocketContextProvider';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { notifications, unreadCount, markNotificationAsRead } = useWebSocket();
  const [localNotifications, setLocalNotifications] = useState([]);
  const [invitationLoading, setInvitationLoading] = useState(new Set());
  const baseURL = 'https://masai-hackathon.onrender.com';

  // Load notifications on mount and when opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Merge WebSocket notifications with API notifications
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invitation':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'join_request':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'team_finalized':
        return <Check className="h-5 w-5 text-purple-500" />;
      case 'ownership_transferred':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Load notifications from backend
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`${baseURL}/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications) {
          // Merge API notifications with WebSocket notifications
          const apiNotifications = data.notifications;
          const mergedNotifications = [...notifications, ...apiNotifications]
            .reduce((acc, current) => {
              const existing = acc.find(item => item._id === current._id);
              if (!existing) {
                acc.push(current);
              }
              return acc;
            }, [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setLocalNotifications(mergedNotifications);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`${baseURL}/notifications/${userId}/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      if (response.ok) {
        setLocalNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        // Also update WebSocket context
        markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`${baseURL}/notifications/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      if (response.ok) {
        setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Handle invitation response
  const respondToInvitation = async (notificationId, requestId, response) => {
    if (invitationLoading.has(requestId)) return;
    
    setInvitationLoading(prev => new Set([...prev, requestId]));
    
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem('authToken') || userId;
      
      if (!userId || !token) {
        toast.error('User authentication required');
        return;
      }

      console.log('🔍 Responding to invitation from notification:', { requestId, response });
      
      const res = await fetch(`${baseURL}/participant-team/respond-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          response,
          message: response === 'accepted' ? 'I accept your invitation!' : 'I decline your invitation.'
        })
      });

      if (res.ok) {
        if (response === 'accepted') {
          toast.success('Invitation accepted! You are now part of the team!');
        } else {
          toast.success('Invitation declined successfully.');
        }
        
        // Mark notification as read
        await markAsRead(notificationId);
        
        // Reload notifications to update status
        await loadNotifications();
        
      } else {
        const error = await res.json();
        console.error('Error response:', error);
        toast.error(error.message || `Failed to ${response} invitation`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(`Failed to ${response} invitation`);
    } finally {
      setInvitationLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`${baseURL}/notifications/${userId}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      if (response.ok) {
        setLocalNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : localNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">No notifications</p>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.isRead
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(notification.createdAt)}
                        </div>
                        
                        {/* Invitation action buttons */}
                        {notification.type === 'team_invitation' && notification.metadata?.requestId && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button
                              onClick={() => respondToInvitation(notification._id, notification.metadata.requestId, 'accepted')}
                              disabled={invitationLoading.has(notification.metadata.requestId)}
                              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white'
                              }}
                            >
                              {invitationLoading.has(notification.metadata.requestId) ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => respondToInvitation(notification._id, notification.metadata.requestId, 'rejected')}
                              disabled={invitationLoading.has(notification.metadata.requestId)}
                              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white'
                              }}
                            >
                              {invitationLoading.has(notification.metadata.requestId) ? 'Declining...' : 'Decline'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                        title="Delete notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;