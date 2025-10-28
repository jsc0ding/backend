import express from 'express';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Complaint from '../models/Complaint.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', protect, requireAdmin, async (req, res) => {
  try {
    // Get counts for all entities
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    
    const totalComplaints = await Complaint.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    
    // Get recent appointments (last 5)
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName doctorName date time status');
    
    // Get recent complaints (last 5)
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name message createdAt');
    
    res.json({
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      todayAppointments,
      totalComplaints,
      totalDoctors,
      recentAppointments,
      recentComplaints
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats', error: error.message });
  }
});

// GET /api/admin/appointments - Get all appointments
router.get('/appointments', protect, requireAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments', error: error.message });
  }
});

// PUT /api/admin/appointments/:id - Update appointment
router.put('/appointments/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error while updating appointment', error: error.message });
  }
});

// DELETE /api/admin/appointments/:id - Delete appointment
router.delete('/appointments/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error while deleting appointment', error: error.message });
  }
});

// GET /api/admin/complaints - Get all complaints
router.get('/complaints', protect, requireAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Server error while fetching complaints', error: error.message });
  }
});

// DELETE /api/admin/complaints/:id - Delete complaint
router.delete('/complaints/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedComplaint = await Complaint.findByIdAndDelete(id);
    
    if (!deletedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Server error while deleting complaint', error: error.message });
  }
});

// POST /api/admin/doctors - Add a new doctor
router.post('/doctors', protect, requireAdmin, async (req, res) => {
  try {
    const { name, specialty, department, experience, address, description, workingHours, rating, phone, image } = req.body;
    
    const newDoctor = new Doctor({
      name,
      specialty,
      department,
      experience,
      address,
      description,
      workingHours,
      rating: rating || 5.0,
      phone,
      image
    });
    
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ message: 'Server error while adding doctor', error: error.message });
  }
});

// GET /api/admin/doctors - Get all doctors
router.get('/doctors', protect, requireAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error while fetching doctors', error: error.message });
  }
});

// PUT /api/admin/doctors/:id - Update a doctor
router.put('/doctors/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Server error while updating doctor', error: error.message });
  }
});

// DELETE /api/admin/doctors/:id - Delete a doctor
router.delete('/doctors/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    
    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json({ message: 'Doctor deleted successfully', deletedDoctor });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Server error while deleting doctor', error: error.message });
  }
});

export default router;