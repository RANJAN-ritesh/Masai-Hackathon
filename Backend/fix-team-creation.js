const mongoose = require('mongoose');
const Team = require('./dist/model/team').default;

async function fixTeamCreation() {
  try {
    await mongoose.connect('mongodb+srv://riteshranjan:riteshranjan@cluster0.8qjqg.mongodb.net/test?retryWrites=true&w=majority');
    
    console.log('🔧 Fixing team creation issues...');
    
    // Check for any remaining duplicate teams
    const teams = await Team.find({});
    const teamNames = teams.map(t => t.teamName);
    const duplicates = teamNames.filter((name, index) => teamNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      console.log('❌ Found duplicate team names:', duplicates);
      
      // Remove duplicates (keep the first one)
      for (const duplicateName of duplicates) {
        const duplicateTeams = await Team.find({ teamName: duplicateName });
        if (duplicateTeams.length > 1) {
          console.log(`🧹 Removing ${duplicateTeams.length - 1} duplicate teams for: ${duplicateName}`);
          // Keep the first one, remove the rest
          for (let i = 1; i < duplicateTeams.length; i++) {
            await Team.findByIdAndDelete(duplicateTeams[i]._id);
            console.log(`   ✅ Removed duplicate team: ${duplicateTeams[i]._id}`);
          }
        }
      }
    } else {
      console.log('✅ No duplicate team names found');
    }
    
    // Check team indexes
    const indexes = await Team.collection.getIndexes();
    console.log('📊 Current team indexes:', Object.keys(indexes));
    
    // Remove any problematic unique indexes on teamName
    try {
      await Team.collection.dropIndex('teamName_1');
      console.log('✅ Removed unique index on teamName');
    } catch (error) {
      console.log('ℹ️  No unique index on teamName found');
    }
    
    // Create a compound index for teamName + hackathonId (not unique)
    try {
      await Team.collection.createIndex({ teamName: 1, hackathonId: 1 });
      console.log('✅ Created compound index on teamName + hackathonId');
    } catch (error) {
      console.log('ℹ️  Compound index already exists');
    }
    
    console.log('🎉 Team creation issues fixed!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error fixing team creation:', error.message);
  }
}

fixTeamCreation();
