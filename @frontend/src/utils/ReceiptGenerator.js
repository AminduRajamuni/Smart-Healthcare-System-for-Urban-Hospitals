import jsPDF from 'jspdf';

// Receipt PDF Generator Component
const ReceiptGenerator = {
  generateReceipt: (payment) => {
    const doc = new jsPDF();
    
    // Set up colors
    const primaryColor = '#007bff';
    const secondaryColor = '#6c757d';
    const successColor = '#28a745';
    const lightGray = '#f8f9fa';
    
    // Header Section
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    // HealthFirst Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthFirst', 20, 22);
    
    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Healthcare Payment Receipt', 20, 28);
    
    // Receipt Status Badge
    const statusColor = payment.paymentStatus === 'paid' ? successColor : '#ffc107';
    doc.setFillColor(statusColor);
    doc.rect(150, 15, 50, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(payment.paymentStatus.toUpperCase(), 160, 24);
    
    // Receipt Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 20, 50);
    
    // Receipt Number and Date
    doc.setFillColor(lightGray);
    doc.rect(15, 55, 180, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Details:', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No: ${payment.transactionId || payment.appointmentId}`, 20, 72);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 77);
    doc.text(`Time: ${new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, 110, 72);
    
    // Patient Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, 95);
    
    // Patient info box
    doc.setFillColor(248, 249, 250);
    doc.rect(15, 100, 180, 35, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient ID: ${payment.patientId}`, 20, 110);
    doc.text(`Service: ${payment.service}`, 20, 115);
    doc.text(`Hospital: ${payment.hospitalName}`, 20, 120);
    doc.text(`Appointment Date: ${new Date(payment.appointmentDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 125);
    doc.text(`Appointment Time: ${payment.appointmentTime}`, 20, 130);
    
    // Payment Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT BREAKDOWN', 20, 150);
    
    // Create payment breakdown manually
    let yPosition = 160;
    
    // Table header
    doc.setFillColor(primaryColor);
    doc.rect(15, yPosition, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPosition + 7);
    doc.text('Amount (LKR)', 160, yPosition + 7);
    
    yPosition += 12;
    
    // Payment items
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (payment.amount.treatment > 0) {
      doc.text('Medical Treatment', 20, yPosition);
      doc.text(`LKR ${payment.amount.treatment.toLocaleString()}`, 160, yPosition);
      yPosition += 8;
    }
    
    if (payment.amount.doctorCharge > 0) {
      doc.text('Doctor Consultation Fee', 20, yPosition);
      doc.text(`LKR ${payment.amount.doctorCharge.toLocaleString()}`, 160, yPosition);
      yPosition += 8;
    }
    
    if (payment.amount.medicine > 0) {
      doc.text('Prescription Medicine', 20, yPosition);
      doc.text(`LKR ${payment.amount.medicine.toLocaleString()}`, 160, yPosition);
      yPosition += 8;
    }
    
    // Total row
    yPosition += 5;
    doc.setFillColor(240, 248, 255);
    doc.rect(15, yPosition - 2, 180, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT', 20, yPosition + 5);
    doc.text(`LKR ${payment.amount.total.toLocaleString()}`, 160, yPosition + 5);
    
    // Payment Status Section
    const finalY = yPosition + 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT STATUS', 20, finalY);
    
    // Payment status box
    const statusBoxColor = payment.paymentStatus === 'paid' ? '#d4edda' : '#fff3cd';
    doc.setFillColor(statusBoxColor);
    doc.rect(15, finalY + 5, 180, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: ${payment.paymentStatus.toUpperCase()}`, 20, finalY + 15);
    doc.text(`Payment Method: ${payment.paymentMethod ? payment.paymentMethod.toUpperCase() : 'N/A'}`, 20, finalY + 20);
    
    if (payment.paymentDate) {
      doc.text(`Payment Date: ${new Date(payment.paymentDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, finalY + 25);
    }
    
    // Success Message
    if (payment.paymentStatus === 'paid') {
      doc.setTextColor(successColor);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ PAYMENT SUCCESSFUL', 20, finalY + 40);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your payment. Your transaction has been completed successfully.', 20, finalY + 50);
      doc.text('This receipt serves as proof of payment for your healthcare services.', 20, finalY + 55);
    }
    
    // Footer Section
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(248, 249, 250);
    doc.rect(0, pageHeight - 40, 210, 40, 'F');
    
    // Footer border
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1);
    doc.line(0, pageHeight - 40, 210, pageHeight - 40);
    
    doc.setTextColor(secondaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthFirst Healthcare System', 20, pageHeight - 30);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated receipt. No signature required.', 20, pageHeight - 25);
    doc.text('For inquiries, contact: support@healthfirst.com | Phone: +94 11 234 5678', 20, pageHeight - 20);
    doc.text('Address: 123 Hospital Street, Colombo, Sri Lanka', 20, pageHeight - 15);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
    
    // Add decorative elements
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, pageHeight - 20);
    
    // Add corner decorations
    doc.setFillColor(primaryColor);
    doc.circle(20, 20, 2, 'F');
    doc.circle(190, 20, 2, 'F');
    doc.circle(20, pageHeight - 20, 2, 'F');
    doc.circle(190, pageHeight - 20, 2, 'F');
    
    return doc;
  },
  
  downloadReceipt: (payment) => {
    const doc = ReceiptGenerator.generateReceipt(payment);
    const fileName = `receipt_${payment.transactionId || payment.appointmentId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  },
  
  printReceipt: (payment) => {
    const doc = ReceiptGenerator.generateReceipt(payment);
    window.open(doc.output('bloburl'), '_blank');
  }
};

export default ReceiptGenerator;