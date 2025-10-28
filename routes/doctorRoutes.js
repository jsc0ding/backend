import express from 'express';
import Doctor from '../models/Doctor.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Get all doctors (public route - no authentication needed for frontend display)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by ID (public route - no authentication needed for frontend display)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new doctor (protected route)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a doctor (protected route)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a doctor (protected route)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;