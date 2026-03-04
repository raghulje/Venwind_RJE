const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Get and validate SMTP configuration
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
    const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().replace(/\s+/g, '') : null; // Remove spaces from app password
    
    if (!smtpUser) {
      console.error('⚠️  WARNING: SMTP_USER is not configured in .env file');
    }
    if (!smtpPass) {
      console.error('⚠️  WARNING: SMTP_PASS is not configured in .env file');
    }
    
    // Create transporter using SMTP configuration
    // Only set auth if both user and pass are provided
    const transporterConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
      logger: process.env.NODE_ENV === 'development' // Enable logger in development
    };
    
    // Only add auth if credentials are provided
    if (smtpUser && smtpPass) {
      transporterConfig.auth = {
        user: smtpUser,
        pass: smtpPass
      };
    } else {
      console.error('⚠️  ERROR: SMTP credentials are missing. Email sending will fail.');
    }
    
    this.transporter = nodemailer.createTransport(transporterConfig);
  }

  // Send contact form email
  async sendContactFormEmail(formData, senderEmail = null, receiverEmail = null) {
    try {
      const { name, email, phone, company, message, recaptchaToken } = formData;

      // Get the authenticated SMTP_USER - this MUST be used as the "from" address
      // Gmail/SMTP servers require the "from" to match the authenticated user
      const smtpAuthUser = process.env.SMTP_USER;
      if (!smtpAuthUser || smtpAuthUser.trim() === '') {
        throw new Error('SMTP_USER is not configured in environment variables. Please configure SMTP_USER in server/.env file');
      }
      
      // Warn if SMTP_USER is a Readdy email
      if (smtpAuthUser.toLowerCase().includes('readdy') || smtpAuthUser.toLowerCase().includes('readdy.ai')) {
        console.error('WARNING: SMTP_USER is set to a Readdy email address:', smtpAuthUser);
        console.error('Emails will be sent from this Readdy address. To send from crm@refex.co.in, update SMTP_USER in server/.env file');
      }
      
      // Use receiver from CMS - REQUIRED (no default)
      if (!receiverEmail || !receiverEmail.trim()) {
        throw new Error('Receiver email is required but not provided. Please configure it in CMS.');
      }
      
      const toEmail = receiverEmail.trim();
      
      // Validate email format before sending
      if (!toEmail.includes('@') || toEmail.length < 5) {
        throw new Error(`Invalid receiver email format: ${toEmail}. Please configure a valid email address in CMS.`);
      }
      
      console.log('📧 Email Service - Contact Form Email:');
      console.log('  From (SMTP_USER):', smtpAuthUser);
      console.log('  To (Receiver):', toEmail);
      console.log('  Receiver Email Parameter:', receiverEmail);
      
      // Format "from" with display name - use SMTP_USER as the actual email
      // The senderEmail from CMS is used for display name, but actual from must be SMTP_USER
      // Warn if SMTP_USER is a Readdy email
      if (smtpAuthUser.toLowerCase().includes('readdy') || smtpAuthUser.toLowerCase().includes('readdy.ai')) {
        console.error('⚠️  WARNING: SMTP_USER is set to a Readdy email address:', smtpAuthUser);
        console.error('⚠️  Contact form emails will be sent FROM this Readdy address.');
        console.error('⚠️  To send from crm@refex.co.in, you MUST update SMTP_USER in server/.env file to crm@refex.co.in');
      }
      
      // Always use Venwind Refex as display name to avoid showing Readdy AI
      const displayName = 'Venwind Refex';
      const fromDisplay = `${displayName} <${smtpAuthUser}>`;

      // Email content
      const mailOptions = {
        from: fromDisplay,
        replyTo: senderEmail || smtpAuthUser, // Set reply-to to the CMS sender or SMTP_USER
        to: toEmail,
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8DC63F, #7AB62F); color: white; padding: 30px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Contact Form Submission</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Venwind Refex</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="color: #333; margin-top: 0; font-size: 22px; border-bottom: 2px solid #8DC63F; padding-bottom: 10px;">Contact Information</h2>
                        
                        <table width="100%" cellpadding="10" cellspacing="0" style="margin-bottom: 25px;">
                          <tr>
                            <td style="width: 140px; padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Name:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">${name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Email:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">
                              <a href="mailto:${email}" style="color: #8DC63F; text-decoration: none;">${email}</a>
                            </td>
                          </tr>
                          ${phone ? `
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Phone:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">
                              <a href="tel:${phone.replace(/\s+/g, '')}" style="color: #8DC63F; text-decoration: none;">${phone}</a>
                            </td>
                          </tr>
                          ` : ''}
                          ${company ? `
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Company:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">${company}</td>
                          </tr>
                          ` : ''}
                        </table>
                        
                        <h3 style="color: #333; font-size: 18px; margin-top: 25px; margin-bottom: 10px;">Message:</h3>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #8DC63F; color: #555; line-height: 1.8; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
                        
                        <div style="margin-top: 25px; padding: 15px; background-color: #f0f7e8; border-radius: 5px; border-left: 4px solid #8DC63F;">
                          <p style="margin: 5px 0; color: #666; font-size: 14px;">
                            <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p style="margin: 5px 0; color: #666; font-size: 14px;">
                            <strong>IP Address:</strong> ${formData.ipAddress || 'Not available'}
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #999; font-size: 12px;">
                          This email was automatically generated from the Venwind Refex contact form.
                        </p>
                        <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                          Please respond to the customer's inquiry promptly.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
New Contact Form Submission - Venwind Refex

Contact Information:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}

Message:
${message}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
IP Address: ${formData.ipAddress || 'Not available'}
        `
      };

      // Send email
      console.log('📧 Attempting to send contact form email...');
      console.log('  From:', fromDisplay);
      console.log('  To:', toEmail);
      console.log('  Subject:', mailOptions.subject);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Contact form email sent successfully!');
      console.log('  Message ID:', result.messageId);
      console.log('  Response:', result.response || 'No response');
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        command: error.command,
        responseCode: error.responseCode
      });
      
      const errorMessage = error.message || 'Unknown error occurred';
      const errorCode = error.code || '';
      const responseCode = error.responseCode || '';
      
      // Provide more helpful error messages
      if (!process.env.SMTP_USER) {
        throw new Error('Email configuration error: SMTP_USER is not set. Please configure it in server/.env file and restart the server');
      } else if (!process.env.SMTP_PASS) {
        throw new Error('Email configuration error: SMTP_PASS is not set. Please configure it in server/.env file and restart the server');
      } else if (errorMessage.includes('authentication') || errorMessage.includes('Invalid login') || errorMessage.includes('535') || errorCode === 'EAUTH' || responseCode === 535) {
        throw new Error('Email authentication failed. Please verify SMTP_USER and SMTP_PASS in server/.env file are correct. For Gmail, make sure you\'re using an App Password (not your regular password).');
      } else if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorCode === 'ECONNREFUSED') {
        throw new Error('Cannot connect to email server. Please check SMTP_HOST and SMTP_PORT in server/.env file. Make sure the server is running and can reach the SMTP server.');
      } else if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        throw new Error('Connection timeout. Please check your internet connection and firewall settings. The SMTP server may be blocking the connection.');
      } else if (errorMessage.includes('ENOTFOUND')) {
        throw new Error(`SMTP server not found: ${process.env.SMTP_HOST || 'smtp.gmail.com'}. Please check SMTP_HOST in server/.env file`);
      } else if (errorMessage.includes('534') || responseCode === 534) {
        throw new Error('Application-specific password required. Please generate an App Password in your Gmail account settings and use it in SMTP_PASS');
      } else if (errorMessage.includes('454') || responseCode === 454) {
        throw new Error('Temporary authentication failure. Please try again in a few moments.');
      }
      throw new Error(`Failed to send email: ${errorMessage}${errorCode ? ' (Code: ' + errorCode + ')' : ''}${responseCode ? ' (Response: ' + responseCode + ')' : ''}`);
    }
  }

  // Send auto-reply to customer
  async sendAutoReply(customerEmail, customerName, senderEmail = null) {
    try {
      // Use SMTP_USER as the actual sender - required by SMTP servers
      const smtpAuthUser = process.env.SMTP_USER;
      if (!smtpAuthUser || smtpAuthUser.trim() === '') {
        throw new Error('SMTP_USER is not configured in environment variables. Please configure SMTP_USER in server/.env file');
      }
      
      // Warn if SMTP_USER is a Readdy email
      if (smtpAuthUser.toLowerCase().includes('readdy') || smtpAuthUser.toLowerCase().includes('readdy.ai')) {
        console.error('⚠️  WARNING: SMTP_USER is set to a Readdy email address:', smtpAuthUser);
        console.error('⚠️  Auto-reply emails will be sent FROM this Readdy address.');
        console.error('⚠️  To send from crm@refex.co.in, you MUST update SMTP_USER in server/.env file to crm@refex.co.in');
      }
      
      // Log the SMTP_USER being used for debugging
      console.log('Sending auto-reply using SMTP_USER:', smtpAuthUser);
      
      // Ensure we don't use Readdy AI email - use Venwind Refex as display name
      const displayName = 'Venwind Refex';
      const fromDisplay = `${displayName} <${smtpAuthUser}>`;
      const mailOptions = {
        from: fromDisplay,
        replyTo: senderEmail || smtpAuthUser,
        to: customerEmail,
        subject: 'Thank you for contacting Venwind Refex',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8DC63F, #7AB62F); color: white; padding: 40px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Thank You!</h1>
                        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">We've received your message</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                          Dear ${customerName},
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                          Thank you for reaching out to <strong>Venwind Refex</strong>. We have successfully received your inquiry and our team will review it carefully.
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                          We typically respond to all inquiries within <strong>24 hours</strong> during business days. If your inquiry is urgent, please call us directly at <strong style="color: #8DC63F;">+91 44 - 3504 0050</strong> or <strong style="color: #8DC63F;">+91 44 - 6990 8410</strong>.
                        </p>
                        
                        <div style="background-color: #f0f7e8; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8DC63F;">
                          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 18px;">What happens next?</h3>
                          <ul style="color: #666; padding-left: 20px; margin: 0; line-height: 2;">
                            <li>Our team will review your inquiry</li>
                            <li>We'll assign it to the appropriate department</li>
                            <li>You'll receive a detailed response within 24 hours</li>
                            <li>If needed, we'll schedule a follow-up call</li>
                          </ul>
                        </div>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 25px 0 0 0;">
                          In the meantime, feel free to explore our website to learn more about our wind energy technology and services.
                        </p>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 30px 0 0 0;">
                          Best regards,<br>
                          <strong style="color: #8DC63F; font-size: 18px;">The Venwind Refex Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">
                          Venwind Refex Power Limited
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                          CIN: U27101TN2024PLC175572<br>
                          2nd floor, Refex Towers, 313, Valluvar Kottam High Road,<br>
                          Nungambakkam, Chennai-600034, Tamil Nadu, India
                        </p>
                        <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                          Phone: <a href="tel:+914435040050" style="color: #8DC63F; text-decoration: none;">+91 44 - 3504 0050</a> | 
                          <a href="tel:+914469908410" style="color: #8DC63F; text-decoration: none;">+91 44 - 6990 8410</a>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                          Email: <a href="mailto:cscompliance@refex.co.in" style="color: #8DC63F; text-decoration: none;">cscompliance@refex.co.in</a> | 
                          <a href="mailto:contact@venwindrefex.com" style="color: #8DC63F; text-decoration: none;">contact@venwindrefex.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
Thank you for contacting Venwind Refex!

Dear ${customerName},

Thank you for reaching out to Venwind Refex. We have successfully received your inquiry and our team will review it carefully.

We typically respond to all inquiries within 24 hours during business days. If your inquiry is urgent, please call us directly at +91 44 - 3504 0050 or +91 44 - 6990 8410.

What happens next?
- Our team will review your inquiry
- We'll assign it to the appropriate department
- You'll receive a detailed response within 24 hours
- If needed, we'll schedule a follow-up call

In the meantime, feel free to explore our website to learn more about our wind energy technology and services.

Best regards,
The Venwind Refex Team

Venwind Refex Power Limited
CIN: U27101TN2024PLC175572
2nd floor, Refex Towers, 313, Valluvar Kottam High Road,
Nungambakkam, Chennai-600034, Tamil Nadu, India

Phone: +91 44 - 3504 0050 | +91 44 - 6990 8410
Email: cscompliance@refex.co.in | contact@venwindrefex.com
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Auto-reply sent successfully'
      };

    } catch (error) {
      console.error('Error sending auto-reply:', error);
      throw new Error(`Failed to send auto-reply: ${error.message}`);
    }
  }

  // Send careers application email
  async sendCareersApplicationEmail(formData, resumePath = null, senderEmail = null, receiverEmail = null) {
    try {
      const { firstName, lastName, email, phone, message, ipAddress } = formData;
      const fullName = `${firstName} ${lastName}`;

      // Get the authenticated SMTP_USER - this MUST be used as the "from" address
      const smtpAuthUser = process.env.SMTP_USER;
      if (!smtpAuthUser || smtpAuthUser.trim() === '') {
        throw new Error('SMTP_USER is not configured in environment variables. Please configure SMTP_USER in server/.env file');
      }
      
      // Warn if SMTP_USER is a Readdy email
      if (smtpAuthUser.toLowerCase().includes('readdy') || smtpAuthUser.toLowerCase().includes('readdy.ai')) {
        console.error('⚠️  WARNING: SMTP_USER is set to a Readdy email address:', smtpAuthUser);
        console.error('⚠️  Careers application emails will be sent FROM this Readdy address.');
        console.error('⚠️  To send from crm@refex.co.in, you MUST update SMTP_USER in server/.env file to crm@refex.co.in');
      }
      
      // Use receiver from CMS - REQUIRED (no default)
      if (!receiverEmail || !receiverEmail.trim()) {
        throw new Error('Receiver email is required but not provided. Please configure it in CMS.');
      }
      
      const toEmail = receiverEmail.trim();
      
      // Validate email format before sending
      if (!toEmail.includes('@') || toEmail.length < 5) {
        throw new Error(`Invalid receiver email format: ${toEmail}. Please configure a valid email address in CMS.`);
      }
      
      console.log('📧 Email Service - Careers Application Email:');
      console.log('  From (SMTP_USER):', smtpAuthUser);
      console.log('  To (Receiver):', toEmail);
      console.log('  Receiver Email Parameter:', receiverEmail);
      
      // Always use Venwind Refex as display name
      const displayName = 'Venwind Refex';
      const fromDisplay = `${displayName} <${smtpAuthUser}>`;

      // Prepare email options
      const mailOptions = {
        from: fromDisplay,
        replyTo: senderEmail || smtpAuthUser,
        to: toEmail,
        subject: `New Careers Application from ${fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8DC63F, #7AB62F); color: white; padding: 30px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Careers Application</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Venwind Refex</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="color: #333; margin-top: 0; font-size: 22px; border-bottom: 2px solid #8DC63F; padding-bottom: 10px;">Applicant Information</h2>
                        
                        <table width="100%" cellpadding="10" cellspacing="0" style="margin-bottom: 25px;">
                          <tr>
                            <td style="width: 140px; padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Name:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">${fullName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Email:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">
                              <a href="mailto:${email}" style="color: #8DC63F; text-decoration: none;">${email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Phone:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">
                              <a href="tel:${phone.replace(/\s+/g, '')}" style="color: #8DC63F; text-decoration: none;">${phone}</a>
                            </td>
                          </tr>
                          ${resumePath ? `
                          <tr>
                            <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold; color: #333;">Resume:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #666;">Attached to this email</td>
                          </tr>
                          ` : ''}
                        </table>
                        
                        <h3 style="color: #333; font-size: 18px; margin-top: 25px; margin-bottom: 10px;">Cover Letter / Message:</h3>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #8DC63F; color: #555; line-height: 1.8; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
                        
                        <div style="margin-top: 25px; padding: 15px; background-color: #f0f7e8; border-radius: 5px; border-left: 4px solid #8DC63F;">
                          <p style="margin: 5px 0; color: #666; font-size: 14px;">
                            <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <p style="margin: 5px 0; color: #666; font-size: 14px;">
                            <strong>IP Address:</strong> ${ipAddress || 'Not available'}
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #999; font-size: 12px;">
                          This email was automatically generated from the Venwind Refex careers application form.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
New Careers Application - Venwind Refex

Applicant Information:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
${resumePath ? 'Resume: Attached to this email' : ''}

Cover Letter / Message:
${message}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
IP Address: ${ipAddress || 'Not available'}
        `
      };

      // Add resume attachment if provided
      if (resumePath) {
        const path = require('path');
        const fs = require('fs');
        if (fs.existsSync(resumePath)) {
          mailOptions.attachments = [{
            filename: path.basename(resumePath),
            path: resumePath
          }];
        }
      }

      // Send email
      console.log('📧 Attempting to send careers application email...');
      console.log('  From:', fromDisplay);
      console.log('  To:', toEmail);
      console.log('  Subject:', mailOptions.subject);
      console.log('  Resume attached:', resumePath ? 'Yes' : 'No');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Careers application email sent successfully!');
      console.log('  Message ID:', result.messageId);
      console.log('  Response:', result.response || 'No response');
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Careers application email sent successfully'
      };

    } catch (error) {
      console.error('Error sending careers application email:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        command: error.command,
        responseCode: error.responseCode
      });
      
      const errorMessage = error.message || 'Unknown error occurred';
      const errorCode = error.code || '';
      const responseCode = error.responseCode || '';
      
      // Provide more helpful error messages
      if (!process.env.SMTP_USER) {
        throw new Error('Email configuration error: SMTP_USER is not set. Please configure it in server/.env file and restart the server');
      } else if (!process.env.SMTP_PASS) {
        throw new Error('Email configuration error: SMTP_PASS is not set. Please configure it in server/.env file and restart the server');
      } else if (errorMessage.includes('authentication') || errorMessage.includes('Invalid login') || errorMessage.includes('535') || errorCode === 'EAUTH' || responseCode === 535) {
        throw new Error('Email authentication failed. Please verify SMTP_USER and SMTP_PASS in server/.env file are correct. For Gmail, make sure you\'re using an App Password (not your regular password).');
      } else if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorCode === 'ECONNREFUSED') {
        throw new Error('Cannot connect to email server. Please check SMTP_HOST and SMTP_PORT in server/.env file. Make sure the server is running and can reach the SMTP server.');
      } else if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        throw new Error('Connection timeout. Please check your internet connection and firewall settings. The SMTP server may be blocking the connection.');
      } else if (errorMessage.includes('ENOTFOUND')) {
        throw new Error(`SMTP server not found: ${process.env.SMTP_HOST || 'smtp.gmail.com'}. Please check SMTP_HOST in server/.env file`);
      }
      throw new Error(`Failed to send careers application email: ${errorMessage}${errorCode ? ' (Code: ' + errorCode + ')' : ''}${responseCode ? ' (Response: ' + responseCode + ')' : ''}`);
    }
  }

  // Send careers application auto-reply
  async sendCareersAutoReply(customerEmail, customerName, senderEmail = null) {
    try {
      const smtpAuthUser = process.env.SMTP_USER;
      if (!smtpAuthUser || smtpAuthUser.trim() === '') {
        throw new Error('SMTP_USER is not configured in environment variables. Please configure SMTP_USER in server/.env file');
      }
      
      const displayName = 'Venwind Refex';
      const fromDisplay = `${displayName} <${smtpAuthUser}>`;
      const mailOptions = {
        from: fromDisplay,
        replyTo: senderEmail || smtpAuthUser,
        to: customerEmail,
        subject: 'Thank you for your application - Venwind Refex',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8DC63F, #7AB62F); color: white; padding: 40px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Thank You!</h1>
                        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">We've received your application</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                          Dear ${customerName},
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                          Thank you for your interest in joining <strong>Venwind Refex</strong>. We have successfully received your application and our HR team will review it carefully.
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                          We typically review applications and respond to candidates within <strong>5-7 business days</strong>. If your application matches our requirements, we will contact you for the next steps.
                        </p>
                        
                        <div style="background-color: #f0f7e8; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8DC63F;">
                          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 18px;">What happens next?</h3>
                          <ul style="color: #666; padding-left: 20px; margin: 0; line-height: 2;">
                            <li>Our HR team will review your application and resume</li>
                            <li>If shortlisted, we'll contact you for an initial screening</li>
                            <li>Successful candidates will be invited for interviews</li>
                            <li>We'll keep you updated throughout the process</li>
                          </ul>
                        </div>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 25px 0 0 0;">
                          We appreciate your interest in being part of our team and wish you the best of luck with your application.
                        </p>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 30px 0 0 0;">
                          Best regards,<br>
                          <strong style="color: #8DC63F; font-size: 18px;">The Venwind Refex HR Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">
                          Venwind Refex Power Limited
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                          CIN: U27101TN2024PLC175572<br>
                          2nd floor, Refex Towers, 313, Valluvar Kottam High Road,<br>
                          Nungambakkam, Chennai-600034, Tamil Nadu, India
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
Thank you for your application - Venwind Refex!

Dear ${customerName},

Thank you for your interest in joining Venwind Refex. We have successfully received your application and our HR team will review it carefully.

We typically review applications and respond to candidates within 5-7 business days. If your application matches our requirements, we will contact you for the next steps.

What happens next?
- Our HR team will review your application and resume
- If shortlisted, we'll contact you for an initial screening
- Successful candidates will be invited for interviews
- We'll keep you updated throughout the process

We appreciate your interest in being part of our team and wish you the best of luck with your application.

Best regards,
The Venwind Refex HR Team

Venwind Refex Power Limited
CIN: U27101TN2024PLC175572
2nd floor, Refex Towers, 313, Valluvar Kottam High Road,
Nungambakkam, Chennai-600034, Tamil Nadu, India
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Careers auto-reply sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Careers auto-reply sent successfully'
      };

    } catch (error) {
      console.error('Error sending careers auto-reply:', error);
      throw new Error(`Failed to send careers auto-reply: ${error.message}`);
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
