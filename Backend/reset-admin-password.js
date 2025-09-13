const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ranjan1111:testingpass@hackathon.6qwqxyc.mongodb.net/';

async function resetAdminPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Find admin user
    const admin = await db.collection('users').findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.log('❌ Admin account not found!');
      return;
    }
    
    console.log('👤 Found admin account:');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('✅ Verified:', admin.isVerified);
    
    // Reset password to admin123
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔄 Resetting password...');
    const result = await db.collection('users').updateOne(
      { email: 'admin@test.com' },
      { 
        $set: { 
          password: hashedPassword,
          isVerified: true,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successfully!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('❌ Failed to reset password');
    }
    
    // Test password verification
    console.log('🧪 Testing password verification...');
    const testUser = await db.collection('users').findOne({ email: 'admin@test.com' });
    const isPasswordValid = await bcrypt.compare('admin123', testUser.password);
    console.log('🔐 Password verification test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
resetAdminPassword();
