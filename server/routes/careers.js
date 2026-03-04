const express = require('express');
const router = express.Router();
const emailService = require('../services/email_service');
const { body, validationResult } = require('express-validator');
const { CmsContent } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for resume uploads
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, or DOCX files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Careers application form submission endpoint
router.post('/careers-application', upload.single('resume'), [
  // Validation rules
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      if (!value || !value.includes('@') || value.length < 3) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      if (!value || value.trim() === '') return false;
      return value.length <= 50;
    })
    .withMessage('Phone number must be less than 50 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA verification is required')
], async (req, res) => {
  try {
    // Check if resume file is uploaded (mandatory)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ msg: 'Resume file is required. Please upload your resume (PDF, DOC, or DOCX format).', param: 'resume', location: 'body' }]
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting file after validation failure:', deleteError);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, message, recaptchaToken } = req.body;

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';

    // Prepare form data for email
    const formData = {
      firstName,
      lastName,
      email,
      phone,
      message,
      recaptchaToken,
      ipAddress,
      timestamp: new Date().toISOString()
    };

    // Get resume file path if uploaded
    const resumePath = req.file ? req.file.path : null;

    // Fetch email configuration from CMS - REQUIRED
    let senderEmail = process.env.SMTP_USER || null;
    let receiverEmail = null; // No default - must be configured in CMS
    
    try {
      const emailConfig = await CmsContent.findOne({
        where: { page: 'careers', section: 'email-config' },
      });
      
      console.log('📧 Careers email config from CMS:', JSON.stringify(emailConfig ? emailConfig.data : null, null, 2));
      
      if (emailConfig && emailConfig.data) {
        // Handle both JSON string and object formats
        const configData = typeof emailConfig.data === 'string' ? JSON.parse(emailConfig.data) : emailConfig.data;
        
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
            throw new Error('Invalid receiver email format configured in CMS. Please set a valid email address in Admin → Careers → Email Config.');
          }
        } else {
          console.error('❌ Receiver email not configured in CMS for careers');
          throw new Error('Receiver email is not configured. Please set the "Receiver Email (To)" field in Admin → Careers → Email Config section.');
        }
      } else {
        console.error('❌ No email config found in CMS for careers page');
        throw new Error('Email configuration not found. Please configure the receiver email in Admin → Careers → Email Config section.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch careers email config from CMS:', error.message);
      if (error.message.includes('not configured') || error.message.includes('not found') || error.message.includes('Invalid')) {
        // Re-throw configuration errors
        throw error;
      }
      console.error('Stack trace:', error.stack);
      throw new Error('Failed to fetch email configuration from CMS. Please ensure the receiver email is configured in Admin → Careers → Email Config.');
    }

    // Final validation - receiver email must be set
    if (!receiverEmail || !receiverEmail.includes('@')) {
      throw new Error('Receiver email is not configured. Please set the "Receiver Email (To)" field in Admin → Careers → Email Config section.');
    }

    console.log('📧 Sending careers application email to:', receiverEmail);
    console.log('📋 Application details:', {
      applicant: `${firstName} ${lastName}`,
      applicantEmail: email,
      receiverEmail: receiverEmail,
      resumeAttached: resumePath ? 'Yes' : 'No'
    });

    // Send email with configured sender and receiver
    let emailResult;
    try {
      emailResult = await emailService.sendCareersApplicationEmail(formData, resumePath, senderEmail, receiverEmail);
      console.log('✅ MAIN APPLICATION EMAIL SENT SUCCESSFULLY!');
      console.log('   Message ID:', emailResult.messageId);
      console.log('   Sent to:', receiverEmail);
    } catch (emailError) {
      console.error('❌ FAILED TO SEND MAIN APPLICATION EMAIL:', emailError.message);
      throw emailError; // Re-throw to trigger error handler
    }

    // Send auto-reply to applicant
    console.log('📧 Sending auto-reply to applicant:', email);
    try {
      const fullName = `${firstName} ${lastName}`;
      await emailService.sendCareersAutoReply(email, fullName, senderEmail);
      console.log('✅ AUTO-REPLY EMAIL SENT SUCCESSFULLY!');
      console.log('   Sent to applicant:', email);
    } catch (autoReplyError) {
      console.warn('⚠️  Auto-reply failed, but main email was sent:', autoReplyError.message);
      // Don't throw - auto-reply failure shouldn't fail the whole submission
    }

    // Log successful submission
    console.log(`Careers application submitted successfully by ${firstName} ${lastName} (${email}) at ${new Date().toISOString()}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Thank you for your application! We will review it and get back to you soon.',
      data: {
        messageId: emailResult.messageId,
        timestamp: formData.timestamp
      }
    });

  } catch (error) {
    // Delete uploaded file if email sending fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting file after email failure:', deleteError);
      }
    }
    
    console.error('Careers application submission error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error submitting your application. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

