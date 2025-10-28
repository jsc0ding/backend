import express from 'express';
import Complaint from '../models/Complaint.js';
import { sendComplaintNotification } from '../utils/telegram.js';

const router = express.Router();

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    // Remove development-only logging
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  try {
    // The frontend sends: name (doctor name), phone (user's phone), message (complaint text)
    const { name, phone, message } = req.body;
    
    // Validate required fields
    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate phone number format - accept multiple formats:
    // 1. +998 XX XXX XX XX (with spaces)
    // 2. +998XXXXXXXXX (without spaces)
    // 3. 998XXXXXXXXX (without +)
    // 4. XXXXXXXXX (9 digits)
    const phoneRegex = /^(\+998\s\d{2}\s\d{3}\s\d{2}\s\d{2}|\+998\d{9}|998\d{9}|\d{9})$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Normalize phone number to standard format
    let normalizedPhone = phone;
    if (/^\d{9}$/.test(phone)) {
      // If it's 9 digits, add +998 prefix
      normalizedPhone = '+998' + phone;
    } else if (/^998\d{9}$/.test(phone)) {
      // If it starts with 998, add + prefix
      normalizedPhone = '+' + phone;
    } else if (/^\+998\d{9}$/.test(phone)) {
      // If it starts with +998 followed by 9 digits, keep as is
      normalizedPhone = phone;
    }
    
    // Create new complaint
    const newComplaint = new Complaint({
      name,
      phone: normalizedPhone,
      message
    });
    
    const savedComplaint = await newComplaint.save();
    
    // Send Telegram notification
    try {
      const telegramResult = await sendComplaintNotification({
        name: savedComplaint.name,
        phone: savedComplaint.phone,
        message: savedComplaint.message,
        createdAt: savedComplaint.createdAt
      });
      
      if (!telegramResult) {
        console.error('Failed to send Telegram notification for complaint:', savedComplaint._id);
      }
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
    }
    
    res.status(201).json(savedComplaint);
  } catch (error) {
    // Remove development-only logging
    res.status(400).json({ message: error.message });
  }
});

// Update a complaint
router.put('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a complaint
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;