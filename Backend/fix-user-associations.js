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

const fixUserAssociations = async () => {
  try {
    const User = require('./dist/model/user.js').default;
    const Hackathon = require('./dist/model/hackathon.js').default;
    const Team = require('./dist/model/team.js').default;

    // Get all hackathons
    const hackathons = await Hackathon.find({});
    console.log(`📋 Found ${hackathons.length} hackathons`);
    
    if (hackathons.length === 0) {
      console.log('❌ No hackathons found');
      return;
    }

    // Get the first hackathon (admin mode)
    const adminHackathon = hackathons.find(h => h.teamCreationMode === 'admin') || hackathons[0];
    const participantHackathon = hackathons.find(h => h.teamCreationMode === 'participant') || hackathons[1];

    console.log(`📋 Admin Hackathon: ${adminHackathon.title} (${adminHackathon._id})`);
    console.log(`📋 Participant Hackathon: ${participantHackathon?.title || 'None'} (${participantHackathon?._id || 'None'})`);

    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);

    // Update users to be associated with the new hackathons
    let updatedCount = 0;
    for (const user of users) {
      // Assign first 30 users to admin hackathon, rest to participant hackathon
      const targetHackathon = updatedCount < 30 ? adminHackathon : (participantHackathon || adminHackathon);
      
      // Update user hackathon associations
      user.hackathonIds = [targetHackathon._id.toString()];
      user.currentTeamId = null; // Reset team associations
      
      await user.save();
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`✅ Updated ${updatedCount} users...`);
      }
    }

    console.log(`✅ Updated all ${updatedCount} users with new hackathon associations`);

    // Create teams for the admin hackathon
    console.log('\n📋 Creating teams for admin hackathon...');
    
    // Get users for admin hackathon
    const adminUsers = await User.find({ 
      hackathonIds: { $in: [adminHackathon._id.toString()] } 
    }).limit(20);

    console.log(`👥 Found ${adminUsers.length} users for admin hackathon`);

    // Create 4 teams with 4 members each
    const teamsToCreate = [
      {
        name: `${adminHackathon.title} - Team 2`,
        leader: adminUsers[0],
        members: adminUsers.slice(0, 4)
      },
      {
        name: `${adminHackathon.title} - Team 3`, 
        leader: adminUsers[4],
        members: adminUsers.slice(4, 8)
      },
      {
        name: `${adminHackathon.title} - Team 4`,
        leader: adminUsers[8], 
        members: adminUsers.slice(8, 12)
      },
      {
        name: `${adminHackathon.title} - Team 5`,
        leader: adminUsers[12],
        members: adminUsers.slice(12, 16)
      }
    ];

    for (const teamData of teamsToCreate) {
      if (teamData.members.length === 0) continue;

      const team = new Team({
        teamName: teamData.name,
        hackathonId: adminHackathon._id.toString(),
        createdBy: teamData.leader._id,
        teamLeader: teamData.leader._id,
        teamMembers: teamData.members.map(m => m._id),
        memberLimit: 4,
        creationMethod: 'admin',
        teamStatus: 'finalized',
        isFinalized: true,
        canReceiveRequests: false
      });

      await team.save();
      console.log(`✅ Created team: ${teamData.name} with ${teamData.members.length} members`);

      // Update team members' currentTeamId
      for (const member of teamData.members) {
        member.currentTeamId = team._id.toString();
        member.canSendRequests = false;
        member.canReceiveRequests = false;
        await member.save();
      }
    }

    console.log('✅ Teams created and user associations updated');

  } catch (error) {
    console.error('❌ Error fixing user associations:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await fixUserAssociations();
    
    console.log('\n🎉 User associations fixed successfully!');
    console.log('🌐 Users are now properly associated with hackathons and teams.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main();
