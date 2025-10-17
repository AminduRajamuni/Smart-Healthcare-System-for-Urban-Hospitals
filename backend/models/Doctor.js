// models/Doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'Cardiology',
      'Dermatology', 
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'General Medicine',
      'Surgery',
      'Emergency Medicine'
    ]
  },
  time: {
    type: String,
    required: true
  },
  pricePerSchedule: {
    type: Number,
    required: true,
    min: 0
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// SOLID Principle: Single Responsibility Principle (SRP)
// This model is responsible only for doctor data structure and validation
export default mongoose.model('Doctor', doctorSchema);
