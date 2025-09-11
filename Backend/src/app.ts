import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./model/db";
import user from "./model/user";
import team from "./model/team";
import teamRequests from "./model/teamRequests";
import problemStatement from "./model/problemStatement";
import { autoTeamCreationService } from "./services/autoTeamCreationService";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import teamRequestRoutes from "./routes/teamRequestRoutes";
import problemStatementRoutes from "./routes/problemStatementRoutes";
import participantTeamRoutes from "./routes/participantTeamRoutes";
import problemStatementManagementRoutes from "./routes/problemStatementRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import cleanupService from "./services/cleanupService";
import User from "./model/user";
import Hackathon from "./model/hackathon";
import { initializeWebSocket } from "./services/websocketService";
import teamPollingRoutes from "./routes/teamPollingRoutes";
import simplePollingRoutes from "./routes/simplePollingRoutes";
import chatRoutes from "./routes/chatRoutes";
import teamReportingRoutes from "./routes/teamReportingRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import adminRoutes from "./routes/adminRoutes";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        console.error(`Please set ${envVar} in your environment or .env file`);
        process.exit(1);
    }
}

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5009;

// Trust proxy for rate limiting (required for Render deployment)
app.set('trust proxy', 1);

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Rate limiting with trusted proxy
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Increased limit for better UX
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for WebSocket upgrade requests
    skip: (req) => {
        return req.headers.upgrade === 'websocket' || 
               req.path.startsWith('/socket.io/') ||
               req.path === '/health';
    }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://masai-hackathon.netlify.app',
            'https://masai-hackathon.netlify.app/',
            'https://masai-hackathon.netlify.app/*',
            'https://*.netlify.app'  // Allow all Netlify subdomains as fallback
          ] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false
};

app.use(cors(corsOptions));

connectDB();

// Routes
app.use("/users", userRoutes);
app.use("/team", teamRoutes);
app.use("/team-request", teamRequestRoutes);
app.use("/hackathons", problemStatementRoutes); // Mount hackathon routes at /hackathons level
app.use("/participant-team", participantTeamRoutes); // Enable participant team routes
app.use("/problem-statements", problemStatementManagementRoutes); // Problem statement management routes
app.use("/notifications", notificationRoutes); // Notification routes
app.use("/team-polling", teamPollingRoutes); // Team polling routes for problem statements
app.use("/simple-polling", simplePollingRoutes); // Simple polling routes
app.use("/chat", chatRoutes); // Team chat routes
app.use("/team-reporting", teamReportingRoutes); // Team member reporting routes
app.use("/submission", submissionRoutes); // Project submission routes
app.use("/admin", adminRoutes); // Admin functionality routes

// EMERGENCY DEBUG ROUTE - NO AUTHENTICATION
app.get("/debug-participants/:hackathonId", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    console.log(`🔍 DEBUG: Fetching participants for hackathon: ${hackathonId}`);
    
    // Check hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    console.log(`✅ DEBUG: Hackathon found: ${hackathon.title}`);
    
    // Get all users with this hackathonId
    const participants = await User.find({
      hackathonIds: { $in: [hackathonId] }
    }).select('-password');
    
    console.log(`🔍 DEBUG: Found ${participants.length} participants`);
    
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
    console.error('DEBUG: Error fetching participants:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
});

// SIMPLE PARTICIPANTS ENDPOINT - NO AUTH, NO COMPLEXITY, JUST WORKS
app.get("/participants/:hackathonId", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    // 1. Get hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }
    
    // 2. Get participants
    const participants = await User.find({
      hackathonIds: { $in: [hackathonId] }
    }).select('-password');
    
    // 3. Return data
    res.json({
      success: true,
      hackathonTitle: hackathon.title,
      participants,
      count: participants.length
    });
    
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Error fetching participants' });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Masai Hackathon Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    schemaVersion: "2.1.8", // Updated with invitation fixes and notification improvements
    buildTime: new Date().toISOString(),
    autoTeamCreationService: "running",
    cleanupService: "running",
    websocketService: "running",
    corsOrigin: process.env.NODE_ENV === 'production' ? 'https://masai-hackathon.netlify.app' : 'localhost'
  });
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.get("/",(req, res)=>{
    res.send("health check - backend is live! CRUD operations fixed! Team routes added! Team member limit increased to 10! MONGODB INTEGRATION COMPLETE! Hackathons now persist in database! 🎯🚀") // Updated to force redeploy
})

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 DEPLOYMENT TIME: ${new Date().toISOString()}`);
    
    // Initialize WebSocket service
    initializeWebSocket(server);
    console.log(`🔌 WebSocket service initialized`);
    
    // Start auto-team creation service
    autoTeamCreationService.start();
    // Start automatic cleanup service
    cleanupService.startPeriodicCleanup(24 * 60 * 60 * 1000); // Every 24 hours
});
