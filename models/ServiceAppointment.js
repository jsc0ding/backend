import mongoose from 'mongoose';

const serviceAppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps option for consistency with Appointment model
  timestamps: true
});

export default mongoose.model('ServiceAppointment', serviceAppointmentSchema);