const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const emailService = require('./services/emailService');
const smsService = require('./services/smsService');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://your-app-domain.com'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Send invoice email to customer
app.post('/api/notifications/invoice', async (req, res) => {
  try {
    const { user, plan } = req.body;
    
    if (!user || !plan) {
      return res.status(400).json({ error: 'Missing required fields: user and plan' });
    }

    const result = await emailService.sendInvoiceEmail(user, plan);
    
    if (result.success) {
      res.json({ success: true, message: 'Invoice email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send invoice email', details: result.error });
    }
  } catch (error) {
    console.error('Invoice email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send admin notifications (email + SMS)
app.post('/api/notifications/admin', async (req, res) => {
  try {
    const { user, plan, locationPreferences, notificationPreferences } = req.body;
    
    if (!user || !plan) {
      return res.status(400).json({ error: 'Missing required fields: user and plan' });
    }

    // Send admin email
    const emailResult = await emailService.sendAdminEmail(user, plan, locationPreferences, notificationPreferences);
    
    // Send admin SMS
    const smsResult = await smsService.sendAdminSMS(user, plan);
    
    if (emailResult.success && smsResult.success) {
      res.json({ 
        success: true, 
        message: 'Admin notifications sent successfully',
        email: emailResult.success,
        sms: smsResult.success
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send some notifications',
        email: emailResult,
        sms: smsResult
      });
    }
  } catch (error) {
    console.error('Admin notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send subscription confirmation to customer
app.post('/api/notifications/confirmation', async (req, res) => {
  try {
    const { user, plan, notificationPreferences } = req.body;
    
    if (!user || !plan || !notificationPreferences) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results = {};

    // Send confirmation email if enabled
    if (notificationPreferences.email && notificationPreferences.emailAddress) {
      results.email = await emailService.sendConfirmationEmail(user, plan, notificationPreferences.emailAddress);
    }

    // Send confirmation SMS if enabled
    if (notificationPreferences.sms && notificationPreferences.phoneNumber) {
      results.sms = await smsService.sendConfirmationSMS(user, plan, notificationPreferences.phoneNumber);
    }

    res.json({ 
      success: true, 
      message: 'Confirmation notifications sent',
      results
    });
  } catch (error) {
    console.error('Confirmation notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Appointments Backend running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`📱 SMS service: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Not configured'}`);
});