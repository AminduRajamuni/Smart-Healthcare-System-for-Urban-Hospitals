// controllers/PaymentController.js
import PaymentService from '../services/PaymentService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This controller is responsible only for handling payment-related HTTP requests
class PaymentController {
  // Get all payments for a specific patient
  async getPaymentsByPatientId(req, res) {
    try {
      const { patientId } = req.params;
      const payments = await PaymentService.getPaymentsByPatientId(patientId);
      
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Payments retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get a specific payment by appointment ID
  async getPaymentByAppointmentId(req, res) {
    try {
      const { appointmentId } = req.params;
      const payment = await PaymentService.getPaymentByAppointmentId(appointmentId);
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get unpaid payments for a patient
  async getUnpaidPayments(req, res) {
    try {
      const { patientId } = req.params;
      const payments = await PaymentService.getUnpaidPayments(patientId);
      
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Unpaid payments retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process cash payment
  async processCashPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const payment = await PaymentService.processCashPayment(appointmentId);
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Cash payment processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process card payment
  async processCardPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const cardDetails = req.body;
      
      const payment = await PaymentService.processCardPayment(appointmentId, cardDetails);
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Card payment processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process insurance claim
  async processInsuranceClaim(req, res) {
    try {
      const { appointmentId } = req.params;
      const insuranceDetails = req.body;
      
      const payment = await PaymentService.processInsuranceClaim(appointmentId, insuranceDetails);
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Insurance claim processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create dummy payments (for seeding)
  async createDummyPayments(req, res) {
    try {
      const payments = await PaymentService.createDummyPayments();
      
      res.status(201).json({
        success: true,
        data: payments,
        message: 'Dummy payments created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get payment summary for dashboard
  async getPaymentSummary(req, res) {
    try {
      const { patientId } = req.params;
      const allPayments = await PaymentService.getPaymentsByPatientId(patientId);
      const unpaidPayments = await PaymentService.getUnpaidPayments(patientId);
      
      const summary = {
        totalPayments: allPayments.length,
        unpaidPayments: unpaidPayments.length,
        paidPayments: allPayments.filter(p => p.paymentStatus === 'paid').length,
        governmentPaid: allPayments.filter(p => p.paymentStatus === 'government_paid').length,
        totalAmount: allPayments.reduce((sum, p) => sum + p.amount.total, 0),
        unpaidAmount: unpaidPayments.reduce((sum, p) => sum + p.amount.total, 0)
      };
      
      res.status(200).json({
        success: true,
        data: summary,
        message: 'Payment summary retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new PaymentController();
