import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Complaint from '../models/Complaint.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleAppointments = [
  {
    fullName: 'Alijon Valiyev',
    phone: '+998901234567',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: '09:00',
    doctorName: 'Dr. Ahmadjon Rahimov',
    specialty: 'Kardiolog',
    department: 'Kardiologiya',
    status: 'confirmed'
  },
  {
    fullName: 'Nigina Karimova',
    phone: '+998907654321',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '10:30',
    doctorName: 'Dr. Gulnora Karimova',
    specialty: 'Stomatolog',
    department: 'Stomatologiya',
    status: 'pending'
  },
  {
    fullName: 'Bekzod Toshmatov',
    phone: '+998905556677',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    time: '14:00',
    doctorName: 'Dr. Rustam Toshmatov',
    specialty: 'Terapevt',
    department: 'Terapevt',
    status: 'confirmed'
  },
  {
    fullName: 'Dilnoza Sobirova',
    phone: '+998903334455',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    time: '11:00',
    doctorName: 'Dr. Malika Sobirova',
    specialty: 'Bolalar shifokori',
    department: 'Bolalar',
    status: 'pending'
  },
  {
    fullName: 'Sanjar Umarov',
    phone: '+998908887766',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    time: '15:30',
    doctorName: 'Dr. Sherzod Umarov',
    specialty: 'Dermatolog',
    department: 'Dermatologiya',
    status: 'confirmed'
  }
];

const sampleComplaints = [
  {
    name: 'Otabek Jalilov',
    phone: '+998901112233',
    message: 'Shifokorning qabul vaqtlari aniq emas. Iltimos, vaqtlarni aniqlashtiring.',
    status: 'pending'
  },
  {
    name: 'Feruza Turgunova',
    phone: '+998904445566',
    message: 'Onlayn navbat olish tizimida xatoliklar mavjud. Tizimni takomillashtiring.',
    status: 'reviewed'
  },
  {
    name: 'Davronbek Saidov',
    phone: '+998906667788',
    message: 'Poliklinika xodimlari bilan aloqada muammolar mavjud. Xodimlar yaxshilab o\'qitilishi kerak.',
    status: 'pending'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding process...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if we have doctors in the database
    const doctorCount = await Doctor.countDocuments();
    console.log(`Found ${doctorCount} doctors in database`);
    
    if (doctorCount === 0) {
      console.log('⚠️  No doctors found. Please run the doctor seeding script first.');
      console.log('Run: node scripts/seedDoctorsESM.js');
      process.exit(1);
    }
    
    // Clear existing appointments and complaints
    console.log('Clearing existing appointments and complaints...');
    const deletedAppointments = await Appointment.deleteMany({});
    const deletedComplaints = await Complaint.deleteMany({});
    console.log(`Cleared ${deletedAppointments.deletedCount} appointments and ${deletedComplaints.deletedCount} complaints`);
    
    // Insert sample appointments
    console.log('Inserting sample appointments...');
    const insertedAppointments = await Appointment.insertMany(sampleAppointments);
    console.log(`✅ Inserted ${insertedAppointments.length} sample appointments`);
    
    // Insert sample complaints
    console.log('Inserting sample complaints...');
    const insertedComplaints = await Complaint.insertMany(sampleComplaints);
    console.log(`✅ Inserted ${insertedComplaints.length} sample complaints`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Appointments: ${insertedAppointments.length}`);
    console.log(`   - Complaints: ${insertedComplaints.length}`);
    console.log(`   - Doctors: ${doctorCount} (already in database)`);
    
    // Verify insertion
    const totalAppointments = await Appointment.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    console.log(`\n🔍 Verification:`);
    console.log(`   - Total appointments in DB: ${totalAppointments}`);
    console.log(`   - Total complaints in DB: ${totalComplaints}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();