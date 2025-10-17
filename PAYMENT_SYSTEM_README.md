# Payment System Documentation

## Overview
The payment system allows patients to view their healthcare service payments and process payments for unpaid services. The system supports three payment methods: Cash, Credit Card, and Insurance claims.

## Backend API Endpoints

### Payment Endpoints
- `GET /api/payments/patient/:patientId` - Get all payments for a patient
- `GET /api/payments/patient/:patientId/unpaid` - Get unpaid payments for a patient
- `GET /api/payments/patient/:patientId/summary` - Get payment summary for dashboard
- `GET /api/payments/appointment/:appointmentId` - Get specific payment by appointment ID
- `POST /api/payments/appointment/:appointmentId/cash` - Process cash payment
- `POST /api/payments/appointment/:appointmentId/card` - Process card payment
- `POST /api/payments/appointment/:appointmentId/insurance` - Process insurance claim
- `POST /api/payments/seed` - Create dummy payment data (admin only)

## Payment Status Types
- `paid` - Payment has been completed
- `unpaid` - Payment is pending
- `government_paid` - Service is free (government hospital)

## Dummy Data
The system includes 5 dummy appointments with different payment statuses:

1. **APP-001** - Cardiology Consultation (Asiri Hospital) - **Unpaid** - LKR 12,460
2. **APP-002** - Neurology Follow-up (Lanka Hospitals) - **Unpaid** - LKR 23,000
3. **APP-003** - General Medicine Check-up (National Hospital SL) - **Government Paid** - Free
4. **APP-004** - Cardiology Consultation (Asiri Hospital) - **Paid** - LKR 12,460
5. **APP-005** - Neurology Consultation (Lanka Hospitals) - **Cancelled** - LKR 14,800

## Frontend Components

### PaymentDashboard
Main component that displays:
- List of all payments with status indicators
- Payment details (hospital, date, time, amounts)
- Click-to-pay functionality for unpaid payments

### Payment Process Flow
1. **Payment List** - Shows all payments with status
2. **Payment Method Selection** - Cash, Card, or Insurance tabs
3. **Payment Processing** - Form submission based on selected method
4. **Success Screen** - Confirmation with transaction details

### Payment Methods

#### Cash Payment
- Simple one-click payment processing
- Immediate confirmation

#### Credit Card Payment
- Full name input
- Card number input
- Expiry date (MM/YY format)
- CVV input

#### Insurance Claim
- Patient ID (auto-filled)
- Patient name
- Relationship to patient
- Insurance company selection
- Policy number
- Policy expiration date

## Usage Instructions

### For Patients
1. Login to the patient dashboard
2. Navigate to the "Payments" section
3. View all your healthcare service payments
4. Click on any unpaid payment to process it
5. Select payment method (Cash/Card/Insurance)
6. Complete the payment form
7. Receive confirmation with transaction details

### For Developers
1. Backend runs on `http://localhost:3000`
2. Frontend runs on `http://localhost:5173`
3. All payment endpoints require authentication
4. Use the provided dummy data for testing
5. Payment status updates automatically after processing

## Database Schema

### Payment Model
```javascript
{
  appointmentId: String (unique),
  patientId: String,
  doctorId: String,
  hospitalName: String,
  service: String,
  appointmentDate: Date,
  appointmentTime: String,
  status: String (Scheduled/Completed/Cancelled),
  paymentStatus: String (paid/unpaid/government_paid),
  paymentMethod: String (cash/card/insurance),
  amount: {
    treatment: Number,
    doctorCharge: Number,
    medicine: Number,
    total: Number
  },
  transactionId: String,
  paymentDate: Date,
  insuranceDetails: Object
}
```

## Security Features
- JWT token authentication required for all endpoints
- Input validation on all forms
- Secure payment processing simulation
- Transaction ID generation for audit trail

## Testing
- Use the provided dummy data for testing
- All payment methods are simulated (no real transactions)
- Government hospitals show as "Government Paid" (free)
- Private hospitals require payment processing
