// Test script to check team leader verification
const mongoose = require('mongoose');
const Team = require('./dist/model/team').default;
const User = require('./dist/model/user').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://riteshranjan:riteshranjan@cluster0.8qjqg.mongodb.net/hackathon?retryWrites=true&w=majority';

async function testTeamLeaderVerification() {
  try {
    console.log('🔍 Testing Team Leader Verification...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Bianca's team
    const team = await Team.findOne({ teamName: 'Team 1' });
    if (!team) {
      console.log('❌ Team not found');
      return;
    }

    console.log('📊 TEAM DATA:');
    console.log('Team ID:', team._id);
    console.log('Team Name:', team.teamName);
    console.log('Team Leader:', team.teamLeader);
    console.log('Team Leader Type:', typeof team.teamLeader);
    console.log('Created By:', team.createdBy);
    console.log('Created By Type:', typeof team.createdBy);
    console.log('Team Members:', team.teamMembers);
    console.log('');

    // Find Bianca's user data
    const bianca = await User.findOne({ email: 'bianca.rod2@example.com' });
    if (!bianca) {
      console.log('❌ Bianca not found');
      return;
    }

    console.log('👤 BIANCA DATA:');
    console.log('User ID:', bianca._id);
    console.log('User ID Type:', typeof bianca._id);
    console.log('Email:', bianca.email);
    console.log('Role:', bianca.role);
    console.log('Team ID:', bianca.teamId);
    console.log('');

    // Test different comparison methods
    console.log('🧪 TESTING COMPARISONS:');
    
    // Method 1: Direct ObjectId comparison
    const method1 = team.teamLeader?.toString() === bianca._id.toString();
    console.log('Method 1 (teamLeader.toString() === userId.toString()):', method1);
    
    // Method 2: String comparison
    const method2 = team.teamLeader?.toString() === String(bianca._id);
    console.log('Method 2 (teamLeader.toString() === String(userId)):', method2);
    
    // Method 3: CreatedBy comparison
    const method3 = team.createdBy?.toString() === bianca._id.toString();
    console.log('Method 3 (createdBy.toString() === userId.toString()):', method3);
    
    // Method 4: Team members check
    const method4 = team.teamMembers.some(member => member.toString() === bianca._id.toString());
    console.log('Method 4 (user in teamMembers):', method4);
    
    // Method 5: Role check
    const method5 = bianca.role === 'leader';
    console.log('Method 5 (user.role === "leader"):', method5);
    
    console.log('\n🎯 RECOMMENDED SOLUTION:');
    const isLeader = method1 || method3 || (method4 && method5);
    console.log('Combined check (teamLeader OR createdBy OR (member AND leader)):', isLeader);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testTeamLeaderVerification().catch(console.error);
