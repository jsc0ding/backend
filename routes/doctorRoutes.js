import express from 'express';
import Doctor from '../models/Doctor.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Add CORS headers to all routes
router.use((req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.status(200).send();
    return;
  }
  
  next();
});

// Health check endpoint for doctors API
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Doctors API is running',
    timestamp: new Date().toISOString()
  });
});

// Get all doctors (public route - no authentication needed for frontend display)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all doctors');
    const doctors = await Doctor.find();
    console.log(`Found ${doctors.length} doctors`);
    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', '*');
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    // Add CORS headers to error response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by ID (public route - no authentication needed for frontend display)
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching doctor by ID:', req.params.id);
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      console.log('Doctor not found for ID:', req.params.id);
      // Add CORS headers to response
      res.header('Access-Control-Allow-Origin', '*');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', '*');
    res.json(doctor);
  } catch (err) {
    console.error('Error fetching doctor:', err);
    // Add CORS headers to error response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ message: err.message });
  }
});

// Create a new doctor (protected route)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(201).json(savedDoctor);
  } catch (err) {
    // Add CORS headers to error response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(400).json({ message: err.message });
  }
});

// Update a doctor (protected route)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) {
      // Add CORS headers to response
      res.header('Access-Control-Allow-Origin', '*');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', '*');
    res.json(doctor);
  } catch (err) {
    // Add CORS headers to error response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(400).json({ message: err.message });
  }
});

// Delete a doctor (protected route)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      // Add CORS headers to response
      res.header('Access-Control-Allow-Origin', '*');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    // Add CORS headers to response
    res.header('Access-Control-Allow-Origin', '*');
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    // Add CORS headers to error response
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ message: err.message });
  }
});

export default router;