// Fix database index issue for TeamRequest collection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixTeamRequestIndexes() {
  try {
    console.log('🔧 Fixing TeamRequest database indexes...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all indexes on the teamrequests collection
    const indexes = await db.collection('teamrequests').indexes();
    console.log('📊 Current indexes:', indexes.map(idx => idx.name));
    
    // Check if there's a problematic requestId index
    const requestIdIndex = indexes.find(idx => idx.key && idx.key.requestId);
    if (requestIdIndex) {
      console.log('❌ Found problematic requestId index:', requestIdIndex.name);
      console.log('🔧 Dropping requestId index...');
      
      try {
        await db.collection('teamrequests').dropIndex(requestIdIndex.name);
        console.log('✅ Successfully dropped requestId index');
      } catch (error) {
        console.log('⚠️ Error dropping index (might not exist):', error.message);
      }
    } else {
      console.log('✅ No problematic requestId index found');
    }
    
    // Recreate proper indexes
    console.log('🔧 Recreating proper indexes...');
    
    await db.collection('teamrequests').createIndex({ hackathonId: 1, status: 1 });
    await db.collection('teamrequests').createIndex({ teamId: 1, status: 1 });
    await db.collection('teamrequests').createIndex({ fromUserId: 1, status: 1 });
    await db.collection('teamrequests').createIndex({ toUserId: 1, status: 1 });
    await db.collection('teamrequests').createIndex({ expiresAt: 1 });
    
    console.log('✅ Proper indexes recreated');
    
    // Show final indexes
    const finalIndexes = await db.collection('teamrequests').indexes();
    console.log('📊 Final indexes:', finalIndexes.map(idx => idx.name));
    
    console.log('🎉 Database index fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixTeamRequestIndexes();

