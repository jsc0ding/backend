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
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        ...(process.env.NODE_ENV === 'development' ? ["http://localhost:3002", "ws://localhost:*"] : [])
      ],
      frameSrc: ["'self'"]
    }
  },
  // Only enable HSTS in production
  hsts: process.env.NODE_ENV === 'production'
}));

// Add CORS middleware before all routes
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL || 'https://shifoxona-app.onrender.com',
      'https://frontend-1-ixqz.onrender.com',
      'http://localhost:3002', 
      'http://localhost:3000'
    ]
  : [
      'http://localhost:3002', 
      'http://localhost:3000', 
      'https://frontend-1-ixqz.onrender.com'
    ];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No origin'}`);
  console.log('Allowed origins:', allowedOrigins);
  next();
});

// Add express.json() as specified in instructions
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add URL encoded support

// Routes
console.log('Setting up API routes');
app.use('/api/auth', (req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.path}`);
  next();
}, authRoutes);

app.use('/api/admin', (req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.path}`);
  next();
}, adminRoutes);

app.use('/api/queue/doctors', (req, res, next) => {
  console.log(`Doctors route accessed: ${req.method} ${req.path}`);
  next();
}, doctorRoutes);

app.use('/api/queue/appointments', (req, res, next) => {
  console.log(`Appointments route accessed: ${req.method} ${req.path}`);
  next();
}, appointmentRoutes);

app.use('/api/queue/complaints', (req, res, next) => {
  console.log(`Complaints route accessed: ${req.method} ${req.path}`);
  next();
}, complaintRoutes);

app.use('/api/queue/service-appointments', (req, res, next) => {
  console.log(`Service appointments route accessed: ${req.method} ${req.path}`);
  next();
}, serviceAppointmentRoutes);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"]
  },
  // Keep connection alive
  pingInterval: 25000,
  pingTimeout: 20000,
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Socket.IO client connected');
  
  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });
});

// Emit event when a new appointment is created
const emitNewAppointment = (appointment) => {
  io.emit('newAppointment', appointment);
};

// Make emitNewAppointment available globally
global.emitNewAppointment = emitNewAppointment;

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  res.status(200).json(healthStatus);
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CORS is working correctly',
    origin: req.get('Origin') || 'No origin header'
  });
});

// Serve static files from the React app build directory (only in production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const __buildPath = path.join(__dirname, '../client/build');
  
  console.log('Checking for build directory at:', __buildPath);
  
  // Check if build directory exists
  if (fs.existsSync(__buildPath)) {
    console.log('✅ Build directory found, serving static files');
    
    // Serve static files with better error handling
    app.use(express.static(__buildPath, {
      maxAge: '1y',
      etag: false
    }));
    
    // Serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      // Check if the requested file exists
      const filePath = path.join(__buildPath, req.path);
      
      // If it's a file request (has extension), check if it exists
      if (path.extname(req.path)) {
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // File doesn't exist, serve index.html for SPA
            res.sendFile(path.join(__buildPath, 'index.html'));
          } else {
            // File exists, let express.static handle it
            next();
          }
        });
      } else {
        // No extension, serve index.html for SPA routing
        res.sendFile(path.join(__buildPath, 'index.html'));
      }
    });
  } else {
    console.log('⚠️ Build directory not found at:', __buildPath);
    // Fallback if build directory doesn't exist
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

// Keep-alive mechanism
setInterval(() => {
  // Log server status periodically
  console.log(`🏥 Server health check - Uptime: ${Math.floor(process.uptime())}s, Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 300000); // Every 5 minutes

// Start server
console.log('PORT from environment:', process.env.PORT);
console.log('Using PORT:', PORT);
server.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Log startup completion
  console.log('🚀 Server startup complete!');
  console.log('📡 Ready to accept connections');
});