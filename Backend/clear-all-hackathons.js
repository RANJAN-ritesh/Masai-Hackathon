#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required');
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const clearAllData = async () => {
  try {
    const Hackathon = require('./dist/model/hackathon').default;
    const Team = require('./dist/model/team').default;
    const User = require('./dist/model/user').default;
    const TeamRequest = require('./dist/model/teamRequests').default;

    console.log('🧹 Clearing all hackathons and related data...');
    
    // Clear hackathons
    const hackathonDeleteResult = await Hackathon.deleteMany({});
    console.log(`🗑️  Deleted ${hackathonDeleteResult.deletedCount} hackathons`);
    
    // Clear teams
    const teamDeleteResult = await Team.deleteMany({});
    console.log(`🗑️  Deleted ${teamDeleteResult.deletedCount} teams`);
    
    // Clear team requests
    const requestDeleteResult = await TeamRequest.deleteMany({});
    console.log(`🗑️  Deleted ${requestDeleteResult.deletedCount} team requests`);
    
    // Clear user hackathon associations
    const userUpdateResult = await User.updateMany(
      {},
      { 
        $set: { 
          hackathonIds: [], 
          currentTeamId: null,
          teamId: ""
        } 
      }
    );
    console.log(`👥 Updated ${userUpdateResult.modifiedCount} users (cleared hackathon associations)`);
    
    console.log('✅ Database cleared successfully - Ready for "new admin" testing');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearAllData();
  } catch (error) {
    console.error('❌ Clear failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main();
