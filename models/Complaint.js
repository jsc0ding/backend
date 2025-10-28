import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of old complaints after 15 days (1296000 seconds)
complaintSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

export default mongoose.model('Complaint', complaintSchema);