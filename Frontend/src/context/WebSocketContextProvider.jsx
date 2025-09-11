import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { MyContext } from './AuthContextProvider';

const WebSocketContext = createContext();

// Global socket instance to prevent multiple connections
let globalSocket = null;
let globalConnectionPromise = null;

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { isAuth, userData } = useContext(MyContext);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [voteUpdateCallbacks, setVoteUpdateCallbacks] = useState([]);
  const [pollUpdateCallbacks, setPollUpdateCallbacks] = useState([]);
  const [pollConclusionCallbacks, setPollConclusionCallbacks] = useState([]);
  const [chatMessageCallbacks, setChatMessageCallbacks] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 3; // Reduced from 5
  const reconnectAttempts = useRef(0);
  const isConnectingRef = useRef(false);

  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  const connectSocket = async () => {
    if (!isAuth || !userData) return null;

    const userId = localStorage.getItem("userId");
    if (!userId) return null;

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('🔌 Connection already in progress, waiting...');
      return globalConnectionPromise;
    }

    // If we already have a connected socket, return it
    if (globalSocket && globalSocket.connected) {
      console.log('🔌 Using existing WebSocket connection');
      return globalSocket;
    }

    // If we have a pending connection promise, return it
    if (globalConnectionPromise) {
      console.log('🔌 Using existing connection promise');
      return globalConnectionPromise;
    }

    isConnectingRef.current = true;
    console.log('🔌 Creating new WebSocket connection...');

    globalConnectionPromise = new Promise((resolve, reject) => {
      try {
        // Disconnect any existing socket
        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
        }

        const newSocket = io(baseURL, {
          auth: {
            token: localStorage.getItem('authToken') || userId // Try JWT first, fallback to userId
          },
          transports: ['websocket', 'polling'], // Allow both WebSocket and polling fallback
          timeout: 10000, // Increased timeout for better reliability
          forceNew: false, // Don't force new connection
          reconnection: true, // Enable automatic reconnection
          reconnectionAttempts: 5, // Allow more reconnection attempts
          reconnectionDelay: 2000, // Start with 2 second delay
          reconnectionDelayMax: 10000, // Max 10 second delay
          maxReconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
          console.log('🟢 WebSocket connected successfully');
          setIsConnected(true);
          reconnectAttempts.current = 0;
          isConnectingRef.current = false;
          
          // Join user's notification room
          if (userData?.currentHackathon?._id) {
            newSocket.emit('join_hackathon', userData.currentHackathon._id);
          }
          
          // Only show toast on first connection, not reconnections
          if (reconnectAttempts.current === 0) {
            toast.success('Connected to real-time updates!', { autoClose: 2000 });
          }
          
          globalSocket = newSocket;
          resolve(newSocket);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('🔴 WebSocket disconnected:', reason);
          setIsConnected(false);
          isConnectingRef.current = false;
          
          // Show user-friendly message for different disconnect reasons
          if (reason === 'io server disconnect') {
            toast.warning('Connection lost. Attempting to reconnect...', { autoClose: 3000 });
          } else if (reason === 'transport close') {
            toast.info('Connection interrupted. Reconnecting...', { autoClose: 3000 });
          }
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
          toast.success('Reconnected to real-time updates!', { autoClose: 2000 });
          
          // Rejoin hackathon room after reconnection
          if (userData?.currentHackathon?._id) {
            newSocket.emit('join_hackathon', userData.currentHackathon._id);
          }
        });

        newSocket.on('reconnect_error', (error) => {
          console.error('🔴 WebSocket reconnection error:', error);
          toast.error('Failed to reconnect. Please refresh the page.', { autoClose: 5000 });
        });

        newSocket.on('reconnect_failed', () => {
          console.log('❌ WebSocket reconnection failed after all attempts');
          toast.error('Connection lost. Please refresh the page to reconnect.', { autoClose: 8000 });
        });

        newSocket.on('connect_error', (error) => {
          console.error('🔴 WebSocket connection error:', error);
          setIsConnected(false);
          isConnectingRef.current = false;
          reject(error);
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

        // Polling-related WebSocket events
        newSocket.on('poll_update', (pollData) => {
          console.log('🗳️ Received poll update:', pollData);
          toast.info(`Poll update: ${pollData.message || 'Poll status changed'}`, {
            autoClose: 5000
          });
          
          // Call all registered poll update callbacks
          pollUpdateCallbacks.forEach(callback => {
            try {
              callback(pollData);
            } catch (error) {
              console.error('Error in poll update callback:', error);
            }
          });
        });

        newSocket.on('vote_update', (voteData) => {
          console.log('🗳️ Received vote update:', voteData);
          toast.info(`New vote cast for: ${voteData.problemStatementId}`, {
            autoClose: 3000
          });
          
          // Call all registered vote update callbacks
          voteUpdateCallbacks.forEach(callback => {
            try {
              callback(voteData);
            } catch (error) {
              console.error('Error in vote update callback:', error);
            }
          });
        });

        newSocket.on('chat_message', (chatData) => {
          console.log('💬 Received chat message:', chatData);
          
          // Call all registered chat message callbacks
          chatMessageCallbacks.forEach(callback => {
            try {
              callback(chatData);
            } catch (error) {
              console.error('Error in chat message callback:', error);
            }
          });
        });

        // Ping/pong for connection health
        newSocket.on('pong', () => {
          console.log('🏓 Pong received');
        });

        // Set a connection timeout
        setTimeout(() => {
          if (!newSocket.connected) {
            console.log('⏰ WebSocket connection timeout');
            newSocket.disconnect();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        isConnectingRef.current = false;
        reject(error);
      }
    });

    return globalConnectionPromise;
  };

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (globalSocket) {
      console.log('🔌 Disconnecting WebSocket...');
      globalSocket.disconnect();
      globalSocket = null;
      setIsConnected(false);
    }
    
    globalConnectionPromise = null;
    isConnectingRef.current = false;
    reconnectAttempts.current = 0;
  };

  const joinHackathon = (hackathonId) => {
    if (globalSocket && globalSocket.connected) {
      globalSocket.emit('join_hackathon', hackathonId);
      console.log(`🏆 Joined hackathon room: ${hackathonId}`);
    }
  };

  const leaveHackathon = (hackathonId) => {
    if (globalSocket && globalSocket.connected) {
      globalSocket.emit('leave_hackathon', hackathonId);
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
      // Don't disconnect on unmount, let the global instance handle it
    };
  }, [isAuth, userData?._id]); // Only depend on user ID, not entire userData object

  // Health check ping every 60 seconds (increased from 30)
  useEffect(() => {
    if (!globalSocket || !isConnected) return;

    const pingInterval = setInterval(() => {
      if (globalSocket && globalSocket.connected) {
        globalSocket.emit('ping');
      }
    }, 60000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only disconnect if this is the last component using the socket
      // The global socket will be cleaned up when the app unmounts
    };
  }, []);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      globalConnectionPromise = null;
      isConnectingRef.current = false;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Callback registration functions
  const registerVoteUpdateCallback = (callback) => {
    setVoteUpdateCallbacks(prev => [...prev, callback]);
    return () => {
      setVoteUpdateCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  const registerPollUpdateCallback = (callback) => {
    setPollUpdateCallbacks(prev => [...prev, callback]);
    return () => {
      setPollUpdateCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  const registerChatMessageCallback = (callback) => {
    setChatMessageCallbacks(prev => [...prev, callback]);
    return () => {
      setChatMessageCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  const value = {
    socket: globalSocket,
    isConnected,
    notifications,
    unreadCount,
    joinHackathon,
    leaveHackathon,
    markNotificationAsRead,
    clearAllNotifications,
    connectSocket,
    disconnectSocket,
    registerVoteUpdateCallback,
    registerPollUpdateCallback,
    registerPollConclusionCallback,
    registerChatMessageCallback
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
