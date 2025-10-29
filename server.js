import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import serviceAppointmentRoutes from './routes/serviceAppointmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Database configuration
import connectDB from './config/db.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5012; // Changed default to 5012 to match client proxy

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:3000", "http://localhost:3002", "http://localhost:3006", "http://localhost:5000", "http://localhost:5012"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https:",
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3006",
        "http://localhost:5000",
        "http://localhost:5012",
        "ws://localhost:3000",
        "ws://localhost:3002",
        "ws://localhost:3006",
        "ws://localhost:5000",
        "ws://localhost:5012"
      ],
      frameSrc: ["'self'"]
    }
  },
  // Only enable HSTS in production
  hsts: process.env.NODE_ENV === 'production'
}));

// Add CORS middleware before all routes as specified in instructions
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3006', 'http://localhost:5000', 'http://localhost:5012'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

// Add express.json() as specified in instructions
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add URL encoded support

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queue/doctors', doctorRoutes);
app.use('/api/queue/appointments', appointmentRoutes);
app.use('/api/queue/complaints', complaintRoutes);
app.use('/api/queue/service-appointments', serviceAppointmentRoutes);

// Serve static files from the React app build directory (only in production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const __buildPath = path.join(__dirname, '../client/build');
  
  // Check if build directory exists
  if (fs.existsSync(__buildPath)) {
    // Serve static files
    app.use(express.static(__buildPath));
    
    // Serve index.html for all non-API routes
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return;
      }
      res.sendFile(path.join(__buildPath, 'index.html'));
    });
  } else {
    // Fallback if build directory doesn't exist
    console.log('⚠️  Build directory not found, serving API only');
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Hospital Management API Server', 
        status: 'running',
        note: 'Frontend build not found - API endpoints available at /api/*'
      });
    });
  }
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 ERROR DETAILS:', err);
  
  // Determine status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
});

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3006', 'http://localhost:5000', 'http://localhost:5012'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
});

// Emit event when a new appointment is created
const emitNewAppointment = (appointment) => {
  io.emit('newAppointment', appointment);
};

// Make emitNewAppointment available globally
global.emitNewAppointment = emitNewAppointment;

// Start server
console.log('PORT from environment:', process.env.PORT);
console.log('Using PORT:', PORT);
server.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});