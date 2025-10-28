import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import Complaint from './models/Complaint.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const checkDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Check doctors collection
    const doctorsCount = await Doctor.countDocuments();
    console.log(`📊 Doctors count: ${doctorsCount}`);
    
    if (doctorsCount > 0) {
      const sampleDoctor = await Doctor.findOne();
      console.log(`👨‍⚕️ Sample doctor: ${sampleDoctor.name}`);
    }
    
    // Check appointments collection
    const appointmentsCount = await Appointment.countDocuments();
    console.log(`📅 Appointments count: ${appointmentsCount}`);
    
    if (appointmentsCount > 0) {
      const sampleAppointment = await Appointment.findOne();
      console.log(`📋 Sample appointment patient: ${sampleAppointment.fullName}`);
    }
    
    // Check complaints collection
    const complaintsCount = await Complaint.countDocuments();
    console.log(`📝 Complaints count: ${complaintsCount}`);
    
    if (complaintsCount > 0) {
      const sampleComplaint = await Complaint.findOne();
      console.log(`💬 Sample complaint from: ${sampleComplaint.name}`);
    }
    
    console.log('\n✅ Database check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
};

checkDatabase();