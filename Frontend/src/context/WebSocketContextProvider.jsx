import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { MyContext } from './AuthContextProvider';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { isAuth, userData } = useContext(MyContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  const connectSocket = () => {
    if (!isAuth || !userData) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    console.log('🔌 Connecting to WebSocket...');

    const newSocket = io(baseURL, {
      auth: {
        token: userId // Using userId as token (matches backend auth fallback)
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('🟢 WebSocket connected successfully');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Join user's notification room
      if (userData?.currentHackathon?._id) {
        newSocket.emit('join_hackathon', userData.currentHackathon._id);
      }
      
      toast.success('Connected to real-time updates!', { autoClose: 3000 });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason);
      setIsConnected(false);
      
      // Auto-reconnect on disconnect (unless manual)
      if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connectSocket();
        }, delay);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Real-time notification handlers
    newSocket.on('notification', (notification) => {
      console.log('📨 Received real-time notification:', notification);
      
      // Add notification to local state
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.title, {
        icon: getNotificationIcon(notification.type),
        autoClose: 5000
      });
    });

    newSocket.on('team_invitation', (invitation) => {
      console.log('🎯 Received team invitation:', invitation);
      toast.success(`Team invitation from ${invitation.teamName}!`, {
        autoClose: 8000
      });
    });

    newSocket.on('join_request', (request) => {
      console.log('📝 Received join request:', request);
      toast.info(`Join request for ${request.teamName}!`, {
        autoClose: 8000
      });
    });

    newSocket.on('team_update', (update) => {
      console.log('👥 Received team update:', update);
      toast.info(`Team update: ${update.message}`, {
        autoClose: 5000
      });
    });

    // Ping/pong for connection health
    newSocket.on('pong', () => {
      console.log('🏓 Pong received');
    });

    setSocket(newSocket);

    return newSocket;
  };

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinHackathon = (hackathonId) => {
    if (socket && isConnected) {
      socket.emit('join_hackathon', hackathonId);
      console.log(`🏆 Joined hackathon room: ${hackathonId}`);
    }
  };

  const leaveHackathon = (hackathonId) => {
    if (socket && isConnected) {
      socket.emit('leave_hackathon', hackathonId);
      console.log(`🚪 Left hackathon room: ${hackathonId}`);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notification icon for toast
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invitation':
        return '🎯';
      case 'join_request':
        return '📝';
      case 'team_finalized':
        return '🎉';
      case 'ownership_transferred':
        return '🔄';
      default:
        return '📢';
    }
  };

  // Connect/disconnect based on auth status
  useEffect(() => {
    if (isAuth && userData) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuth, userData]);

  // Health check ping every 30 seconds
  useEffect(() => {
    if (!socket || !isConnected) return;

    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [socket, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    joinHackathon,
    leaveHackathon,
    markNotificationAsRead,
    clearAllNotifications,
    connectSocket,
    disconnectSocket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
