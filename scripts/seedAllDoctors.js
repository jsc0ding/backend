import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Doctor from '../models/Doctor.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleDoctors = [
  {
    name: 'Dr. Ahmadjon Rahimov',
    specialty: 'Kardiolog',
    department: 'kardiologiya',
    experience: '12 yil',
    address: 'Toshkent shahri, Yunusobod tumani, Abdulla Qodiriy ko\'chasi 12',
    description: 'Kardiologiya sohasida 12 yillik tajribaga ega mutaxassis. Yurak-qon tomir kasalliklari diagnostikasi va davolashda ixtisoslashgan.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-14:00',
    rating: 4.8,
    phone: '+998 90 123 45 67',
    image: '/doctors/doctor1.jpg'
  },
  {
    name: 'Dr. Gulnora Karimova',
    specialty: 'Stomatolog',
    department: 'stomatologiya',
    experience: '8 yil',
    address: 'Toshkent shahri, Chilonzor tumani, Bunyodkor ko\'chasi 45',
    description: 'Tish va og\'iz bo\'shlig\'i kasalliklari bo\'yicha mutaxassis. Zamonaviy stomatologik muolajalar va estetik tish davolash.',
    workingHours: 'Dushanba-Juma: 8:30-16:30, Shanba: 9:00-13:00',
    rating: 4.9,
    phone: '+998 90 765 43 21',
    image: '/doctors/doctor3.jpg'
  },
  {
    name: 'Dr. Rustam Toshmatov',
    specialty: 'Terapevt',
    department: 'terapevt',
    experience: '15 yil',
    address: 'Toshkent shahri, Mirzo Ulug\'bek tumani, Mustaqillik ko\'chasi 78',
    description: 'Umumiy terapevt, oilaviy shifokor. Ichki kasalliklar diagnostikasi va umumiy tibbiy yordam ko\'rsatish.',
    workingHours: 'Dushanba-Juma: 9:00-18:00, Shanba-Yakshanba: Dam olish',
    rating: 4.7,
    phone: '+998 90 555 66 77',
    image: '/doctors/doctor4.jpg'
  },
  {
    name: 'Dr. Malika Sobirova',
    specialty: 'Bolalar shifokori',
    department: 'bolalar',
    experience: '10 yil',
    address: 'Toshkent shahri, Olmazor tumani, Farhod ko\'chasi 23',
    description: 'Bolalar kasalliklari bo\'yicha mutaxassis. Yangi tug\'ilgan chaqaloqlar va o\'smirlar tibbiy yordami.',
    workingHours: 'Dushanba-Juma: 8:00-16:00, Shanba: 8:00-12:00',
    rating: 4.9,
    phone: '+998 90 333 44 55',
    image: '/doctors/doctor5.jpg'
  },
  {
    name: 'Dr. Sherzod Umarov',
    specialty: 'Dermatolog',
    department: 'dermatologiya',
    experience: '9 yil',
    address: 'Toshkent shahri, Yakkasaroy tumani, Labzak ko\'chasi 67',
    description: 'Teri kasalliklari va kosmetik dermatologiya mutaxassisi. Akne, psoriasis va boshqa teri muammolari davolash.',
    workingHours: 'Dushanba-Chorshanba-Juma: 10:00-17:00, Seshanba-Payshanba: 14:00-19:00',
    rating: 4.6,
    phone: '+998 90 888 77 66',
    image: '/doctors/doctor6.jpg'
  },
  {
    name: 'Dr. Nigora Rashidova',
    specialty: 'Ginekolog',
    department: 'ginekologiya',
    experience: '11 yil',
    address: 'Toshkent shahri, Shayxontohur tumani, Zarafshon ko\'chasi 34',
    description: 'Ayollar salomatligi va reproduktiv tibbiyot mutaxassisi. Homiladorlik monitoringi va ginekologik muolajalar.',
    workingHours: 'Dushanba-Juma: 9:00-16:00, Shanba: 9:00-13:00',
    rating: 4.8,
    phone: '+998 90 111 22 33',
    image: '/doctors/doctor8.jpg'
  },
  {
    name: 'Dr. Azizbek Mirzaev',
    specialty: 'Nevrolog',
    department: 'nevrologiya',
    experience: '10 yil',
    address: 'Toshkent shahri, Bektemir tumani, Amir Temur ko\'chasi 56',
    description: 'Nerv tizimi kasalliklari bo\'yicha mutaxassis. Migren, epilepsiya va bosh miya kasalliklari davolash.',
    workingHours: 'Dushanba-Juma: 10:00-18:00, Shanba: 10:00-14:00',
    rating: 4.7,
    phone: '+998 90 222 33 44',
    image: '/doctors/doctor9.jpg'
  },
  {
    name: 'Dr. Feruza Turgunova',
    specialty: 'Oftalmolog',
    department: 'oftalmologiya',
    experience: '8 yil',
    address: 'Toshkent shahri, Sergeli tumani, Qatortol ko\'chasi 89',
    description: 'Ko\'z kasalliklari bo\'yicha mutaxassis. Katarakt, glaukoma va retina kasalliklari davolash.',
    workingHours: 'Dushanba-Juma: 8:00-17:00, Shanba: 8:00-13:00',
    rating: 4.8,
    phone: '+998 90 444 55 66',
    image: '/doctors/doctor1.jpg'
  },
  {
    name: 'Dr. Davronbek Saidov',
    specialty: 'Ortoped',
    department: 'ortopediya',
    experience: '13 yil',
    address: 'Toshkent shahri, Uchtepa tumani, Chorsu ko\'chasi 33',
    description: 'Muskel-skelet tizimi kasalliklari bo\'yicha mutaxassis. Qo\'l-oyoq suyaklari singanliklari va bo\'g\'imlar kasalliklari davolash.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-13:00',
    rating: 4.6,
    phone: '+998 90 666 77 88',
    image: '/doctors/doctor3.jpg'
  },
  {
    name: 'Dr. Zulfiya Ismoilova',
    specialty: 'Endokrinolog',
    department: 'endokrinologiya',
    experience: '9 yil',
    address: 'Toshkent shahri, Mirobod tumani, Navoiy ko\'chasi 44',
    description: 'Gormonal tizim kasalliklari bo\'yicha mutaxassis. Qandli diabet, qalqonsimon bez kasalliklari va metabolik buzulishlar davolash.',
    workingHours: 'Dushanba-Juma: 9:00-16:00, Shanba: 9:00-12:00',
    rating: 4.7,
    phone: '+998 90 777 88 99',
    image: '/doctors/doctor4.jpg'
  },
  {
    name: 'Dr. Jamshid Ergashev',
    specialty: 'LOR',
    department: 'lor',
    experience: '11 yil',
    address: 'Toshkent shahri, Yunusobod tumani, Buyuk Ipak Yo\'li ko\'chasi 77',
    description: 'Quloq, burun va tomon kasalliklari bo\'yicha mutaxassis. Amaliy LOR operatsiyalari va diagnostika.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-13:00',
    rating: 4.6,
    phone: '+998 90 999 00 11',
    image: '/doctors/doctor5.jpg'
  },
  {
    name: 'Dr. Dilorom Nazarova',
    specialty: 'Rentgenolog',
    department: 'rentgenologiya',
    experience: '8 yil',
    address: 'Toshkent shahri, Chilonzor tumani, Chilonzor metro yo\'nalishi 25',
    description: 'Rentgen diagnostikasi bo\'yicha mutaxassis. Kompyuter tomografiya va MRI tasvirlarini tahlil qilish.',
    workingHours: 'Dushanba-Juma: 8:00-16:00, Shanba: Dam olish',
    rating: 4.5,
    phone: '+998 90 111 33 55',
    image: '/doctors/doctor6.jpg'
  },
  {
    name: 'Dr. Otabek Jalilov',
    specialty: 'Urolog',
    department: 'urologiya',
    experience: '12 yil',
    address: 'Toshkent shahri, Mirzo Ulug\'bek tumani, Rishton ko\'chasi 36',
    description: 'Erkaklar sog\'liq masalalari bo\'yicha mutaxassis. Urologik operatsiyalar va diagnostika.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-12:00',
    rating: 4.7,
    phone: '+998 90 222 44 66',
    image: '/doctors/doctor8.jpg'
  },
  {
    name: 'Dr. Shaxnoza Alieva',
    specialty: 'Onkolog',
    department: 'onkologiya',
    experience: '14 yil',
    address: 'Toshkent shahri, Olmazor tumani, Qushbegi ko\'chasi 47',
    description: 'Siyrtum kasalliklari bo\'yicha mutaxassis. Kimyoterapiya va radiatsion terapiya.',
    workingHours: 'Dushanba-Juma: 9:00-16:00, Shanba: Dam olish',
    rating: 4.8,
    phone: '+998 90 333 55 77',
    image: '/doctors/doctor9.jpg'
  },
  {
    name: 'Dr. Boburjon Hamidov',
    specialty: 'Gastroenterolog',
    department: 'gastroenterologiya',
    experience: '10 yil',
    address: 'Toshkent shahri, Yakkasaroy tumani, Qushbegi ko\'chasi 18',
    description: 'Hazm tizimi kasalliklari bo\'yicha mutaxassis. Gastroskopiya va kolonoskopiya tekshiruvlari.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-13:00',
    rating: 4.6,
    phone: '+998 90 444 66 88',
    image: '/doctors/doctor1.jpg'
  },
  {
    name: 'Dr. Nodira Razzokova',
    specialty: 'Fizioterapevt',
    department: 'fizioterapiya',
    experience: '7 yil',
    address: 'Toshkent shahri, Bektemir tumani, Farhod ko\'chasi 63',
    description: 'Fizioterapiya mutaxassisi. Elektroterapiya, magnitoterapiya va boshqa fizioterapevtik usullar.',
    workingHours: 'Dushanba-Juma: 8:00-16:00, Shanba: 8:00-12:00',
    rating: 4.5,
    phone: '+998 90 555 77 99',
    image: '/doctors/doctor3.jpg'
  },
  {
    name: 'Dr. Farhod Karimov',
    specialty: 'Massajchi',
    department: 'massaj',
    experience: '9 yil',
    address: 'Toshkent shahri, Sergeli tumani, Qatortol ko\'chasi 12',
    description: 'Professional massajchi. Sport va tibbiy massaj, manuall terapiya.',
    workingHours: 'Dushanba-Juma: 9:00-19:00, Shanba: 9:00-15:00',
    rating: 4.7,
    phone: '+998 90 666 88 00',
    image: '/doctors/doctor4.jpg'
  },
  {
    name: 'Dr. Mavluda Yusupova',
    specialty: 'Stomatolog',
    department: 'stomatologiya',
    experience: '6 yil',
    address: 'Toshkent shahri, Shayxontohur tumani, Navoiy ko\'chasi 88',
    description: 'Tish davolash va estetik stomatologiya mutaxassisi. Ortodontik davolash va implantatsiya.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-14:00',
    rating: 4.8,
    phone: '+998 90 777 99 11',
    image: '/doctors/doctor5.jpg'
  },
  {
    name: 'Dr. Sanjarbek Pulatov',
    specialty: 'Kardiolog',
    department: 'kardiologiya',
    experience: '8 yil',
    address: 'Toshkent shahri, Uchtepa tumani, Amir Temur ko\'chasi 99',
    description: 'Yurak-qon tomir kasalliklari bo\'yicha mutaxassis. EKG, UZI va stress-test tekshiruvlari.',
    workingHours: 'Dushanba-Juma: 10:00-18:00, Shanba: 10:00-13:00',
    rating: 4.6,
    phone: '+998 90 888 00 22',
    image: '/doctors/doctor6.jpg'
  },
  {
    name: 'Dr. Nilufar Hasanovna',
    specialty: 'Bolalar shifokori',
    department: 'bolalar',
    experience: '12 yil',
    address: 'Toshkent shahri, Mirobod tumani, Mustaqillik ko\'chasi 33',
    description: 'Bolalar kasalliklari bo\'yicha yuqori malakali shifokor. Chaqaloqlar va o\'smirlar tibbiy yordami.',
    workingHours: 'Dushanba-Juma: 8:00-16:00, Shanba: 8:00-12:00',
    rating: 4.9,
    phone: '+998 90 999 11 33',
    image: '/doctors/doctor8.jpg'
  },
  {
    name: 'Dr. Eldor Toirov',
    specialty: 'Terapevt',
    department: 'terapevt',
    experience: '10 yil',
    address: 'Toshkent shahri, Yunusobod tumani, Qodiriy ko\'chasi 45',
    description: 'Ichki kasalliklar bo\'yicha mutaxassis. Umumiy tibbiy ko\'rik va profilaktik tekshiruvlar.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-13:00',
    rating: 4.5,
    phone: '+998 90 000 11 22',
    image: '/doctors/doctor9.jpg'
  },
  {
    name: 'Dr. Zuxra Mirsaidova',
    specialty: 'Ginekolog',
    department: 'ginekologiya',
    experience: '9 yil',
    address: 'Toshkent shahri, Chilonzor tumani, Bunyodkor ko\'chasi 78',
    description: 'Ayollar salomatligi bo\'yicha mutaxassis. Reproduktiv sog\'liq va homiladorlik yordami.',
    workingHours: 'Dushanba-Juma: 9:00-16:00, Shanba: 9:00-12:00',
    rating: 4.7,
    phone: '+998 90 111 22 44',
    image: '/doctors/doctor1.jpg'
  },
  {
    name: 'Dr. Asrorbek Xolmatov',
    specialty: 'Ortoped',
    department: 'ortopediya',
    experience: '11 yil',
    address: 'Toshkent shahri, Mirzo Ulug\'bek tumani, Labzak ko\'chasi 55',
    description: 'Bo\'g\'imlar va suyaklar kasalliklari bo\'yicha mutaxassis. Travmatologiya va reabilitatsiya.',
    workingHours: 'Dushanba-Juma: 9:00-17:00, Shanba: 9:00-13:00',
    rating: 4.6,
    phone: '+998 90 222 33 55',
    image: '/doctors/doctor3.jpg'
  },
  {
    name: 'Dr. Dilafruz Normatova',
    specialty: 'Dermatolog',
    department: 'dermatologiya',
    experience: '7 yil',
    address: 'Toshkent shahri, Olmazor tumani, Farhod ko\'chasi 66',
    description: 'Teri kasalliklari bo\'yicha mutaxassis. Kosmetik dermatologiya va allergik teri kasalliklari.',
    workingHours: 'Dushanba-Juma: 10:00-17:00, Shanba: 10:00-13:00',
    rating: 4.8,
    phone: '+998 90 333 44 66',
    image: '/doctors/doctor4.jpg'
  },
  {
    name: 'Dr. Shavkat Mamatkarimov',
    specialty: 'Terapevt',
    department: 'terapevt',
    experience: '14 yil',
    address: 'Toshkent shahri, Shayxontohur tumani, Navoiy ko\'chasi 25',
    description: 'Tajribali umumiy terapevt. Xronik kasalliklarni kuzatish va profilaktik tekshiruvlar.',
    workingHours: 'Dushanba-Juma: 8:00-17:00, Shanba: 8:00-12:00',
    rating: 4.9,
    phone: '+998 90 444 77 88',
    image: '/doctors/doctor5.jpg'
  }
];

const seedDoctors = async () => {
  try {
    console.log('Starting doctor seeding process...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Clear existing doctors
    console.log('Clearing existing doctors...');
    const deleteResult = await Doctor.deleteMany({});
    console.log('Cleared', deleteResult.deletedCount, 'existing doctors');

    console.log('Sample doctors array length:', sampleDoctors.length);
    
    // Insert doctors in batches of 5 to avoid timeouts
    console.log('Inserting doctors in batches...');
    for (let i = 0; i < sampleDoctors.length; i += 5) {
      const batch = sampleDoctors.slice(i, i + 5);
      const doctorsToInsert = batch.map(doctorData => new Doctor(doctorData));
      await Doctor.insertMany(doctorsToInsert);
      console.log(`✅ Inserted batch of ${doctorsToInsert.length} doctors (${i + 1} to ${Math.min(i + 5, sampleDoctors.length)})`);
    }
    
    console.log('Successfully seeded all doctors database');
    
    // Verify insertion
    const newDoctors = await Doctor.find();
    console.log('New doctors count:', newDoctors.length);
    if (newDoctors.length > 0) {
      console.log('First doctor with image:', newDoctors[0].name, newDoctors[0].image);
      console.log('Last doctor with image:', newDoctors[newDoctors.length - 1].name, newDoctors[newDoctors.length - 1].image);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();