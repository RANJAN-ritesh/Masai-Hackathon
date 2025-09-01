import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is required");
    process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "hackathon_db";

export const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI, {
            // Connection optimization
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            bufferMaxEntries: 0
        });
        console.log("MongoDB Connected Successfully");
        
        // Create database indexes for performance
        await createIndexes();
        
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Stop server if DB connection fails
    }
};

// Create database indexes for optimal performance
async function createIndexes() {
    try {
        console.log("🔍 Creating database indexes...");
        
        // User collection indexes
        await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoose.connection.db.collection('users').createIndex({ hackathonIds: 1 });
        await mongoose.connection.db.collection('users').createIndex({ currentTeamId: 1 });
        await mongoose.connection.db.collection('users').createIndex({ role: 1 });
        
        // Team collection indexes
        await mongoose.connection.db.collection('teams').createIndex({ hackathonId: 1 });
        await mongoose.connection.db.collection('teams').createIndex({ teamMembers: 1 });
        await mongoose.connection.db.collection('teams').createIndex({ createdBy: 1 });
        await mongoose.connection.db.collection('teams').createIndex({ teamName: 1, hackathonId: 1 }, { unique: true });
        
        // Hackathon collection indexes
        await mongoose.connection.db.collection('hackathons').createIndex({ status: 1 });
        await mongoose.connection.db.collection('hackathons').createIndex({ startDate: 1 });
        await mongoose.connection.db.collection('hackathons').createIndex({ teamCreationMode: 1 });
        
        // Team requests indexes
        await mongoose.connection.db.collection('teamrequests').createIndex({ teamId: 1 });
        await mongoose.connection.db.collection('teamrequests').createIndex({ fromUser: 1 });
        await mongoose.connection.db.collection('teamrequests').createIndex({ status: 1 });
        
        console.log("✅ Database indexes created successfully");
        
    } catch (error) {
        console.error("❌ Error creating indexes:", error);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});