// models/Hospital.js
import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// SOLID Principle: Single Responsibility Principle (SRP)
// This model is responsible only for hospital data structure and validation
export default mongoose.model('Hospital', hospitalSchema);
