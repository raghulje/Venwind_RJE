# How to Check Server Logs for Email Debugging

## Step 1: Navigate to Server Directory
```bash
cd server
```

## Step 2: Start the Server
```bash
npm start
```
OR if you want auto-reload on changes:
```bash
npm run dev
```

## Step 3: Watch the Terminal
Once the server starts, you'll see:
```
Server is running on port 8080.
Database synced successfully
```

## Step 4: Submit a Test Form
Go to your website and submit the contact form or careers form.

## Step 5: Check the Logs
You should see logs in the terminal like:

### For Contact Form:
```
📧 Email config from CMS: { "senderEmail": "...", "receiverEmail": "..." }
✅ Using receiver email from CMS: your-email@example.com
📧 Sending email to: your-email@example.com
📧 Email Service - Contact Form Email:
  From (SMTP_USER): dickson.g@refex.co.in
  To (Receiver): your-email@example.com
📧 Attempting to send contact form email...
✅ Contact form email sent successfully!
  Message ID: <...>
  Response: 250 2.0.0 OK
```

### For Careers Form:
```
📧 Careers email config from CMS: { ... }
✅ Using receiver email from CMS: your-email@example.com
📧 Sending careers application email to: your-email@example.com
📧 Email Service - Careers Application Email:
  From (SMTP_USER): dickson.g@refex.co.in
  To (Receiver): your-email@example.com
✅ Careers application email sent successfully!
```

## What to Look For:

### ✅ GOOD SIGNS:
- `✅ Using receiver email from CMS:` - Shows email from CMS is being used
- `✅ Email sent successfully!` - Email was sent
- `Message ID:` - Confirmation that email was accepted by SMTP server

### ⚠️ PROBLEMS:
- `⚠️ Receiver email not found or empty in CMS` - Email not set in CMS
- `❌ Invalid receiver email format` - Email format is wrong
- `Failed to fetch email config from CMS` - Database connection issue
- `Error sending email:` - SMTP/authentication problem

## Test Email Endpoint

You can also test email sending directly:

### Using PowerShell (Windows):
```powershell
# Test email connection
Invoke-WebRequest -Uri "http://localhost:8080/api/test-email" -Method GET

# Send test email (replace YOUR_EMAIL with actual email)
$body = @{
    testEmail = "YOUR_EMAIL@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/test-email-send" -Method POST -Body $body -ContentType "application/json"
```

### Using Browser:
1. Open: `http://localhost:8080/api/test-email`
2. This will show if email service is working

### Using curl (if installed):
```bash
# Test connection
curl http://localhost:8080/api/test-email

# Send test email
curl -X POST http://localhost:8080/api/test-email-send \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "YOUR_EMAIL@example.com"}'
```

## Common Issues:

1. **Server not running**: Start it with `npm start` in the server folder
2. **Port already in use**: Change PORT in `.env` file or stop other server
3. **Database connection error**: Check your database credentials in `.env`
4. **Email not in logs**: Make sure you're looking at the correct terminal window

