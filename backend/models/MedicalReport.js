// models/MedicalReport.js
import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  prescribedMedications: {
    type: [String],
    required: false,
    default: []
  },
  createdBy: {
    // Optional: user/doctor who created the report
    type: String,
    required: false,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate reportId before saving
medicalReportSchema.pre('validate', function(next) {
  if (!this.reportId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.reportId = `REP${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('MedicalReport', medicalReportSchema);


