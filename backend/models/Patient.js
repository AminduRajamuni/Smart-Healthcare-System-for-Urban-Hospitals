// models/Patient.js
import mongoose from 'mongoose';

// SOLID Principle: Single Responsibility Principle (SRP)
// This model defines only the patient data schema and related hooks

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: false,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique patient ID before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    // Generate patient ID: PAT + timestamp + random 3 digits
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.patientId = `PAT${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('Patient', patientSchema);
