// services/MedicalReportService.js
import MedicalReport from '../models/MedicalReport.js';
import Patient from '../models/Patient.js';

class MedicalReportService {
  async createReport(patientIdentifier, reportData) {
    // patientIdentifier can be patientId or ObjectId
    const patient = await this.findPatientByIdentifier(patientIdentifier);
    if (!patient) {
      throw new Error('Patient not found');
    }

    if (!reportData.diagnosis) {
      throw new Error("'Diagnosis' is required");
    }

    const report = new MedicalReport({
      patient: patient._id,
      title: reportData.title || 'Medical Report',
      diagnosis: reportData.diagnosis,
      notes: reportData.notes,
      prescribedMedications: reportData.prescribedMedications || [],
      createdBy: reportData.createdBy
    });

    return await report.save();
  }

  async getAllReports() {
    return await MedicalReport.find({})
      .populate('patient', 'patientId name email gender dob contactNumber')
      .sort({ createdAt: -1 });
  }

  async getReportsByPatient(patientIdentifier) {
    const patient = await this.findPatientByIdentifier(patientIdentifier);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return await MedicalReport.find({ patient: patient._id })
      .populate('patient', 'patientId name email gender dob contactNumber')
      .sort({ createdAt: -1 });
  }

  async findPatientByIdentifier(identifier) {
    // try by patientId field
    let patient = await Patient.findOne({ patientId: identifier });
    if (patient) return patient;
    // try by ObjectId
    if (identifier && identifier.match && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await Patient.findById(identifier);
      if (patient) return patient;
    }
    return null;
  }

  async deleteReportById(reportId) {
    const deleted = await MedicalReport.findByIdAndDelete(reportId);
    if (!deleted) {
      throw new Error('Report not found');
    }
    return deleted;
  }
}

export default new MedicalReportService();


