import mockingoose from 'mockingoose';
import mongoose from 'mongoose';

import MedicalReport from '../models/MedicalReport.js';
import Patient from '../models/Patient.js';
import MedicalReportService from '../services/MedicalReportService.js';

describe('MedicalReportService.createReport', () => {
  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    mockingoose.resetAll();
  });

  // Test successful report creation with valid patient and diagnosis
  it('creates a report when patient exists and diagnosis provided', async () => {
    const patientObjectId = new mongoose.Types.ObjectId();
    const patientDoc = {
      _id: patientObjectId,
      patientId: 'PAT123456',
      name: 'John Doe',
      email: 'john@example.com',
      dob: new Date('1990-01-01'),
      gender: 'male',
      address: '123 Street',
      contactNumber: '1234567890'
    };

    // Mock patient lookup to return test patient
    mockingoose(Patient).toReturn(patientDoc, 'findOne');

    const savedReportDoc = {
      _id: new mongoose.Types.ObjectId(),
      patient: patientObjectId,
      title: 'Medical Report',
      diagnosis: 'Flu',
      notes: 'Rest and fluids',
      prescribedMedications: ['Paracetamol'],
      createdBy: 'Dr. Smith',
      reportId: 'REP123456789',
      createdAt: new Date()
    };

    // Mock report save operation
    mockingoose(MedicalReport).toReturn(savedReportDoc, 'save');

    const result = await MedicalReportService.createReport('PAT123456', {
      diagnosis: 'Flu',
      notes: 'Rest and fluids',
      prescribedMedications: ['Paracetamol'],
      createdBy: 'Dr. Smith'
    });

    // Verify report was created with correct data
    expect(result).toBeDefined();
    expect(result.patient.toString()).toBe(patientObjectId.toString());
    expect(result.diagnosis).toBe('Flu');
    expect(result.title).toBe('Medical Report');
  });

  // Test error handling when patient doesn't exist
  it('throws error when patient not found', async () => {
    // Mock patient lookup to return null (patient not found)
    mockingoose(Patient).toReturn(null, 'findOne');

    await expect(
      MedicalReportService.createReport('UNKNOWN', { diagnosis: 'Flu' })
    ).rejects.toThrow('Patient not found');
  });

  // Test validation when required diagnosis field is missing
  it("throws error when 'Diagnosis' is missing", async () => {
    const patientObjectId = new mongoose.Types.ObjectId();
    // Mock patient exists but report data is incomplete
    mockingoose(Patient).toReturn({ _id: patientObjectId, patientId: 'PAT1', name: 'Jane', email: 'jane@example.com', dob: new Date('1992-02-02'), gender: 'female', address: 'Addr', contactNumber: '000' }, 'findOne');

    await expect(
      MedicalReportService.createReport('PAT1', { notes: 'n/a' })
    ).rejects.toThrow("'Diagnosis' is required");
  });
});


