// models/Payment.js
import mongoose from 'mongoose';

// SOLID Principle: Single Responsibility Principle (SRP)
// This model defines only the payment data schema and related hooks

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Completed', 'Cancelled']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['paid', 'unpaid', 'government_paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', null],
    default: null
  },
  amount: {
    treatment: {
      type: Number,
      default: 0
    },
    doctorCharge: {
      type: Number,
      default: 0
    },
    medicine: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  insuranceDetails: {
    patientName: String,
    relationship: String,
    insuranceCompany: String,
    policyNumber: String,
    expirationDate: String
  }
}, {
  timestamps: true
});

// Generate unique appointment ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    // Generate appointment ID: APP- + random 3 digits
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.appointmentId = `APP-${random}`;
  }
  next();
});

// Calculate total amount
paymentSchema.pre('save', function(next) {
  this.amount.total = this.amount.treatment + this.amount.doctorCharge + this.amount.medicine;
  next();
});

export default mongoose.model('Payment', paymentSchema);
