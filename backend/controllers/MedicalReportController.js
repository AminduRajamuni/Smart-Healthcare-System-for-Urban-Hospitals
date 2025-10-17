// controllers/MedicalReportController.js
import MedicalReportService from '../services/MedicalReportService.js';

class MedicalReportController {
  async createReport(req, res) {
    try {
      const { patientId } = req.params;
      const report = await MedicalReportService.createReport(patientId, req.body);
      res.status(201).json({
        success: true,
        message: 'Medical report saved successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReports(req, res) {
    try {
      const { patientId } = req.params;
      const reports = await MedicalReportService.getReportsByPatient(patientId);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAllReports(req, res) {
    try {
      const reports = await MedicalReportService.getAllReports();
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const deleted = await MedicalReportService.deleteReportById(id);
      res.status(200).json({ success: true, message: 'Report deleted', data: deleted });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

export default new MedicalReportController();


