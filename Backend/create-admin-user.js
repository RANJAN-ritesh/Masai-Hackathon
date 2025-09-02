#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const createAdminUser = async () => {
  try {
    const User = require('./dist/model/user').default;

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('🔧 Updating existing admin user...');
      existingAdmin.isVerified = true;
      existingAdmin.role = 'admin';
      existingAdmin.password = 'admin123';
      existingAdmin.code = existingAdmin.code || 'ADMIN001';
      existingAdmin.hackathonIds = [];
      existingAdmin.currentTeamId = null;
      existingAdmin.teamId = "";
      await existingAdmin.save();
      
      console.log('✅ Admin user updated:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      console.log(`   ID: ${existingAdmin._id}`);
      return existingAdmin;
    }

    // Create new admin user
    const adminUser = new User({
      userId: `ADMIN_${Date.now()}`,
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      code: 'ADMIN001',
      role: 'admin',
      isVerified: true,
      phoneNumber: '555-0000',
      course: 'Administration',
      skills: ['Management', 'Leadership'],
      vertical: 'Tech',
      hackathonIds: [],
      canSendRequests: true,
      canReceiveRequests: true
    });

    const savedAdmin = await adminUser.save();
    
    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${savedAdmin.email}`);
    console.log(`   Role: ${savedAdmin.role}`);
    console.log(`   Verified: ${savedAdmin.isVerified}`);
    console.log(`   ID: ${savedAdmin._id}`);
    
    return savedAdmin;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await createAdminUser();
    
    console.log('\n🎉 Admin user ready!');
    console.log('🔐 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

main();
