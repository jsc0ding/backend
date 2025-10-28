import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
  },
  doctorName: {
    type: String,
    required: false
  },
  specialty: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired appointments after 15 days (1296000 seconds)
appointmentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

// Index for automatic cleanup of expired appointments by date/time
appointmentSchema.index({ date: 1, time: 1 });

// Index for optimizing time slot queries
appointmentSchema.index({ date: 1, doctor: 1, time: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });

export default mongoose.model('Appointment', appointmentSchema);