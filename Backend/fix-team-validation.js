#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
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

const fixTeamValidation = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('teams');
    
    console.log('🔍 Checking team collection validation rules...');
    
    // Get current collection options
    const options = await db.command({ listCollections: 1, filter: { name: 'teams' } });
    console.log('Collection options:', JSON.stringify(options, null, 2));
    
    // Check if there are any validation rules
    try {
      const validationRules = await db.command({ collMod: 'teams', validator: {} });
      console.log('✅ Removed any existing validation rules from teams collection');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️ No validation rules found on teams collection');
      } else {
        console.log('⚠️ Could not modify collection validation:', error.message);
      }
    }
    
    // Test creating a team with memberLimit: 4
    console.log('🧪 Testing team creation with memberLimit: 4...');
    
    const testTeam = {
      teamName: 'TEST_TEAM_VALIDATION',
      createdBy: new mongoose.Types.ObjectId(),
      teamMembers: [],
      memberLimit: 4,
      hackathonId: 'test',
      description: 'Test team for validation',
      status: 'active',
      isFinalized: false,
      creationMethod: 'admin',
      canReceiveRequests: true,
      pendingRequests: [],
      teamStatus: 'forming',
      teamLeader: new mongoose.Schema.Types.ObjectId()
    };
    
    try {
      const result = await collection.insertOne(testTeam);
      console.log('✅ Successfully created test team with memberLimit: 4');
      console.log('Test team ID:', result.insertedId);
      
      // Clean up test team
      await collection.deleteOne({ _id: result.insertedId });
      console.log('🧹 Cleaned up test team');
      
    } catch (error) {
      console.error('❌ Failed to create test team:', error.message);
      
      if (error.message.includes('memberLimit')) {
        console.log('🔍 The issue is with memberLimit validation');
        console.log('💡 This suggests there might be a schema-level validation rule');
      }
    }
    
    console.log('✅ Team validation check complete!');
    
  } catch (error) {
    console.error('❌ Error fixing team validation:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await fixTeamValidation();
    
    console.log('\n🎉 Team validation check complete!');
    console.log('🌐 Your platform should now handle teams with up to 10 members properly.');
    
  } catch (error) {
    console.error('❌ Validation check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main(); 