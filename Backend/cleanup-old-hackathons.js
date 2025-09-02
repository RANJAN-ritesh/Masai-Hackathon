#!/usr/bin/env node

/**
 * 🧹 CLEANUP OLD HACKATHON DATA
 * 
 * This script cleans up:
 * 1. Users with references to deleted/non-existent hackathons
 * 2. Orphaned team data
 * 3. Old hackathon associations
 */

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

const cleanupOldHackathonData = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // 1. Clean up users with invalid hackathon references
    console.log('\n🧹 Step 1: Cleaning up users with invalid hackathon references...');
    
    const User = require('./dist/model/user').default;
    const Hackathon = require('./dist/model/hackathon').default;
    
    // Get all hackathon IDs that actually exist
    const existingHackathons = await Hackathon.find({}, '_id');
    const existingHackathonIds = existingHackathons.map(h => h._id.toString());
    
    console.log(`📊 Found ${existingHackathonIds.length} existing hackathons:`, existingHackathonIds);
    
    // Find users with invalid hackathon references
    const usersWithInvalidRefs = await User.find({
      hackathonIds: { $exists: true, $ne: [] }
    });
    
    console.log(`🔍 Found ${usersWithInvalidRefs.length} users with hackathon references`);
    
    let cleanedUsers = 0;
    for (const user of usersWithInvalidRefs) {
      if (user.hackathonIds && Array.isArray(user.hackathonIds)) {
        const originalCount = user.hackathonIds.length;
        const validRefs = user.hackathonIds.filter(id => 
          existingHackathonIds.includes(id.toString())
        );
        
        if (validRefs.length !== originalCount) {
          console.log(`🧹 Cleaning user ${user.email}: ${originalCount} → ${validRefs.length} valid refs`);
          user.hackathonIds = validRefs;
          await user.save();
          cleanedUsers++;
        }
      }
    }
    
    console.log(`✅ Cleaned up ${cleanedUsers} users`);
    
    // 2. Clean up orphaned team data
    console.log('\n🧹 Step 2: Cleaning up orphaned team data...');
    
    const Team = require('./dist/model/team').default;
    
    // Find teams with invalid hackathon references
    const teamsWithInvalidRefs = await Team.find({
      hackathonId: { $exists: true, $ne: null }
    });
    
    console.log(`🔍 Found ${teamsWithInvalidRefs.length} teams with hackathon references`);
    
    let cleanedTeams = 0;
    for (const team of teamsWithInvalidRefs) {
      if (team.hackathonId && !existingHackathonIds.includes(team.hackathonId.toString())) {
        console.log(`🧹 Removing team ${team.teamName} with invalid hackathon ref: ${team.hackathonId}`);
        await Team.findByIdAndDelete(team._id);
        cleanedTeams++;
      }
    }
    
    console.log(`✅ Cleaned up ${cleanedTeams} teams`);
    
    // 3. Clean up users with invalid team references
    console.log('\n🧹 Step 3: Cleaning up users with invalid team references...');
    
    const teams = await Team.find({}, '_id');
    const existingTeamIds = teams.map(t => t._id.toString());
    
    const usersWithInvalidTeams = await User.find({
      teamId: { $exists: true, $ne: "" }
    });
    
    let cleanedTeamRefs = 0;
    for (const user of usersWithInvalidTeams) {
      if (user.teamId && !existingTeamIds.includes(user.teamId.toString())) {
        console.log(`🧹 Cleaning team ref for user ${user.email}: ${user.teamId}`);
        user.teamId = "";
        await user.save();
        cleanedTeamRefs++;
      }
    }
    
    console.log(`✅ Cleaned up ${cleanedTeamRefs} team references`);
    
    // 4. Show final stats
    console.log('\n📊 FINAL CLEANUP STATS:');
    console.log(`• Users cleaned: ${cleanedUsers}`);
    console.log(`• Teams cleaned: ${cleanedTeams}`);
    console.log(`• Team refs cleaned: ${cleanedTeamRefs}`);
    console.log(`• Existing hackathons: ${existingHackathonIds.length}`);
    console.log(`• Existing teams: ${existingTeamIds.length}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await cleanupOldHackathonData();
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('🌐 Your database is now clean and consistent.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main(); 