const express = require('express');
const router = express.Router();
const emailService = require('../services/email_service');
const { body, validationResult } = require('express-validator');
const { CmsContent } = require('../models');

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

    const { name, email, phone, company, message, recaptchaToken } = req.body;

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

    // Fetch email configuration from CMS - REQUIRED
    // Default sender is SMTP_USER (must match authenticated account)
    let senderEmail = process.env.SMTP_USER || null; // Will use SMTP_USER in email service
    let receiverEmail = null; // No default - must be configured in CMS
    
    try {
      const emailConfig = await CmsContent.findOne({
        where: { page: 'contact', section: 'email-config' },
      });
      
      console.log('📧 Email config from CMS:', JSON.stringify(emailConfig ? emailConfig.data : null, null, 2));
      
      if (emailConfig && emailConfig.data) {
        // Handle both JSON string and object formats
        const configData = typeof emailConfig.data === 'string' ? JSON.parse(emailConfig.data) : emailConfig.data;
        
        // Sender email from CMS (used for display name/reply-to, but actual from will be SMTP_USER)
        if (configData.senderEmail && typeof configData.senderEmail === 'string' && configData.senderEmail.trim()) {
          senderEmail = configData.senderEmail.trim();
          console.log('📧 Using sender email from CMS:', senderEmail);
        }
        // Receiver email from CMS (where emails are actually sent) - REQUIRED
        if (configData.receiverEmail && typeof configData.receiverEmail === 'string' && configData.receiverEmail.trim()) {
          const trimmedEmail = configData.receiverEmail.trim();
          // Validate email format
          if (trimmedEmail.includes('@') && trimmedEmail.length > 3) {
            receiverEmail = trimmedEmail;
            console.log('✅ Using receiver email from CMS:', receiverEmail);
          } else {
            console.error('❌ Invalid receiver email format in CMS:', trimmedEmail);
            throw new Error('Invalid receiver email format configured in CMS. Please set a valid email address in Admin → Contact → Email Config.');
          }
        } else {
          console.error('❌ Receiver email not configured in CMS');
          throw new Error('Receiver email is not configured. Please set the "Receiver Email (To)" field in Admin → Contact → Email Config section.');
        }
      } else {
        console.error('❌ No email config found in CMS for contact page');
        throw new Error('Email configuration not found. Please configure the receiver email in Admin → Contact → Email Config section.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch email config from CMS:', error.message);
      if (error.message.includes('not configured') || error.message.includes('not found') || error.message.includes('Invalid')) {
        // Re-throw configuration errors
        throw error;
      }
      console.error('Stack trace:', error.stack);
      throw new Error('Failed to fetch email configuration from CMS. Please ensure the receiver email is configured in Admin → Contact → Email Config.');
    }

    // Final validation - receiver email must be set
    if (!receiverEmail || !receiverEmail.includes('@')) {
      throw new Error('Receiver email is not configured. Please set the "Receiver Email (To)" field in Admin → Contact → Email Config section.');
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
      await emailService.sendAutoReply(email, name, senderEmail);
      console.log('✅ AUTO-REPLY EMAIL SENT SUCCESSFULLY!');
      console.log('   Sent to customer:', email);
    } catch (autoReplyError) {
      console.warn('⚠️  Auto-reply failed, but main email was sent:', autoReplyError.message);
      // Don't throw - auto-reply failure shouldn't fail the whole submission
    }

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

// Test email sending with actual email (for debugging)
router.post('/test-email-send', async (req, res) => {
  try {
    const { testEmail } = req.body;
    const receiverEmail = testEmail || 'contact@venwindrefex.com';
    
    console.log('🧪 Testing email send to:', receiverEmail);
    
    const testFormData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'Test Company',
      message: 'This is a test email from the Venwind Refex contact form system.',
      recaptchaToken: 'test',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    
    const senderEmail = process.env.SMTP_USER || null;
    const emailResult = await emailService.sendContactFormEmail(testFormData, senderEmail, receiverEmail);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${receiverEmail}`,
      messageId: emailResult.messageId,
      receiverEmail: receiverEmail
    });
  } catch (error) {
    console.error('Test email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

