// Check current database state with proper field access
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check hackathons with proper field access
    const hackathons = await db.collection('hackathons').find({}).toArray();
    console.log(`\n🏆 Found ${hackathons.length} hackathons:`);
    hackathons.forEach(h => {
      console.log(`  ${h.title || 'No title'} - ID: ${h._id}`);
      console.log(`    Team Creation Mode: ${h.teamCreationMode}`);
      console.log(`    Allow Participant Teams: ${h.allowParticipantTeams}`);
    });
    
    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log(`\n👥 Found ${users.length} users:`);
    users.slice(0, 5).forEach(u => {
      console.log(`  ${u.name} (${u.email}) - ID: ${u._id}`);
    });
    
    // Check if the problematic user exists
    const problemUser = await db.collection('users').findOne({ _id: '68a1e9a1e0c564ac6d86f338' });
    if (problemUser) {
      console.log(`\n⚠️ Problem user found: ${problemUser.name} (${problemUser.email})`);
    } else {
      console.log('\n❌ Problem user 68a1e9a1e0c564ac6d86f338 NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
