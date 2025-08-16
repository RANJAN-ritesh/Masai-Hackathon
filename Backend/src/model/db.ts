import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://HarshitBatra:hb@masai-curriculum.ajiej.mongodb.net/?retryWrites=true&w=majority&appName=Masai-Curriculum";
const DB_NAME = process.env.DB_NAME || "xTo10x";

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