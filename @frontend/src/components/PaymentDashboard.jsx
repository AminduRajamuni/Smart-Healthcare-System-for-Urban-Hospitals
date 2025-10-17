import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReceiptGenerator from '../utils/ReceiptGenerator';
import './StaffDashboard.css';
import './PaymentDashboard.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import appointmentsIcon from '../assets/icons/Appoinments.png';
import patientsIcon from '../assets/icons/patient.png';
import inventoryIcon from '../assets/icons/inventory.png';

const PaymentDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStep, setPaymentStep] = useState('list'); // list, process, success

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/payments/patient/${user?.patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data);
      } else {
        throw new Error('Failed to fetch payments');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#28a745';
      case 'unpaid':
        return '#dc3545';
      case 'government_paid':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'unpaid':
        return 'Unpaid';
      case 'government_paid':
        return 'Government Paid';
      default:
        return 'Unknown';
    }
  };

  const handlePaymentClick = (payment) => {
    if (payment.paymentStatus === 'unpaid') {
      setSelectedPayment(payment);
      setPaymentStep('process');
    }
  };

  const handleBackToList = () => {
    setPaymentStep('list');
    setSelectedPayment(null);
  };

  const renderPaymentsList = () => {
    if (loading) {
      return (
        <div className="dashboard-content">
          <h2>Loading payments...</h2>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <div className="payments-header">
          <h2>Payments</h2>
          <p>Manage your healthcare payments</p>
        </div>
        
        <div className="payments-grid">
          {payments.map((payment) => (
            <div 
              key={payment._id} 
              className={`payment-card ${payment.paymentStatus === 'unpaid' ? 'clickable' : ''}`}
              onClick={() => handlePaymentClick(payment)}
            >
              <div className="payment-header">
                <h3>{payment.service}</h3>
                <span 
                  className="payment-status"
                  style={{ color: getPaymentStatusColor(payment.paymentStatus) }}
                >
                  {getPaymentStatusText(payment.paymentStatus)}
                </span>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Hospital:</span>
                  <span className="value">{payment.hospitalName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(payment.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{payment.appointmentTime}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">{payment.status}</span>
                </div>
              </div>
              
              <div className="payment-amount">
                <div className="amount-breakdown">
                  {payment.amount.treatment > 0 && (
                    <div className="amount-item">
                      <span>Treatment:</span>
                      <span>LKR {payment.amount.treatment.toLocaleString()}</span>
                    </div>
                  )}
                  {payment.amount.doctorCharge > 0 && (
                    <div className="amount-item">
                      <span>Doctor Charge:</span>
                      <span>LKR {payment.amount.doctorCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {payment.amount.medicine > 0 && (
                    <div className="amount-item">
                      <span>Medicine:</span>
                      <span>LKR {payment.amount.medicine.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="total-amount">
                  <span>Total: LKR {payment.amount.total.toLocaleString()}</span>
                </div>
              </div>
              
              {payment.paymentStatus === 'unpaid' && (
                <div className="payment-action">
                  <button className="pay-btn">Make Payment</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPaymentProcess = () => {
    return (
      <PaymentProcess 
        payment={selectedPayment}
        onBack={handleBackToList}
        onSuccess={(updatedPayment) => {
          setSelectedPayment(updatedPayment);
          setPaymentStep('success');
        }}
      />
    );
  };

  const renderPaymentSuccess = () => {
    return (
      <PaymentSuccess 
        payment={selectedPayment}
        onBackToDashboard={() => {
          setPaymentStep('list');
          setSelectedPayment(null);
          fetchPayments();
        }}
      />
    );
  };

  const renderContent = () => {
    switch (paymentStep) {
      case 'process':
        return renderPaymentProcess();
      case 'success':
        return renderPaymentSuccess();
      default:
        return renderPaymentsList();
    }
  };

  return (
    <div className="payment-dashboard-content">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      {renderContent()}
    </div>
  );
};

// Payment Process Component
const PaymentProcess = ({ payment, onBack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardDetails, setCardDetails] = useState({
    fullName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({
    fullName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [cardType, setCardType] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState({
    patientName: '',
    relationship: '',
    insuranceCompany: '',
    policyNumber: '',
    expirationDate: ''
  });
  const [insuranceErrors, setInsuranceErrors] = useState({
    patientName: '',
    relationship: '',
    insuranceCompany: '',
    policyNumber: '',
    expirationDate: ''
  });
  const [processing, setProcessing] = useState(false);

  // Card type detection
  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6/.test(cleaned)) return 'Discover';
    if (/^3[0-6]/.test(cleaned)) return 'Diners Club';
    if (/^35/.test(cleaned)) return 'JCB';
    
    return '';
  };

  // Card validation functions
  const validateCardNumber = (cardNumber) => {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return 'Card number must be between 13-19 digits';
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0 ? '' : 'Invalid card number';
  };

  const validateExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'Expiry date is required';
    
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) {
      return 'Please enter date in MM/YY format';
    }
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return 'Card has expired';
    }
    
    return '';
  };

  const validateCVV = (cvv) => {
    if (!cvv) return 'CVV is required';
    
    const cleaned = cvv.replace(/\D/g, '');
    if (cleaned.length !== 3 && cleaned.length !== 4) {
      return 'CVV must be 3 or 4 digits';
    }
    
    return '';
  };

  const validateFullName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateCardForm = () => {
    const errors = {
      fullName: validateFullName(cardDetails.fullName),
      cardNumber: validateCardNumber(cardDetails.cardNumber),
      expiryDate: validateExpiryDate(cardDetails.expiryDate),
      cvv: validateCVV(cardDetails.cvv)
    };
    
    setCardErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleCardInputBlur = (field) => {
    let error = '';
    
    switch (field) {
      case 'fullName':
        error = validateFullName(cardDetails.fullName);
        break;
      case 'cardNumber':
        error = validateCardNumber(cardDetails.cardNumber);
        break;
      case 'expiryDate':
        error = validateExpiryDate(cardDetails.expiryDate);
        break;
      case 'cvv':
        error = validateCVV(cardDetails.cvv);
        break;
    }
    
    setCardErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '');
      formattedValue = cleaned.replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
      
      // Detect card type
      const detectedType = detectCardType(formattedValue);
      setCardType(detectedType);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        formattedValue = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      } else {
        formattedValue = cleaned;
      }
    }
    
    // Format CVV (only digits)
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    
    // Clear error when user starts typing
    if (cardErrors[field]) {
      setCardErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Validate form based on payment method
      if (paymentMethod === 'card') {
        if (!validateCardForm()) {
          setProcessing(false);
          return;
        }
      }
      
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      let payload = {};
      
      switch (paymentMethod) {
        case 'cash':
          endpoint = `/payments/appointment/${payment.appointmentId}/cash`;
          break;
        case 'card':
          endpoint = `/payments/appointment/${payment.appointmentId}/card`;
          payload = {
            ...cardDetails,
            cardNumber: cardDetails.cardNumber.replace(/\D/g, '') // Send clean card number
          };
          break;
        case 'insurance':
          endpoint = `/payments/appointment/${payment.appointmentId}/insurance`;
          payload = insuranceDetails;
          break;
      }
      
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const updatedPayment = await response.json();
        // Update the payment with the response data
        const paymentWithTransaction = {
          ...payment,
          ...updatedPayment.data,
          paymentMethod: paymentMethod,
          paymentStatus: 'paid',
          paymentDate: new Date(),
          transactionId: updatedPayment.data.transactionId || `TNX${Date.now()}`
        };
        onSuccess(paymentWithTransaction);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-process">
      <div className="payment-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Make a Payment</h2>
        <p>select your payment</p>
      </div>
      
      <div className="payment-content">
        <div className="payment-methods">
          <div className="payment-tabs">
            <button 
              className={`tab ${paymentMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              Cash
            </button>
            <button 
              className={`tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              Credit Card
            </button>
            <button 
              className={`tab ${paymentMethod === 'insurance' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('insurance')}
            >
              Insurance
            </button>
          </div>
          
          <div className="payment-form">
            {paymentMethod === 'cash' && (
              <div className="cash-payment">
                <div className="total-display">
                  <h3>Total Payment</h3>
                  <div className="amount">LKR {payment.amount.total.toLocaleString()}</div>
                </div>
                <button 
                  className="process-btn"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Process Cash Payment'}
                </button>
              </div>
            )}
            
            {paymentMethod === 'card' && (
              <div className="card-payment">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    value={cardDetails.fullName}
                    onChange={(e) => handleCardInputChange('fullName', e.target.value)}
                    onBlur={() => handleCardInputBlur('fullName')}
                    className={cardErrors.fullName ? 'error' : ''}
                  />
                  {cardErrors.fullName && <span className="error-message">{cardErrors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="card-input-container">
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                      onBlur={() => handleCardInputBlur('cardNumber')}
                      className={cardErrors.cardNumber ? 'error' : ''}
                      maxLength="19"
                    />
                    {cardType && (
                      <div className="card-type-indicator">
                        {cardType}
                      </div>
                    )}
                  </div>
                  {cardErrors.cardNumber && <span className="error-message">{cardErrors.cardNumber}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      onBlur={() => handleCardInputBlur('expiryDate')}
                      className={cardErrors.expiryDate ? 'error' : ''}
                      maxLength="5"
                    />
                    {cardErrors.expiryDate && <span className="error-message">{cardErrors.expiryDate}</span>}
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      onBlur={() => handleCardInputBlur('cvv')}
                      className={cardErrors.cvv ? 'error' : ''}
                      maxLength="4"
                    />
                    {cardErrors.cvv && <span className="error-message">{cardErrors.cvv}</span>}
                  </div>
                </div>
                <button 
                  className="process-btn"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            )}
            
            {paymentMethod === 'insurance' && (
              <div className="insurance-payment">
                <div className="form-group">
                  <label>Patient ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter Patient ID"
                    value={payment.patientId}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Patient Name"
                    value={insuranceDetails.patientName}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, patientName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Relationship to Patient</label>
                  <select 
                    value={insuranceDetails.relationship}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, relationship: e.target.value})}
                  >
                    <option value="">Select Relationship</option>
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Insurance Company</label>
                  <select 
                    value={insuranceDetails.insuranceCompany}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, insuranceCompany: e.target.value})}
                  >
                    <option value="">Enter Insurance Company</option>
                    <option value="Ceylinco Insurance">Ceylinco Insurance</option>
                    <option value="Allianz Insurance">Allianz Insurance</option>
                    <option value="Union Assurance">Union Assurance</option>
                    <option value="Janashakthi Insurance">Janashakthi Insurance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Insurance Policy Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter Policy Number"
                    value={insuranceDetails.policyNumber}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, policyNumber: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Policy Expiration Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={insuranceDetails.expirationDate}
                    onChange={(e) => setInsuranceDetails({...insuranceDetails, expirationDate: e.target.value})}
                  />
                </div>
                <button 
                  className="process-btn"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Submit Insurance Claim'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="billing-summary">
          <h3>Billing Summary</h3>
          <div className="summary-items">
            {payment.amount.treatment > 0 && (
              <div className="summary-item">
                <span>Treatment:</span>
                <span>LKR {payment.amount.treatment.toLocaleString()}</span>
              </div>
            )}
            {payment.amount.doctorCharge > 0 && (
              <div className="summary-item">
                <span>Doctor Charge:</span>
                <span>LKR {payment.amount.doctorCharge.toLocaleString()}</span>
              </div>
            )}
            {payment.amount.medicine > 0 && (
              <div className="summary-item">
                <span>Medicine:</span>
                <span>LKR {payment.amount.medicine.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>LKR {payment.amount.total.toLocaleString()}</span>
          </div>
          <div className="receipt-actions">
            <button className="print-btn" onClick={() => {
              const paymentForReceipt = {
                ...payment,
                paymentStatus: payment.paymentStatus || 'unpaid',
                paymentMethod: payment.paymentMethod || 'pending',
                transactionId: payment.transactionId || payment.appointmentId,
                paymentDate: payment.paymentDate || new Date()
              };
              ReceiptGenerator.printReceipt(paymentForReceipt);
            }}>
              Print Receipt
            </button>
            <button className="download-btn" onClick={() => {
              const paymentForReceipt = {
                ...payment,
                paymentStatus: payment.paymentStatus || 'unpaid',
                paymentMethod: payment.paymentMethod || 'pending',
                transactionId: payment.transactionId || payment.appointmentId,
                paymentDate: payment.paymentDate || new Date()
              };
              ReceiptGenerator.downloadReceipt(paymentForReceipt);
            }}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Success Component
const PaymentSuccess = ({ payment, onBackToDashboard }) => {
  // Ensure payment has all required fields for PDF generation
  const paymentForReceipt = {
    ...payment,
    paymentStatus: 'paid',
    paymentMethod: payment.paymentMethod || 'unknown',
    transactionId: payment.transactionId || `TNX${Date.now()}`,
    paymentDate: payment.paymentDate || new Date()
  };

  return (
    <div className="payment-success">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment. Your transaction has been completed successfully</p>
        
        <div className="transaction-details">
          <h3>Transaction Details</h3>
          <div className="detail-item">
            <span>Amount Paid:</span>
            <span>LKR {paymentForReceipt.amount.total.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span>Payment Method:</span>
            <span>{paymentForReceipt.paymentMethod.toUpperCase()}</span>
          </div>
          <div className="detail-item">
            <span>Transaction ID:</span>
            <span>{paymentForReceipt.transactionId}</span>
          </div>
          <div className="detail-item">
            <span>Date & Time:</span>
            <span>{new Date(paymentForReceipt.paymentDate).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="success-actions">
          <div className="receipt-actions">
            <button className="print-btn" onClick={() => ReceiptGenerator.printReceipt(paymentForReceipt)}>
              Print Receipt
            </button>
            <button className="download-btn" onClick={() => ReceiptGenerator.downloadReceipt(paymentForReceipt)}>
              Download PDF
            </button>
          </div>
          <button className="dashboard-btn" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
