import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';

class ReportController {
  async getSummary(req, res) {
    try {
      const { from, to, hospitalId, doctorId, department } = req.query;

      const patientMatch = {};
      if (from || to) {
        patientMatch.createdAt = {};
        if (from) patientMatch.createdAt.$gte = new Date(from);
        if (to) patientMatch.createdAt.$lte = new Date(to);
      }

      // Base queries
      const [totalPatients, totalDoctors, totalHospitals] = await Promise.all([
        Patient.countDocuments(patientMatch),
        Doctor.countDocuments(hospitalId ? { hospital: new mongoose.Types.ObjectId(hospitalId) } : {}),
        Hospital.countDocuments({})
      ]);

      // Patients by gender
      const patientsByGenderAgg = await Patient.aggregate([
        { $match: patientMatch },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      const patientsByGender = patientsByGenderAgg.reduce((acc, cur) => {
        acc[cur._id || 'unknown'] = cur.count;
        return acc;
      }, {});

      // Doctors by specialization (optionally filter by hospital)
      const doctorMatch = {};
      if (hospitalId) doctorMatch.hospital = new mongoose.Types.ObjectId(hospitalId);
      if (doctorId) doctorMatch._id = new mongoose.Types.ObjectId(doctorId);
      const doctorsBySpecializationAgg = await Doctor.aggregate([
        Object.keys(doctorMatch).length ? { $match: doctorMatch } : { $match: {} },
        { $group: { _id: '$specialization', count: { $sum: 1 } } }
      ]);
      const doctorsBySpecialization = doctorsBySpecializationAgg.reduce((acc, cur) => {
        acc[cur._id || 'Unknown'] = cur.count;
        return acc;
      }, {});

      // Patients by day (last 7 days by default or within range)
      const dateRangeMatch = { ...patientMatch };
      if (!from && !to) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        dateRangeMatch.createdAt = { $gte: sevenDaysAgo };
      }
      const patientsByDayAgg = await Patient.aggregate([
        { $match: dateRangeMatch },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      const patientsByDay = patientsByDayAgg.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
        count: d.count
      }));

      return res.json({
        success: true,
        data: {
          totals: {
            patients: totalPatients,
            doctors: totalDoctors,
            hospitals: totalHospitals
          },
          patientsByGender,
          doctorsBySpecialization,
          patientsByDay
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ReportController();


