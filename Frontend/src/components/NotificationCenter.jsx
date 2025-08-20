import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star,
  Users,
  Crown,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const { userData } = useContext(MyContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  const fetchNotifications = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
      const response = await fetch(`${baseURL}/participant-team/notifications`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
      const response = await fetch(`${baseURL}/participant-team/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId 
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
      const response = await fetch(`${baseURL}/participant-team/notifications/read-all`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
      const response = await fetch(`${baseURL}/participant-team/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n._id === notificationId);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_finalized':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'request_received':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'request_accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'request_rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'auto_team_creation':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'hackathon_starting':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'team_locked':
        return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'ownership_transferred':
        return <Crown className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'team_finalized':
        return 'border-l-green-500 bg-green-50';
      case 'request_received':
        return 'border-l-green-500 bg-blue-50';
      case 'request_accepted':
        return 'border-l-green-500 bg-green-50';
      case 'request_rejected':
        return 'border-l-red-500 bg-red-50';
      case 'auto_team_creation':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'hackathon_starting':
        return 'border-l-purple-500 bg-purple-50';
      case 'team_locked':
        return 'border-l-indigo-500 bg-indigo-500';
      case 'ownership_transferred':
        return 'border-l-amber-500 bg-amber-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={toggleNotifications}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400">We'll notify you about important updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-200 border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.isRead ? 'bg-white' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                                </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-600" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Delete notification"
                              >
                                <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={toggleNotifications}
        />
      )}
    </>
  );
};

export default NotificationCenter; 