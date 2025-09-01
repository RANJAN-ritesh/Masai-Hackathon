const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ranjan1111:testingpass@hackathon.6qwqxyc.mongodb.net/';

async function debugParticipants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔍 DEBUGGING PARTICIPANT ISSUE');
    console.log('================================');
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check all collections
    console.log('\n📊 DATABASE STATE:');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check hackathons
    console.log('\n🏆 HACKATHONS:');
    const hackathons = await db.collection('hackathons').find({}).toArray();
    console.log(`Found ${hackathons.length} hackathons`);
    
    for (const hackathon of hackathons) {
      console.log(`\nHackathon: ${hackathon.title}`);
      console.log(`  ID: ${hackathon._id}`);
      console.log(`  teamSize: ${JSON.stringify(hackathon.teamSize)}`);
      console.log(`  participants: ${hackathon.participants ? hackathon.participants.length : 'MISSING'}`);
      console.log(`  allowParticipantTeams: ${hackathon.allowParticipantTeams}`);
      console.log(`  teamCreationMode: ${hackathon.teamCreationMode}`);
    }
    
    // Check users
    console.log('\n👥 USERS:');
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    for (const user of users.slice(0, 5)) { // Show first 5 users
      console.log(`\nUser: ${user.name}`);
      console.log(`  ID: ${user._id}`);
      console.log(`  hackathonIds: ${user.hackathonIds ? user.hackathonIds.length : 'MISSING'}`);
      console.log(`  hackathonIds values: ${JSON.stringify(user.hackathonIds)}`);
      console.log(`  currentTeamId: ${user.currentTeamId || 'null'}`);
      console.log(`  role: ${user.role}`);
    }
    
    // Check if users have hackathonIds that match hackathon IDs
    console.log('\n🔗 HACKATHON-USER RELATIONSHIPS:');
    for (const hackathon of hackathons) {
      const hackathonId = hackathon._id.toString();
      const usersInHackathon = users.filter(user => 
        user.hackathonIds && user.hackathonIds.includes(hackathonId)
      );
      
      console.log(`\nHackathon: ${hackathon.title}`);
      console.log(`  Users with this hackathonId: ${usersInHackathon.length}`);
      
      if (usersInHackathon.length > 0) {
        usersInHackathon.forEach(user => {
          console.log(`    - ${user.name} (${user.role}) - Team: ${user.currentTeamId || 'none'}`);
        });
      } else {
        console.log(`    ❌ NO USERS FOUND FOR THIS HACKATHON!`);
      }
    }
    
    // Check teams
    console.log('\n🏗️ TEAMS:');
    const teams = await db.collection('teams').find({}).toArray();
    console.log(`Found ${teams.length} teams`);
    
    for (const team of teams) {
      console.log(`\nTeam: ${team.teamName}`);
      console.log(`  ID: ${team._id}`);
      console.log(`  hackathonId: ${team.hackathonId}`);
      console.log(`  teamMembers: ${team.teamMembers ? team.teamMembers.length : 'MISSING'}`);
      console.log(`  creationMethod: ${team.creationMethod}`);
    }
    
    console.log('\n================================');
    console.log('🔍 DEBUG COMPLETE');
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the debug
debugParticipants(); 