import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { sendTelegramNotification } from '../utils/telegram.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    // Remove development-only logging
    res.status(500).json({ message: 'Server error' });
  }
});

// Get time slot availability for specific date and doctor
router.get('/time-slots', async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    
    if (!date || !doctorId) {
      return res.status(400).json({ message: 'Date and doctorId are required' });
    }
    
    // Find all appointments for the specific date and doctor
    const appointments = await Appointment.find({ 
      date: new Date(date), 
      doctor: doctorId 
    });
    
    // Define available time slots
    const availableTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    
    // Create time slots with status
    const timeSlots = availableTimeSlots.map(time => {
      const isBooked = appointments.some(apt => apt.time === time);
      return {
        time: time,
        status: isBooked ? 'booked' : 'available',
        available: !isBooked
      };
    });
    
    res.json(timeSlots);
  } catch (err) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching time slots:', err);
    }
    res.status(500).json({ message: 'Error fetching time slots' });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  try {
    console.log('=== Appointment Creation Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { patientName, patientPhone, doctor, date, time, department, fullName, phone, doctorId, doctorName, specialty } = req.body;
    
    // Handle both form types - SimpleAppointmentForm and AppointmentQueuePage form
    const name = patientName || fullName;
    const phoneNumber = patientPhone || phone;
    const docId = doctor || doctorId;
    const docName = doctorName || (doctor ? 'Unknown Doctor' : null);
    
    console.log('Parsed data:', { name, phoneNumber, docId, docName, date, time, department, specialty });
    
    // Validate required fields - only require name, phone, date, and time
    if (!name || !phoneNumber || !date || !time) {
      const missingFields = [];
      if (!name) missingFields.push('fullName');
      if (!phoneNumber) missingFields.push('phone');
      if (!date) missingFields.push('date');
      if (!time) missingFields.push('time');
      
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'All fields are required',
        missingFields: missingFields
      });
    }
    
    // Validate phone number format - accept both formats:
    // 1. +998 XX XXX XX XX (with spaces)
    // 2. 998XXXXXXXXX (without spaces)
    // 3. XXXXXXXXXX (10 digits)
    const phoneRegex = /^(\+998\s\d{2}\s\d{3}\s\d{2}\s\d{2}|\+998\d{9}|998\d{9}|\d{10}|\d{9})$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log('Invalid phone number format:', phoneNumber);
      return res.status(400).json({ 
        message: 'Invalid phone number format',
        receivedPhone: phoneNumber
      });
    }
    
    // Normalize phone number to standard format
    let normalizedPhone = phoneNumber;
    if (/^\d{9}$/.test(phoneNumber)) {
      // If it's 9 digits, add +998 prefix
      normalizedPhone = '+998' + phoneNumber;
      console.log('Normalized 9-digit phone:', normalizedPhone);
    } else if (/^\d{10}$/.test(phoneNumber)) {
      // If it's 10 digits starting with 9, add + prefix
      normalizedPhone = '+' + phoneNumber;
      console.log('Normalized 10-digit phone:', normalizedPhone);
    } else if (/^998\d{9}$/.test(phoneNumber)) {
      // If it starts with 998, add + prefix
      normalizedPhone = '+' + phoneNumber;
      console.log('Normalized 998-prefixed phone:', normalizedPhone);
    } else {
      console.log('Phone number already in correct format:', normalizedPhone);
    }
    
    // Check if doctor exists (if doctor ID is provided)
    let doctorExists = null;
    if (docId) {
      console.log('Looking up doctor with ID:', docId);
      doctorExists = await Doctor.findById(docId);
      if (!doctorExists) {
        console.log('Doctor not found with ID:', docId);
        return res.status(404).json({ message: 'Doctor not found' });
      }
      console.log('Doctor found:', doctorExists.name);
    }
    
    // Create new appointment
    const appointment = new Appointment({
      fullName: name,
      phone: normalizedPhone,
      date,
      time,
      doctor: docId || null,
      doctorName: docName || null,
      specialty: specialty || null,
      department: department || (doctorExists ? doctorExists.department : 'general') || null
    });
    
    console.log('Creating appointment with data:', {
      fullName: name,
      phone: normalizedPhone,
      date,
      time,
      doctor: docId || null,
      doctorName: docName || null,
      specialty: specialty || null,
      department: department || (doctorExists ? doctorExists.department : 'general') || null
    });

    const savedAppointment = await appointment.save();
    console.log('Appointment saved successfully:', savedAppointment._id);
    
    // Populate doctor information if doctor exists
    if (docId) {
      await savedAppointment.populate('doctor', 'name specialty department');
    }
    
    // Emit event for real-time updates
    if (typeof emitNewAppointment === 'function') {
      emitNewAppointment(savedAppointment);
    }
    
    // Send Telegram notification using the comprehensive notification function
    try {
      // Prepare appointment data for Telegram notification
      const appointmentData = {
        fullName: savedAppointment.fullName,
        phone: savedAppointment.phone,
        doctorName: savedAppointment.doctorName || (savedAppointment.doctor ? savedAppointment.doctor.name : 'Shifokor aniqlanmadi'),
        specialty: savedAppointment.specialty || (savedAppointment.doctor ? savedAppointment.doctor.specialty : 'Mutaxassislik aniqlanmadi'),
        department: savedAppointment.department || (savedAppointment.doctor ? savedAppointment.doctor.department : 'Bo\'lim aniqlanmadi'),
        date: savedAppointment.date,
        time: savedAppointment.time
      };
      
      console.log('Sending Telegram notification with data:', JSON.stringify(appointmentData, null, 2));
      
      // Send notification to Telegram
      const telegramResult = await sendTelegramNotification(appointmentData);
      
      if (telegramResult) {
        console.log('✅ Telegram notification sent successfully for appointment:', savedAppointment._id);
      } else {
        console.error('❌ Failed to send Telegram notification for appointment:', savedAppointment._id);
      }
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
      // Don't fail the appointment creation if Telegram notification fails
    }
    
    res.status(201).json(savedAppointment);
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating appointment:', error);
    }
    res.status(400).json({ message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching appointment:', error);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating appointment:', error);
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting appointment:', error);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;