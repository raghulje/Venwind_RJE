const express = require('express');
const router = express.Router();
const emailService = require('../services/email_service');
const { sendToKissflowWebhook } = require('../helpers/kissflowWebhook');
const { getRequestMeta, phoneToDigitsOnly } = require('../helpers/requestMeta');
const { body, validationResult } = require('express-validator');
const { CmsContent } = require('../models');

// Show where form emails are sent (so you can verify without sending)
router.get('/email-receiver', (req, res) => {
  const receiverEmail = process.env.RECEIVER_EMAIL || 'raghul.je@refex.co.in';
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    receiverEmail,
    smtpConfigured,
    message: smtpConfigured
      ? `Contact and careers form emails are sent to ${receiverEmail}. Set RECEIVER_EMAIL in server/.env to change.`
      : 'SMTP not configured. Set SMTP_USER and SMTP_PASS in server/.env to receive emails.',
  });
});

// Contact form submission endpoint
router.post('/contact-form', [
  // Validation rules
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      // Basic email format check - just check it contains @ and has some characters
      if (!value || !value.includes('@') || value.length < 3) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      // Allow any phone format - just check it's not too long
      return value.length <= 50;
    })
    .withMessage('Phone number must be less than 50 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must be less than 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA verification is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, company, message, recaptchaToken, websiteName } = req.body;

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';

    // Prepare form data for email
    const formData = {
      name,
      email,
      phone,
      company,
      message,
      recaptchaToken,
      ipAddress,
      timestamp: new Date().toISOString()
    };

    // Fetch email configuration from CMS; default receiver from .env or fallback
    const DEFAULT_RECEIVER = process.env.RECEIVER_EMAIL || 'raghul.je@refex.co.in';
    let senderEmail = process.env.SMTP_USER || null;
    let receiverEmail = DEFAULT_RECEIVER;

    try {
      const emailConfig = await CmsContent.findOne({
        where: { page: 'contact', section: 'email-config' },
      });

      console.log('📧 Email config from CMS:', JSON.stringify(emailConfig ? emailConfig.data : null, null, 2));

      if (emailConfig && emailConfig.data) {
        const configData = typeof emailConfig.data === 'string' ? JSON.parse(emailConfig.data) : emailConfig.data;

        if (configData.senderEmail && typeof configData.senderEmail === 'string' && configData.senderEmail.trim()) {
          senderEmail = configData.senderEmail.trim();
          console.log('📧 Using sender email from CMS:', senderEmail);
        }
        if (configData.receiverEmail && typeof configData.receiverEmail === 'string' && configData.receiverEmail.trim()) {
          const trimmedEmail = configData.receiverEmail.trim();
          if (trimmedEmail.includes('@') && trimmedEmail.length > 3) {
            receiverEmail = trimmedEmail;
            console.log('✅ Using receiver email from CMS:', receiverEmail);
          }
        } else {
          console.log('📧 Using default contact receiver email:', receiverEmail);
        }
      } else {
        console.log('📧 No contact email config in CMS; using default receiver:', receiverEmail);
      }
    } catch (error) {
      console.error('❌ Failed to fetch contact email config from CMS:', error.message);
      console.log('📧 Using default contact receiver email:', receiverEmail);
    }

    if (!receiverEmail || !receiverEmail.includes('@')) {
      receiverEmail = DEFAULT_RECEIVER;
    }
    // Never send to contact@venwindrefex.com
    if (receiverEmail.toLowerCase() === 'contact@venwindrefex.com') {
      receiverEmail = DEFAULT_RECEIVER;
      console.log('📧 Using default receiver instead of blocked contact@venwindrefex.com');
    }

    console.log('📧 Sending contact form email to:', receiverEmail);
    console.log('📋 Contact form details:', {
      name: name,
      email: email,
      receiverEmail: receiverEmail
    });

    // Send email with configured sender and receiver
    let emailResult;
    try {
      emailResult = await emailService.sendContactFormEmail(formData, senderEmail, receiverEmail);
      console.log('✅ MAIN CONTACT FORM EMAIL SENT SUCCESSFULLY!');
      console.log('   Message ID:', emailResult.messageId);
      console.log('   Sent to:', receiverEmail);
    } catch (emailError) {
      console.error('❌ FAILED TO SEND MAIN CONTACT FORM EMAIL:', emailError.message);
      throw emailError; // Re-throw to trigger error handler
    }

    // Send auto-reply to customer (optional - you can remove this if not needed)
    console.log('📧 Sending auto-reply to customer:', email);
    try {
      await emailService.sendAutoReply(email, name, senderEmail, { phone, company, message });
      console.log('✅ AUTO-REPLY EMAIL SENT SUCCESSFULLY!');
      console.log('   Sent to customer:', email);
    } catch (autoReplyError) {
      console.warn('⚠️  Auto-reply failed, but main email was sent:', autoReplyError.message);
      // Don't throw - auto-reply failure shouldn't fail the whole submission
    }

    // Send same data to Kissflow webhook with dashboard-ready metadata (non-blocking)
    const meta = getRequestMeta(req);
    const phoneDigits = phoneToDigitsOnly(phone);
    const webhookData = {
      name,
      email,
      Phone_Number: phoneDigits,
      company,
      message,
      ...meta,
    };
    sendToKissflowWebhook(websiteName && String(websiteName).trim() ? String(websiteName).trim() : 'Venwind Refex', 'Contact form', webhookData);

    // Log successful submission
    console.log(`Contact form submitted successfully by ${name} (${email}) at ${new Date().toISOString()}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.',
      data: {
        messageId: emailResult.messageId,
        timestamp: formData.timestamp
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test email service endpoint (for development/testing)
router.get('/test-email', async (req, res) => {
  try {
    const isConnected = await emailService.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Email service is working correctly'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email service connection failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service test failed',
      error: error.message
    });
  }
});

// Test email sending with dummy data (labeled as TESTING)
router.post('/test-email-send', async (req, res) => {
  try {
    const defaultReceiver = process.env.RECEIVER_EMAIL || 'raghul.je@refex.co.in';
    const { testEmail } = req.body;
    let receiverEmail = (testEmail && typeof testEmail === 'string' && testEmail.trim()) ? testEmail.trim() : defaultReceiver;
    if (receiverEmail.toLowerCase() === 'contact@venwindrefex.com') receiverEmail = defaultReceiver;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(503).json({
        success: false,
        message: 'Email not configured. Set SMTP_USER and SMTP_PASS in server/.env to send emails.',
        receiverEmail,
        hint: 'Add RECEIVER_EMAIL=raghul.je@refex.co.in to .env so you know where emails go.',
      });
    }

    console.log('🧪 Sending TESTING contact form email to:', receiverEmail);

    const testFormData = {
      name: '[TESTING] Dummy Contact',
      email: 'testing-dummy@example.com',
      phone: '+91 98765 43210',
      company: '[TESTING] Dummy Company Ltd',
      message: 'This is a test email from the Venwind Refex contact form. No action needed — for testing only.',
      recaptchaToken: 'test',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    };

    const senderEmail = process.env.SMTP_USER || null;
    const emailResult = await emailService.sendContactFormEmail(testFormData, senderEmail, receiverEmail);

    res.json({
      success: true,
      message: `Test contact email sent to ${receiverEmail}. Check inbox and spam.`,
      messageId: emailResult.messageId,
      receiverEmail,
    });
  } catch (error) {
    console.error('Test email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      receiverEmail: process.env.RECEIVER_EMAIL || 'raghul.je@refex.co.in',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

