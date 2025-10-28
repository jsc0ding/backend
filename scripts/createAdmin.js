import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ MongoDB Connected');
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@medqueue.uz' });
    if (existingAdmin) {
      // Update existing admin user to ensure it has the role field
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      
      // Only log in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Admin user already exists! Updated role to admin.');
        console.log('Email:', existingAdmin.email);
        console.log('Name:', existingAdmin.name);
      }
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@medqueue.uz',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    await admin.save();
    
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n✅ Admin user created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('Email: admin@medqueue.uz');
      console.log('Password: admin123');
      console.log('═══════════════════════════════════════');
      console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
      console.log('\nYou can now login at: http://localhost:3000/admin/login\n');
    }
    
    process.exit(0);
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating admin:', error);
    }
    process.exit(1);
  }
};

createAdmin();