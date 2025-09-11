const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixDuplicateTeamIssue() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        if (!MONGO_URI) {
            console.error("❌ MONGO_URI environment variable is required");
            return;
        }
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const teamsCollection = db.collection('teams');

        // Check current indexes
        console.log('\n🔍 Current indexes on teams collection:');
        const indexes = await teamsCollection.indexes();
        indexes.forEach(index => {
            console.log(`- ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
        });

        // Check for problematic simple teamName index
        const simpleTeamNameIndex = indexes.find(index => 
            Object.keys(index.key).length === 1 && 
            index.key.teamName === 1 && 
            index.unique
        );

        if (simpleTeamNameIndex) {
            console.log('\n⚠️  Found problematic simple unique index on teamName!');
            console.log('🗑️  Dropping simple teamName index...');
            try {
                await teamsCollection.dropIndex('teamName_1');
                console.log('✅ Dropped simple teamName index');
            } catch (error) {
                console.log('ℹ️  Index may not exist or already dropped:', error.message);
            }
        }

        // Ensure compound index exists
        try {
            await teamsCollection.createIndex({ teamName: 1, hackathonId: 1 }, { unique: true });
            console.log('✅ Ensured compound unique index on teamName + hackathonId exists');
        } catch (error) {
            console.log('ℹ️  Compound index already exists or error:', error.message);
        }

        // Find duplicate team names in same hackathon
        console.log('\n🔍 Checking for duplicate teams...');
        const duplicates = await teamsCollection.aggregate([
            {
                $group: {
                    _id: {
                        teamName: "$teamName",
                        hackathonId: "$hackathonId"
                    },
                    count: { $sum: 1 },
                    docs: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} sets of duplicate teams:`);
            
            for (const duplicate of duplicates) {
                console.log(`\n📋 Duplicate set: "${duplicate._id.teamName}" in hackathon ${duplicate._id.hackathonId}`);
                console.log(`   Count: ${duplicate.count}`);
                
                // Keep the oldest team, remove the newer ones
                const sortedDocs = duplicate.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const keepTeam = sortedDocs[0];
                const removeTeams = sortedDocs.slice(1);
                
                console.log(`   ✅ Keeping team: ${keepTeam._id} (created: ${keepTeam.createdAt})`);
                
                for (const removeTeam of removeTeams) {
                    console.log(`   🗑️  Removing team: ${removeTeam._id} (created: ${removeTeam.createdAt})`);
                    await teamsCollection.deleteOne({ _id: removeTeam._id });
                }
            }
        } else {
            console.log('✅ No duplicate teams found');
        }

        // Check for teams with missing or invalid data
        console.log('\n🔍 Checking for teams with invalid data...');
        const invalidTeams = await teamsCollection.find({
            $or: [
                { teamName: { $exists: false } },
                { teamName: "" },
                { teamName: null }
            ]
        }).toArray();

        if (invalidTeams.length > 0) {
            console.log(`⚠️  Found ${invalidTeams.length} teams with invalid teamName:`);
            for (const team of invalidTeams) {
                console.log(`   - Team ID: ${team._id}, teamName: "${team.teamName}"`);
            }
        } else {
            console.log('✅ All teams have valid teamName');
        }

        // Final index check
        console.log('\n🔍 Final indexes on teams collection:');
        const finalIndexes = await teamsCollection.indexes();
        finalIndexes.forEach(index => {
            console.log(`- ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
        });

        console.log('\n✅ Duplicate team issue fix completed!');

    } catch (error) {
        console.error('❌ Error fixing duplicate team issue:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

if (require.main === module) {
    fixDuplicateTeamIssue();
}

module.exports = { fixDuplicateTeamIssue };
