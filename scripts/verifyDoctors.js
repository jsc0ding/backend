const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/Doctor');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = require('../config/db');
connectDB();

const verifyDoctors = async () => {
  try {
    // Count doctors
    const doctorCount = await Doctor.countDocuments();
    console.log(`Total doctors in database: ${doctorCount}`);
    
    if (doctorCount > 0) {
      console.log('\nFirst 5 doctors:');
      const doctors = await Doctor.find().limit(5);
      doctors.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name} - ${doc.specialty} (${doc.department}) - Rating: ${doc.rating}`);
      });
      
      console.log('\nLast 5 doctors:');
      const lastDoctors = await Doctor.find().sort({ _id: -1 }).limit(5);
      lastDoctors.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name} - ${doc.specialty} (${doc.department}) - Rating: ${doc.rating}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying doctors:', error);
    process.exit(1);
  }
};

verifyDoctors();