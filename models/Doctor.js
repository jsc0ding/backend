import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required']
  },
  specialty: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  experience: {
    type: String,
    required: [true, 'Experience information is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  workingHours: {
    type: String,
    required: [true, 'Working hours are required']
  },
  rating: {
    type: Number,
    required: true,
    default: 5.0,
    min: 0,
    max: 5
  },
  phone: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || v.match(/^\+998\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/) || v.match(/^\d{9}$/);
      },
      message: props => `${props.value} telefon raqami noto'g'ri formatda! Iltimos, +998 XX XXX XX XX yoki 9 raqamli formatdan foydalaning.`
    }
  },
  image: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
doctorSchema.index({ department: 1 });
doctorSchema.index({ name: 1 });

export default mongoose.model('Doctor', doctorSchema);