import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../model/user';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private connectionAttempts: Map<string, number> = new Map(); // userId -> attempt count
  private maxConnectionAttempts = 3;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [
              'https://masai-hackathon-frontend.netlify.app',
              'https://masai-hackathon-frontend.netlify.app/',
              'https://masai-hackathon-frontend.netlify.app/*',
              'https://masai-hackathon.netlify.app',
              'https://masai-hackathon.netlify.app/',
              'https://masai-hackathon.netlify.app/*',
              'https://masai-hackathon.onrender.com',
              'https://masai-hackathon.onrender.com/'
            ] 
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      },
      // More flexible connection settings for better stability
      pingTimeout: 120000, // 2 minutes
      pingInterval: 30000, // 30 seconds
      transports: ['websocket', 'polling'], // Allow both WebSocket and polling fallback
      allowEIO3: true,
      maxHttpBufferSize: 1e6, // 1MB
      // Additional stability settings
      upgradeTimeout: 10000,
      allowUpgrades: true,
      serveClient: false
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('❌ WebSocket: No authentication token provided');
          return next(new Error('Authentication token required'));
        }

        // Check if user is already connected (prevent duplicate connections)
        const existingSocketId = this.connectedUsers.get(token);
        if (existingSocketId && existingSocketId !== socket.id) {
          console.log(`🔄 User ${token} already connected, disconnecting duplicate`);
          return next(new Error('User already connected'));
        }

        // Rate limit connection attempts
        const attempts = this.connectionAttempts.get(token) || 0;
        if (attempts >= this.maxConnectionAttempts) {
          console.log(`🚫 User ${token} exceeded max connection attempts`);
          return next(new Error('Too many connection attempts'));
        }

        let user;
        try {
          // Try JWT first
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            user = await User.findById(decoded.userId);
            console.log('✅ WebSocket: JWT authentication successful');
          }
        } catch (jwtError) {
          console.log('⚠️ WebSocket: JWT verification failed, trying userId fallback');
          // Fallback to userId as token (for backward compatibility)
          try {
            user = await User.findById(token);
            if (user) {
              console.log('✅ WebSocket: UserId fallback authentication successful');
            }
          } catch (userIdError) {
            console.log('❌ WebSocket: Both JWT and userId authentication failed');
          }
        }

        if (!user) {
          console.log('❌ WebSocket: User not found');
          return next(new Error('User not found'));
        }

        if (!user.isVerified) {
          console.log('❌ WebSocket: User not verified');
          return next(new Error('User not verified'));
        }

        // Attach user info to socket
        socket.userId = (user._id as any).toString();
        socket.userEmail = user.email;
        socket.userRole = user.role;

        // Reset connection attempts on successful auth
        this.connectionAttempts.delete(token);

        console.log(`✅ WebSocket: User authenticated successfully - ${user.email} (${socket.userId})`);
        next();
      } catch (error) {
        // Increment connection attempts
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const attempts = (this.connectionAttempts.get(token) || 0) + 1;
          this.connectionAttempts.set(token, attempts);
        }

        console.error('❌ WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      // Only log connection if it's a new user or after a reasonable delay
      const userId = socket.userId;
      if (userId) {
        const lastConnection = this.connectedUsers.get(userId);
        
        if (!lastConnection || lastConnection !== socket.id) {
          console.log(`🔌 User connected: ${socket.userEmail} (${socket.userId})`);
        }
      }

      // Store the user's socket connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join user to their personal notification room
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
        // Only log room joining occasionally to reduce noise
        if (Math.random() < 0.1) { // Log only 10% of room joins
          console.log(`👤 User ${socket.userEmail} joined room: user_${socket.userId}`);
        }
      }

      // Handle joining hackathon rooms
      socket.on('join_hackathon', (hackathonId: string) => {
        if (hackathonId) {
          socket.join(`hackathon_${hackathonId}`);
          // Only log hackathon joins occasionally
          if (Math.random() < 0.05) { // Log only 5% of hackathon joins
            console.log(`🏆 User ${socket.userEmail} joined hackathon room: ${hackathonId}`);
          }
        }
      });

      // Handle leaving hackathon rooms
      socket.on('leave_hackathon', (hackathonId: string) => {
        if (hackathonId) {
          socket.leave(`hackathon_${hackathonId}`);
          // Only log hackathon leaves occasionally
          if (Math.random() < 0.05) { // Log only 5% of hackathon leaves
            console.log(`🚪 User ${socket.userEmail} left hackathon room: ${hackathonId}`);
          }
        }
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        // Only log disconnects occasionally to reduce noise
        if (Math.random() < 0.01) { // Log only 1% of disconnects
          console.log(`🔌 User disconnected: ${socket.userEmail} (${socket.userId}) - Reason: ${reason}`);
        }
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    // Handle server errors
    this.io.engine.on('connection_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', notification);
    console.log(`📨 Sent notification to user ${userId}:`, notification.title);
  }

  // Send notification to all users in a hackathon
  public sendNotificationToHackathon(hackathonId: string, notification: any) {
    this.io.to(`hackathon_${hackathonId}`).emit('notification', notification);
    console.log(`📢 Sent notification to hackathon ${hackathonId}:`, notification.title);
  }

  // Send team update to team members
  public sendTeamUpdate(teamMemberIds: string[], update: any) {
    teamMemberIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('team_update', update);
    });
    console.log(`👥 Sent team update to ${teamMemberIds.length} members:`, update.type);
  }

  // Send real-time team invitation
  public sendTeamInvitation(userId: string, invitation: any) {
    this.io.to(`user_${userId}`).emit('team_invitation', invitation);
    console.log(`🎯 Sent team invitation to user ${userId}:`, invitation.teamName);
  }

  // Send real-time poll update to team members
  public sendPollUpdate(teamMemberIds: string[], pollData: any) {
    teamMemberIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('poll_update', pollData);
    });
    console.log(`🗳️ Sent poll update to ${teamMemberIds.length} team members:`, pollData.type);
  }

  // Send real-time vote update to team members
  public sendVoteUpdate(teamMemberIds: string[], voteData: any) {
    teamMemberIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('vote_update', voteData);
    });
    console.log(`🗳️ Sent vote update to ${teamMemberIds.length} team members:`, voteData.problemStatementId);
  }

  // Send poll conclusion notification to team members
  public sendPollConclusion(teamMemberIds: string[], conclusionData: any) {
    teamMemberIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('poll_conclusion', conclusionData);
    });
    console.log(`🏁 Sent poll conclusion to ${teamMemberIds.length} team members:`, conclusionData.winningProblemStatement);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get WebSocket server instance
  public getIO(): SocketIOServer {
    return this.io;
  }

  // Cleanup method for graceful shutdown
  public cleanup() {
    this.connectedUsers.clear();
    this.connectionAttempts.clear();
    if (this.io) {
      this.io.close();
    }
  }
}

export default WebSocketService;

// Export a singleton instance for use in routes
let websocketInstance: WebSocketService | null = null;

export const initializeWebSocket = (server: HTTPServer) => {
  if (!websocketInstance) {
    websocketInstance = new WebSocketService(server);
  }
  return websocketInstance;
};

export const getWebSocketInstance = () => {
  if (!websocketInstance) {
    throw new Error('WebSocket service not initialized. Call initializeWebSocket first.');
  }
  return websocketInstance;
};
