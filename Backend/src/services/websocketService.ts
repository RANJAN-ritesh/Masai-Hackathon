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

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [
              process.env.CORS_ORIGIN || 'https://masai-hackathon.netlify.app',
              'https://masai-hackathon.netlify.app'
            ] 
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        let user;
        try {
          // Try JWT first
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            user = await User.findById(decoded.userId);
          }
        } catch (jwtError) {
          // Fallback to userId as token (temporary)
          user = await User.findById(token);
        }

        if (!user) {
          return next(new Error('User not found'));
        }

        if (!user.isVerified) {
          return next(new Error('User not verified'));
        }

        // Attach user info to socket
        socket.userId = (user._id as any).toString();
        socket.userEmail = user.email;
        socket.userRole = user.role;

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User connected: ${socket.userEmail} (${socket.userId})`);

      // Store the user's socket connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join user to their personal notification room
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
        console.log(`👤 User ${socket.userEmail} joined room: user_${socket.userId}`);
      }

      // Handle joining hackathon rooms
      socket.on('join_hackathon', (hackathonId: string) => {
        if (hackathonId) {
          socket.join(`hackathon_${hackathonId}`);
          console.log(`🏆 User ${socket.userEmail} joined hackathon room: ${hackathonId}`);
        }
      });

      // Handle leaving hackathon rooms
      socket.on('leave_hackathon', (hackathonId: string) => {
        if (hackathonId) {
          socket.leave(`hackathon_${hackathonId}`);
          console.log(`🚪 User ${socket.userEmail} left hackathon room: ${hackathonId}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.userEmail} (${socket.userId})`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
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

  // Send real-time join request
  public sendJoinRequest(userId: string, request: any) {
    this.io.to(`user_${userId}`).emit('join_request', request);
    console.log(`📝 Sent join request to user ${userId}:`, request.teamName);
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
}

export default WebSocketService;
