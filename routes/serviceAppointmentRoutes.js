import express from 'express';
import ServiceAppointment from '../models/ServiceAppointment.js';
import { sendServiceAppointmentNotification } from '../utils/telegram.js';

const router = express.Router();

// Create a new service appointment
router.post('/', async (req, res) => {
  try {
    const { patientName, patientPhone, serviceType, date, time } = req.body;
    
    // Validate required fields
    if (!patientName || !patientPhone || !serviceType || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate phone number format
    const phoneRegex = /^(\+998\s\d{2}\s\d{3}\s\d{2}\s\d{2}|\d{9})$/;
    if (!phoneRegex.test(patientPhone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Create new service appointment
    const serviceAppointment = new ServiceAppointment({
      patientName,
      patientPhone,
      serviceType,
      date,
      time
    });
    
    const savedServiceAppointment = await serviceAppointment.save();

    // Send Telegram notification for service appointment
    try {
      const notificationData = {
        patientName: savedServiceAppointment.patientName,
        patientPhone: savedServiceAppointment.patientPhone,
        serviceType: savedServiceAppointment.serviceType,
        date: savedServiceAppointment.date,
        time: savedServiceAppointment.time
      };

      console.log('Sending Telegram notification for service appointment:', JSON.stringify(notificationData, null, 2));

      const telegramResult = await sendServiceAppointmentNotification(notificationData);

      if (telegramResult) {
        console.log('✅ Telegram notification sent successfully for service appointment:', savedServiceAppointment._id);
      } else {
        console.error('❌ Failed to send Telegram notification for service appointment:', savedServiceAppointment._id);
      }
    } catch (telegramError) {
      console.error('Error sending Telegram notification for service appointment:', telegramError);
      // Don't fail the appointment creation if Telegram notification fails
    }

    res.status(201).json(savedServiceAppointment);
  } catch (error) {
    // Remove development-only logging
    res.status(400).json({ message: error.message });
  }
});

// Get all service appointments
router.get('/', async (req, res) => {
  try {
    const serviceAppointments = await ServiceAppointment.find().sort({ createdAt: -1 });
    res.json(serviceAppointments);
  } catch (error) {
    // Remove development-only logging
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific service appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await ServiceAppointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Service appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching service appointment:', err);
    }
    res.status(500).json({ 
      message: 'Failed to fetch service appointment',
      error: err.message 
    });
  }
});

// Delete a service appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await ServiceAppointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Service appointment not found' });
    }
    
    // Emit event for real-time updates
    if (global.emitNewAppointment) {
      global.emitNewAppointment({
        ...appointment.toObject(),
        type: 'deleted',
        _id: req.params.id
      });
    }
    
    res.json({ message: 'Service appointment deleted successfully' });
  } catch (err) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting service appointment:', err);
    }
    res.status(500).json({ 
      message: 'Failed to delete service appointment',
      error: err.message 
    });
  }
});

// Update a service appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await ServiceAppointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Service appointment not found' });
    }
    
    res.json({
      message: 'Service appointment updated successfully',
      appointment
    });
  } catch (err) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating service appointment:', err);
    }
    res.status(500).json({ 
      message: 'Failed to update service appointment',
      error: err.message 
    });
  }
});

export default router;