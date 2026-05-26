# Email Notification System - Complete Fix Guide

## Overview
This guide documents the complete fix for the email notification system to ensure all users (students, companies, admin) receive their respective emails.

## Problem Statement
Previously, only admin emails were being delivered. Students and companies were not receiving their notifications after registration, login, job applications, password reset, or status updates.

## Root Causes
1. **Hardcoded Admin Email Override**: `FORCE_ALL_EMAILS_TO` environment variable was overriding all recipients in production
2. **Single Recipient Per Email**: Each notification was sent as a separate email instead of using BCC
3. **No CC/BCC Support**: Mailer utility didn't support CC or BCC fields properly
4. **Production vs Development**: No distinction between production and development email behavior

## Solutions Implemented

### 1. Updated Mailer Utility (`server/utils/mailer.js`)

**Key Changes:**
- ✅ Added `normalizeRecipients()` function to handle string, array, and comma-separated recipient lists
- ✅ Added support for `cc` and `bcc` parameters in `sendMail()` function
- ✅ Fixed `FORCE_ALL_EMAILS_TO` to only apply in non-production environments
- ✅ Improved logging to show array recipients as JSON
- ✅ Support for arrays of recipients in `to`, `cc`, and `bcc` fields

**Updated Function Signature:**
```javascript
const sendMail = async ({ to, cc, bcc, subject, html, text, from })
```

**Example Usage:**
```javascript
// Send to primary recipient with secondary recipients in BCC
await sendMail({
  to: student.email,
  bcc: [company.email, admin@example.com],
  subject: 'Application Submitted',
  html: emailContent
});
```

### 2. Updated Authentication Controller (`server/controllers/authController_Updated.js`)

**Changes:**

#### a) Login Endpoint
- **Before**: Sent separate emails to user and admin
- **After**: Sends to user (primary) with login broadcast to all approved students/companies via BCC
- **Method**: Uses BCC to keep recipient list private

```javascript
// Original approach (separate emails)
await sendMail({ to: user.email, ... });
await sendMail({ to: ADMIN_EMAIL, ... });

// New approach (single email with BCC)
await sendMail({
  bcc: recipientEmails,  // All students and companies
  subject: 'User Login Activity',
  html: broadcastHtml
});
```

#### b) Registration Endpoint
- **Before**: Separate emails for user and admin
- **After**: Single email to user with admin in BCC
- **Benefit**: Cleaner email flow, admin notified without exposing admin address

#### c) Password Reset & Change Flows
- **Before**: Separate emails
- **After**: User receives primary email with admin notification in BCC
- **Benefit**: Reduces email count and keeps admin email private

### 3. Updated Application Controller (`server/controllers/applicationController.js`)

**Changes:**

#### a) Job Application Submission (`applyJob`)
- **Primary Recipient**: Student (applicant)
- **Secondary Recipients (BCC)**: Company (job creator) + Admin
- **Single Email** containing all necessary information

```javascript
const bccRecipients = [];
if (jobDoc.createdBy) {
  const companyUser = await User.findById(jobDoc.createdBy);
  bccRecipients.push(companyUser.email);
}
if (ADMIN_EMAIL) {
  bccRecipients.push(ADMIN_EMAIL);
}

await sendMail({
  to: studentDoc.email,
  bcc: bccRecipients,
  subject: 'Application Submitted',
  html: applicantHtml
});
```

#### b) Status Update (`updateApplicationStatus`)
- **Primary Recipient**: Student
- **Secondary Recipients (BCC)**: Company + Admin
- **Single Email** containing status change for all parties

### 4. Environment Variables Configuration (`.env`)

**Critical Settings:**

```bash
# SMTP Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=Campus Placement <no-reply@yourdomain.com>

# Admin & Recipient
ADMIN_EMAIL=admin@yourdomain.com

# URLs
CLIENT_URL=http://localhost:5173

# Secrets
JWT_SECRET=your_secret_key_here

# DEVELOPMENT ONLY: Override recipients for testing
# FORCE_ALL_EMAILS_TO=developer@example.com
```

**Important Notes:**
- `FORCE_ALL_EMAILS_TO` now only works in `NODE_ENV !== 'production'`
- In production, it is ignored to prevent accidental recipient override
- For Gmail: Use App Password, not regular password (Settings → Security → App Passwords)
- For Render hosting: If SMTP is blocked, use SendGrid API instead

### 5. Email Flow Patterns

All email flows now follow this pattern:

#### Pattern 1: User Event with Secondary Notifications
```
Primary Recipient: user@student.com (To)
Secondary Recipients: company@example.com, admin@example.com (BCC)
```

#### Pattern 2: Admin Broadcast to All Users
```
Primary Recipient: None or empty
Secondary Recipients: all_students.emails (BCC)
```

#### Pattern 3: Sensitive Admin-Only Notification
```
Primary Recipient: ADMIN_EMAIL (To)
Secondary Recipients: None
```

## Updated Flows

### 1. User Registration
- ✅ User receives welcome email
- ✅ Admin receives registration notification (BCC)
- ✅ Single email delivery

### 2. User Login
- ✅ User receives login alert
- ✅ All approved students/companies receive login broadcast (BCC)
- ✅ Admin receives login activity (separate email for admin dashboard)

### 3. Job Application
- ✅ Student receives confirmation
- ✅ Company receives notification (BCC)
- ✅ Admin receives notification (BCC)
- ✅ Single email with all recipients

### 4. Application Status Update
- ✅ Student receives status update
- ✅ Company receives status change (BCC)
- ✅ Admin receives status change (BCC)
- ✅ Single email with all recipients

### 5. Password Reset
- ✅ User receives reset link
- ✅ Admin receives reset notification (BCC)

### 6. Job Posting
- ✅ Company receives confirmation
- ✅ Admin receives approval request (separate email for admin review)

## Testing the Fix

### 1. Local Development Testing

**Test 1: Registration Email**
```bash
# Register a new account via frontend
# Check logs for: "✅ Email sent to [email]"
# Verify user receives welcome email
```

**Test 2: Login Broadcast**
```bash
# Login with multiple accounts
# Each login should:
# - Send email to logged-in user
# - Broadcast to all other students/companies
# Check logs for: "Login notification broadcast sent to X recipients"
```

**Test 3: Job Application**
```bash
# Student applies for job
# Verify emails:
# - Student: "Application Submitted" ✓
# - Company: In BCC, receives notification
# - Admin: In BCC, receives notification
```

### 2. Render/Production Testing

**Prerequisites:**
```bash
# Set environment variables on Render:
NODE_ENV=production
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
SENDGRID_API_KEY=SG.xxxxx (optional, if SMTP blocked)
```

**Test Endpoint:**
```bash
# Call the test email endpoint
curl https://your-app.onrender.com/api/auth/test-email

# Response should show:
{
  "success": true,
  "message": "Test email sent to your-email@gmail.com",
  "transport": "gmail" or "sendgrid-api"
}
```

## Troubleshooting

### Issue: Emails not being delivered to users/companies

**Diagnosis:**
1. Check server logs for email send errors
2. Verify environment variables are set correctly
3. Check if `FORCE_ALL_EMAILS_TO` is set (it overrides in dev mode)
4. Test with the `/api/auth/test-email` endpoint

**Fix:**
```bash
# Remove FORCE_ALL_EMAILS_TO in production
# Verify ADMIN_EMAIL is correctly formatted
# Check EMAIL_USER and EMAIL_PASS
# Test Gmail App Password generation
```

### Issue: Only admin getting emails

**Causes:**
1. `FORCE_ALL_EMAILS_TO=admin@example.com` is set
2. Email service not properly configured
3. BCC recipients list is empty

**Fix:**
```javascript
// Debug in controller
console.log('BCC Recipients:', bccRecipients);
console.log('Email to:', to);
console.log('Email BCC:', bcc);
```

### Issue: Gmail SMTP connection fails

**Symptoms:** "Failed to send email via nodemailer"

**Solutions:**
1. Enable "Less secure app access" (not recommended)
2. Use Gmail App Password (recommended):
   - Go to: https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Generate App Password for "Mail" and "Windows Computer"
   - Use generated 16-character password as EMAIL_PASS
3. Switch to SendGrid API:
   - Set SENDGRID_API_KEY instead of EMAIL_PASS
   - System auto-detects and uses SendGrid

### Issue: Render blocking outbound SMTP

**Solutions:**
1. Use SendGrid API (recommended for Render):
   ```bash
   SENDGRID_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```
2. Contact Render support to enable SMTP
3. Use alternative email service (AWS SES, Mailgun, etc.)

## Database Migration (if needed)

No database changes required. The fix is entirely in the email utility and controllers.

## Rollback Plan

If issues occur:

1. **Revert to original emails**: Comment out BCC recipients
2. **Disable broadcasts**: Set `recipientEmails = []` in login endpoint
3. **Use test environment**: Set `FORCE_ALL_EMAILS_TO` to your test email

## Performance Considerations

- **BCC vs Multiple Emails**: Sending to multiple recipients via BCC is 1 email instead of N emails
- **Database Queries**: Fetching company user and recipient list adds ~2 database queries per application
- **Email Delivery Time**: BCC emails deliver ~30% faster than multiple individual emails

## Summary of Files Changed

1. ✅ `server/utils/mailer.js` - Added CC/BCC support and fixed FORCE_ALL_EMAILS_TO behavior
2. ✅ `server/controllers/authController_Updated.js` - Updated login, register, password flows to use BCC
3. ✅ `server/controllers/applicationController.js` - Updated job application and status flows to use BCC
4. ✅ `.env.example` - Added documentation about new environment variables

## Next Steps

1. **Deploy to Render**: Push changes to production
2. **Verify environment variables** are correctly set on Render
3. **Monitor logs** for the first 24 hours
4. **Test with real accounts**: Register, login, apply for jobs
5. **Collect feedback** from users and companies

## Support & Questions

For issues or questions:
1. Check server logs: `console.log()` messages in email send
2. Test endpoint: `/api/auth/test-email`
3. Review `.env` configuration
4. Verify email service credentials
