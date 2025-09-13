const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ranjan1111:testingpass@hackathon.6qwqxyc.mongodb.net/';

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin account already exists!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      phoneNumber: '1234567890',
      userId: 'ADMIN001',
      code: 'ADMIN',
      course: 'Administration',
      skills: ['Management', 'Administration'],
      vertical: 'Admin',
      hackathonIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('👤 Creating admin account...');
    const result = await db.collection('users').insertOne(adminUser);
    
    if (result.insertedId) {
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
      console.log('🆔 User ID:', result.insertedId);
    } else {
      console.log('❌ Failed to create admin account');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
createAdmin();
