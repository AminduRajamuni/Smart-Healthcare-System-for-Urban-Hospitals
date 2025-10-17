// services/PaymentService.js
import Payment from '../models/Payment.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for payment-related business logic
class PaymentService {
  // Get all payments for a specific patient
  async getPaymentsByPatientId(patientId) {
    try {
      const payments = await Payment.find({ patientId }).sort({ appointmentDate: -1 });
      return payments;
    } catch (error) {
      throw new Error(`Failed to fetch payments for patient ${patientId}: ${error.message}`);
    }
  }

  // Get a specific payment by appointment ID
  async getPaymentByAppointmentId(appointmentId) {
    try {
      const payment = await Payment.findOne({ appointmentId });
      if (!payment) {
        throw new Error(`Payment not found for appointment ${appointmentId}`);
      }
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  // Create a new payment record
  async createPayment(paymentData) {
    try {
      const payment = new Payment(paymentData);
      await payment.save();
      return payment;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  // Update payment status (mark as paid)
  async updatePaymentStatus(appointmentId, paymentData) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { appointmentId },
        {
          ...paymentData,
          paymentDate: new Date(),
          transactionId: this.generateTransactionId()
        },
        { new: true }
      );
      
      if (!payment) {
        throw new Error(`Payment not found for appointment ${appointmentId}`);
      }
      
      return payment;
    } catch (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  // Process cash payment
  async processCashPayment(appointmentId) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { appointmentId },
        {
          paymentStatus: 'paid',
          paymentMethod: 'cash',
          paymentDate: new Date(),
          transactionId: this.generateTransactionId()
        },
        { new: true }
      );
      
      if (!payment) {
        throw new Error(`Payment not found for appointment ${appointmentId}`);
      }
      
      return payment;
    } catch (error) {
      throw new Error(`Failed to process cash payment: ${error.message}`);
    }
  }

  // Process card payment
  async processCardPayment(appointmentId, cardDetails) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { appointmentId },
        {
          paymentStatus: 'paid',
          paymentMethod: 'card',
          paymentDate: new Date(),
          transactionId: this.generateTransactionId()
        },
        { new: true }
      );
      
      if (!payment) {
        throw new Error(`Payment not found for appointment ${appointmentId}`);
      }
      
      return payment;
    } catch (error) {
      throw new Error(`Failed to process card payment: ${error.message}`);
    }
  }

  // Process insurance claim
  async processInsuranceClaim(appointmentId, insuranceDetails) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { appointmentId },
        {
          paymentStatus: 'paid',
          paymentMethod: 'insurance',
          paymentDate: new Date(),
          transactionId: this.generateTransactionId(),
          insuranceDetails
        },
        { new: true }
      );
      
      if (!payment) {
        throw new Error(`Payment not found for appointment ${appointmentId}`);
      }
      
      return payment;
    } catch (error) {
      throw new Error(`Failed to process insurance claim: ${error.message}`);
    }
  }

  // Get unpaid payments for a patient
  async getUnpaidPayments(patientId) {
    try {
      const payments = await Payment.find({ 
        patientId, 
        paymentStatus: 'unpaid' 
      }).sort({ appointmentDate: -1 });
      return payments;
    } catch (error) {
      throw new Error(`Failed to fetch unpaid payments: ${error.message}`);
    }
  }

  // Generate transaction ID
  generateTransactionId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TNX${timestamp}${random}`;
  }

  // Create dummy payments for all patients
  async createDummyPayments() {
    try {
      const dummyPayments = [
        {
          appointmentId: 'APP-001',
          patientId: 'PAT270638583',
          doctorId: 'DOC-101',
          hospitalName: 'Asiri Hospital Colombo',
          service: 'Cardiology Consultation',
          appointmentDate: new Date('2025-10-20'),
          appointmentTime: '10:30 AM',
          status: 'Scheduled',
          paymentStatus: 'unpaid',
          amount: {
            treatment: 10000,
            doctorCharge: 2460,
            medicine: 0,
            total: 12460
          }
        },
        {
          appointmentId: 'APP-002',
          patientId: 'PAT270638583',
          doctorId: 'DOC-205',
          hospitalName: 'Lanka Hospitals',
          service: 'Neurology Follow-up',
          appointmentDate: new Date('2025-10-21'),
          appointmentTime: '02:00 PM',
          status: 'Scheduled',
          paymentStatus: 'unpaid',
          amount: {
            treatment: 15000,
            doctorCharge: 3000,
            medicine: 5000,
            total: 23000
          }
        },
        {
          appointmentId: 'APP-003',
          patientId: 'PAT270638583',
          doctorId: 'DOC-310',
          hospitalName: 'National Hospital SL',
          service: 'General Medicine Check-up',
          appointmentDate: new Date('2025-10-22'),
          appointmentTime: '09:00 AM',
          status: 'Scheduled',
          paymentStatus: 'government_paid',
          amount: {
            treatment: 0,
            doctorCharge: 0,
            medicine: 0,
            total: 0
          }
        },
        {
          appointmentId: 'APP-004',
          patientId: 'PAT270638583',
          doctorId: 'DOC-101',
          hospitalName: 'Asiri Hospital Colombo',
          service: 'Cardiology Consultation',
          appointmentDate: new Date('2025-10-15'),
          appointmentTime: '11:00 AM',
          status: 'Completed',
          paymentStatus: 'paid',
          paymentMethod: 'cash',
          transactionId: 'TNX123454',
          paymentDate: new Date('2025-10-15'),
          amount: {
            treatment: 10000,
            doctorCharge: 2460,
            medicine: 0,
            total: 12460
          }
        },
        {
          appointmentId: 'APP-005',
          patientId: 'PAT270638583',
          doctorId: 'DOC-205',
          hospitalName: 'Lanka Hospitals',
          service: 'Neurology Consultation',
          appointmentDate: new Date('2025-10-18'),
          appointmentTime: '03:30 PM',
          status: 'Cancelled',
          paymentStatus: 'unpaid',
          amount: {
            treatment: 12000,
            doctorCharge: 2800,
            medicine: 0,
            total: 14800
          }
        }
      ];

      // Clear existing payments and create new ones
      await Payment.deleteMany({});
      const createdPayments = await Payment.insertMany(dummyPayments);
      
      console.log('✅ Dummy payments created successfully');
      return createdPayments;
    } catch (error) {
      throw new Error(`Failed to create dummy payments: ${error.message}`);
    }
  }
}

export default new PaymentService();
