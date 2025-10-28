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
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Initialize app and server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3006',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queue/doctors', doctorRoutes);
app.use('/api/queue/appointments', appointmentRoutes);
app.use('/api/queue/complaints', complaintRoutes);
app.use('/api/queue/service-appointments', serviceAppointmentRoutes);

// Serve React build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  // All other requests should serve React index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 ERROR DETAILS:', err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3006', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Socket connection
io.on('connection', (socket) => {
  console.log('🟢 User connected to Socket.IO');
  socket.on('disconnect', () => console.log('🔴 User disconnected'));
});

// Emit event when new appointment is created
global.emitNewAppointment = (appointment) => {
  io.emit('newAppointment', appointment);
};

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
