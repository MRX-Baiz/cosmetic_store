const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createCustomAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmetic-store');
    console.log('Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 3) {
      console.log('Usage: node createCustomAdmin.js <name> <email> <password>');
      console.log('Example: node createCustomAdmin.js "John Admin" "john@beautystore.com" "securepassword123"');
      process.exit(1);
    }

    const [name, email, password] = args;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User with this email already exists:', email);
      process.exit(1);
    }

    // Create admin user
    const adminData = {
      name,
      email,
      password,
      role: 'admin'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
createCustomAdmin();

