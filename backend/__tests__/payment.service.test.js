import PaymentService from '../services/PaymentService.js';
import Payment from '../models/Payment.js';

// Mock the Payment model static methods used in service
jest.mock('../models/Payment.js', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
  },
}));

describe('PaymentService - payment methods', () => {
  const appointmentId = 'APP-999';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processCashPayment', () => {
    it('marks payment as paid with cash and returns updated payment', async () => {
      const updated = {
        appointmentId,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        transactionId: 'TNX123456',
      };

      Payment.findOneAndUpdate.mockResolvedValue(updated);

      const result = await PaymentService.processCashPayment(appointmentId);

      expect(Payment.findOneAndUpdate).toHaveBeenCalledWith(
        { appointmentId },
        expect.objectContaining({
          paymentStatus: 'paid',
          paymentMethod: 'cash',
        }),
        { new: true }
      );
      expect(result).toBe(updated);
    });

    it('throws error if payment not found', async () => {
      Payment.findOneAndUpdate.mockResolvedValue(null);

      await expect(PaymentService.processCashPayment(appointmentId)).rejects.toThrow(
        /Payment not found/
      );
    });
  });

  describe('processCardPayment', () => {
    it('marks payment as paid with card and returns updated payment', async () => {
      const updated = {
        appointmentId,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        transactionId: 'TNX987654',
      };

      Payment.findOneAndUpdate.mockResolvedValue(updated);

      const result = await PaymentService.processCardPayment(appointmentId, {
        number: '4111111111111111',
        exp: '12/30',
      });

      expect(Payment.findOneAndUpdate).toHaveBeenCalledWith(
        { appointmentId },
        expect.objectContaining({
          paymentStatus: 'paid',
          paymentMethod: 'card',
        }),
        { new: true }
      );
      expect(result).toBe(updated);
    });

    it('throws error if payment not found', async () => {
      Payment.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        PaymentService.processCardPayment(appointmentId, { number: '4' })
      ).rejects.toThrow(/Payment not found/);
    });
  });

  describe('processInsuranceClaim', () => {
    it('marks payment as paid with insurance and stores insurance details', async () => {
      const insuranceDetails = {
        patientName: 'John Doe',
        relationship: 'self',
        insuranceCompany: 'Acme Insurance',
        policyNumber: 'POL123',
        expirationDate: '2030-12-31',
      };
      const updated = {
        appointmentId,
        paymentStatus: 'paid',
        paymentMethod: 'insurance',
        insuranceDetails,
        transactionId: 'TNX555555',
      };

      Payment.findOneAndUpdate.mockResolvedValue(updated);

      const result = await PaymentService.processInsuranceClaim(
        appointmentId,
        insuranceDetails
      );

      expect(Payment.findOneAndUpdate).toHaveBeenCalledWith(
        { appointmentId },
        expect.objectContaining({
          paymentStatus: 'paid',
          paymentMethod: 'insurance',
          insuranceDetails,
        }),
        { new: true }
      );
      expect(result).toBe(updated);
    });

    it('throws error if payment not found', async () => {
      Payment.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        PaymentService.processInsuranceClaim(appointmentId, {})
      ).rejects.toThrow(/Payment not found/);
    });
  });
});


