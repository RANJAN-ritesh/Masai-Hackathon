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
        await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Stop server if DB connection fails
    }
};