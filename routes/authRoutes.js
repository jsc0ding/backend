import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Check if code is provided
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }
    
    // Check if code matches admin code
    if (code !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: 'Invalid code' });
    }
    
    // Find the admin user in the database
    const adminUser = await User.findOne({ email: 'admin@medqueue.uz' });
    if (!adminUser) {
      return res.status(401).json({ message: 'Admin user not found' });
    }
    
    // Create token (unified JWT secret with fallback)
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-development';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    
    // Generate JWT token with the actual admin user ID
    const token = jwt.sign(
      { 
        id: adminUser._id,
        name: adminUser.name
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    
    res.json({
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name
      }
    });
  } catch (error) {
    // Remove development-only logging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login endpoint - Simple code only
router.post('/admin/login', async (req, res) => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code) {
      return res.status(400).json({ message: 'Kod talab qilinadi' });
    }

    // Check admin code from environment or default
    const ADMIN_CODE = process.env.ADMIN_CODE || '123';
    
    if (code !== ADMIN_CODE) {
      return res.status(401).json({ message: 'Noto\'g\'ri kod' });
    }

    // Find the admin user in the database
    const adminUser = await User.findOne({ email: 'admin@medqueue.uz' });
    if (!adminUser) {
      return res.status(401).json({ message: 'Admin user not found' });
    }

    // Use unified JWT secret with fallback
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-development';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    
    // Generate JWT token with the actual admin user ID
    const token = jwt.sign(
      { 
        id: adminUser._id,
        name: adminUser.name
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name
      }
    });
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }
    res.status(500).json({ message: 'Server xatosi' });
  }
});

// Register endpoint (Admin only - for creating new admin users)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Barcha maydonlar talab qilinadi' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    res.status(201).json({
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.error('Register error:', error);
    }
    res.status(500).json({ message: 'Server xatosi' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      name: req.user.name
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Authentication service is running' });
});

export default router;