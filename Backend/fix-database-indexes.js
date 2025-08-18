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

const fixUserIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('🔍 Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    // Drop the problematic unique indexes
    const indexesToDrop = ['name_1', 'phoneNumber_1'];
    
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`ℹ️  Index ${indexName} does not exist (already dropped or never existed)`);
        } else {
          console.log(`⚠️  Could not drop index ${indexName}:`, error.message);
        }
      }
    }
    
    console.log('🔍 Checking indexes after cleanup...');
    const newIndexes = await collection.indexes();
    console.log('Remaining indexes:', newIndexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    console.log('✅ Database indexes fixed!');
    console.log('📋 Users can now have duplicate names and phone numbers');
    
  } catch (error) {
    console.error('❌ Error fixing database indexes:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await fixUserIndexes();
    
    console.log('\n🎉 Database migration complete!');
    console.log('🌐 Your platform should now handle duplicate user data properly.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main(); 