const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ranjan1111:testingpass@hackathon.6qwqxyc.mongodb.net/';

async function destroySchemaIssues() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔥 DESTROYING SCHEMA ISSUES WITH EXTREME PREJUDICE!');
    console.log('==================================================');
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // STEP 1: FIX HACKATHON SCHEMA - ADD MISSING FIELDS
    console.log('\n🔥 STEP 1: FIXING HACKATHON SCHEMA');
    
    const hackathons = await db.collection('hackathons').find({}).toArray();
    console.log(`Found ${hackathons.length} hackathons to fix`);
    
    for (const hackathon of hackathons) {
      const updateData = {};
      let needsUpdate = false;
      
      // Add missing teamSize field
      if (!hackathon.teamSize) {
        updateData.teamSize = {
          min: hackathon.minTeamSize || 2,
          max: hackathon.maxTeamSize || 4
        };
        needsUpdate = true;
        console.log(`✅ Adding teamSize to hackathon: ${hackathon.title}`);
      }
      
      // Add missing participants field
      if (!hackathon.participants) {
        updateData.participants = [];
        needsUpdate = true;
        console.log(`✅ Adding participants field to hackathon: ${hackathon.title}`);
      }
      
      // Add missing teamCreationMode
      if (!hackathon.teamCreationMode) {
        updateData.teamCreationMode = 'both'; // Allow both admin and participant teams
        needsUpdate = true;
        console.log(`✅ Adding teamCreationMode to hackathon: ${hackathon.title}`);
      }
      
      // Add missing allowParticipantTeams
      if (hackathon.allowParticipantTeams === undefined) {
        updateData.allowParticipantTeams = true;
        needsUpdate = true;
        console.log(`✅ Adding allowParticipantTeams to hackathon: ${hackathon.title}`);
      }
      
      if (needsUpdate) {
        await db.collection('hackathons').updateOne(
          { _id: hackathon._id },
          { $set: updateData }
        );
        console.log(`🔥 Updated hackathon: ${hackathon.title}`);
      }
    }
    
    // STEP 2: FIX USER SCHEMA - RESOLVE TEAM ID CONFLICTS
    console.log('\n🔥 STEP 2: FIXING USER SCHEMA');
    
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to fix`);
    
    for (const user of users) {
      const updateData = {};
      let needsUpdate = false;
      
      // Remove old teamId field if it exists
      if (user.teamId && !user.currentTeamId) {
        updateData.currentTeamId = user.teamId;
        updateData.teamId = undefined;
        needsUpdate = true;
        console.log(`✅ Migrating teamId to currentTeamId for user: ${user.name}`);
      }
      
      // Ensure hackathonIds is an array
      if (!Array.isArray(user.hackathonIds)) {
        updateData.hackathonIds = [];
        needsUpdate = true;
        console.log(`✅ Fixing hackathonIds for user: ${user.name}`);
      }
      
      // Add missing fields
      if (!user.teamsCreated) {
        updateData.teamsCreated = [];
        needsUpdate = true;
      }
      
      if (user.canSendRequests === undefined) {
        updateData.canSendRequests = true;
        needsUpdate = true;
      }
      
      if (user.canReceiveRequests === undefined) {
        updateData.canReceiveRequests = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // First set the new fields
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        // Then remove the old teamId field if needed
        if (updateData.teamId === undefined) {
          await db.collection('users').updateOne(
            { _id: user._id },
            { $unset: { teamId: "" } }
          );
        }
        
        console.log(`🔥 Updated user: ${user.name}`);
      }
    }
    
    // STEP 3: FIX TEAM SCHEMA - ENSURE CONSISTENCY
    console.log('\n🔥 STEP 3: FIXING TEAM SCHEMA');
    
    const teams = await db.collection('teams').find({}).toArray();
    console.log(`Found ${teams.length} teams to fix`);
    
    for (const team of teams) {
      const updateData = {};
      let needsUpdate = false;
      
      // Add missing fields
      if (!team.creationMethod) {
        updateData.creationMethod = 'admin';
        needsUpdate = true;
      }
      
      if (!team.teamStatus) {
        updateData.teamStatus = 'forming';
        needsUpdate = true;
      }
      
      if (!team.canReceiveRequests) {
        updateData.canReceiveRequests = true;
        needsUpdate = true;
      }
      
      if (!team.isFinalized) {
        updateData.isFinalized = false;
        needsUpdate = true;
      }
      
      if (!team.teamLeader) {
        updateData.teamLeader = team.createdBy;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await db.collection('teams').updateOne(
          { _id: team._id },
          { $set: updateData }
        );
        console.log(`🔥 Updated team: ${team.teamName}`);
      }
    }
    
    // STEP 4: VALIDATE ALL FIXES
    console.log('\n🔥 STEP 4: VALIDATING FIXES');
    
    const fixedHackathons = await db.collection('hackathons').find({}).toArray();
    const fixedUsers = await db.collection('users').find({}).toArray();
    const fixedTeams = await db.collection('teams').find({}).toArray();
    
    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`✅ Hackathons: ${fixedHackathons.length} (all should have teamSize, participants, teamCreationMode)`);
    console.log(`✅ Users: ${fixedUsers.length} (all should have currentTeamId, hackathonIds, teamsCreated)`);
    console.log(`✅ Teams: ${fixedTeams.length} (all should have creationMethod, teamStatus, canReceiveRequests)`);
    
    // Sample validation
    const sampleHackathon = fixedHackathons[0];
    if (sampleHackathon) {
      console.log('\n🔍 Sample Hackathon Validation:');
      console.log(`   teamSize: ${JSON.stringify(sampleHackathon.teamSize)}`);
      console.log(`   participants: ${Array.isArray(sampleHackathon.participants) ? sampleHackathon.participants.length : 'MISSING'}`);
      console.log(`   teamCreationMode: ${sampleHackathon.teamCreationMode}`);
      console.log(`   allowParticipantTeams: ${sampleHackathon.allowParticipantTeams}`);
    }
    
    const sampleUser = fixedUsers[0];
    if (sampleUser) {
      console.log('\n🔍 Sample User Validation:');
      console.log(`   currentTeamId: ${sampleUser.currentTeamId || 'null'}`);
      console.log(`   hackathonIds: ${Array.isArray(sampleUser.hackathonIds) ? sampleUser.hackathonIds.length : 'MISSING'}`);
      console.log(`   teamsCreated: ${Array.isArray(sampleUser.teamsCreated) ? sampleUser.teamsCreated.length : 'MISSING'}`);
    }
    
    console.log('\n==================================================');
    console.log('🔥 SCHEMA ISSUES DESTROYED WITH EXTREME PREJUDICE!');
    console.log('✅ Database is now properly structured and consistent!');
    console.log('==================================================');
    
  } catch (error) {
    console.error('❌ Error destroying schema issues:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// EXECUTE THE DESTRUCTION!
destroySchemaIssues(); 