const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const Doctor = require('../models/Doctor');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const checkDoctors = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if doctors exist
    const doctors = await Doctor.find();
    console.log('Number of doctors in database:', doctors.length);
    
    if (doctors.length > 0) {
      console.log('First doctor:', doctors[0].name);
      console.log('First doctor image:', doctors[0].image);
    } else {
      console.log('No doctors found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDoctors();