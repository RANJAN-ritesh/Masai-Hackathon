const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://ranjan1111:testingpass@hackathon.6qwqxyc.mongodb.net/';

async function clearAllParticipants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Clear all users (participants)
    console.log('🗑️ Clearing all users...');
    const userResult = await db.collection('users').deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    // Clear all teams
    console.log('🗑️ Clearing all teams...');
    const teamResult = await db.collection('teams').deleteMany({});
    console.log(`✅ Deleted ${teamResult.deletedCount} teams`);
    
    // Clear all team requests
    console.log('🗑️ Clearing all team requests...');
    const requestResult = await db.collection('teamrequests').deleteMany({});
    console.log(`✅ Deleted ${requestResult.deletedCount} team requests`);
    
    // Clear all participant teams
    console.log('🗑️ Clearing all participant teams...');
    const participantTeamResult = await db.collection('participantteams').deleteMany({});
    console.log(`✅ Deleted ${participantTeamResult.deletedCount} participant teams`);
    
    // Clear all notifications
    console.log('🗑️ Clearing all notifications...');
    const notificationResult = await db.collection('notifications').deleteMany({});
    console.log(`✅ Deleted ${notificationResult.deletedCount} notifications`);
    
    console.log('\n🎉 DATABASE COMPLETELY CLEANED!');
    console.log('📊 Summary:');
    console.log(`   • Users: ${userResult.deletedCount}`);
    console.log(`   • Teams: ${teamResult.deletedCount}`);
    console.log(`   • Team Requests: ${requestResult.deletedCount}`);
    console.log(`   • Participant Teams: ${participantTeamResult.deletedCount}`);
    console.log(`   • Notifications: ${notificationResult.deletedCount}`);
    
    console.log('\n✨ You now have a completely fresh database!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the cleanup
clearAllParticipants(); 