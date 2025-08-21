import express from "express";
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
const PORT = process.env.PORT || 5009;
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            process.env.CORS_ORIGIN || 'https://masai-hackathon.netlify.app',
            'https://masai-hackathon.netlify.app'
          ] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

connectDB();
user.createCollection()
    .then( () => console.log("user Collection created"))
    .catch( (error) => console.error("Error creating user collection", error));

team.createCollection()
    .then( () => console.log("team collection created"))
    .catch( (error) => console.error("Error creating team collection", error));

teamRequests.createCollection()
    .then( () => console.log("teamRequest collection created"))
    .catch( (error) => console.error("Error creating teamRequest collection", error));

problemStatement.createCollection()
    .then( () => console.log("problemStatement collection created"))
    .catch( (error) => console.error("Error creating problemStatement collection"));

app.use("/users", userRoutes);
app.use("/team", teamRoutes);
app.use("/team-request", teamRequestRoutes);
app.use("/hackathons", problemStatementRoutes); // Mount hackathon routes at /hackathons level
app.use("/participant-team", participantTeamRoutes); // Enable participant team routes

app.get("/health",(req, res)=>{
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        debug: "Testing if new code is deployed - " + new Date().toISOString(), // Added for deployment verification
        schemaVersion: "4.0 - COMPREHENSIVE THEME SYSTEM & USER ENROLLMENT", // Force complete restart
        hackathonStatusEnum: ["upcoming", "active", "inactive", "completed"], // Show expected enum values
        buildTime: new Date().toISOString() // Build timestamp to verify deployment
    })
})

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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 SCHEMA DEBUG: Hackathon status enum should include 'upcoming'`);
    console.log(`🔧 DEPLOYMENT TIME: ${new Date().toISOString()}`);
    
    // Start auto-team creation service
    autoTeamCreationService.start();
});
