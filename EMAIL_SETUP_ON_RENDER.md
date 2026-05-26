# Email Configuration on Render - Setup Guide

## Problem
Emails are not being sent after deploying to Render. The application requires email service configuration.

## Solution

The application supports **3 email service options**:

### Option 1: SendGrid API (Recommended for Production) ⭐

**Best for:** Production, most reliable

1. **Create a SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up (free tier available with 100 emails/day)
   - Verify your sender email or domain

2. **Get API Key**
   - In SendGrid dashboard → Settings → API Keys
   - Create a new API key (Full Access)
   - Copy the key

3. **Set on Render**
   - Go to your Render service dashboard
   - Environment → Environment Variables
   - Add:
     ```
     SENDGRID_API_KEY=<paste-your-api-key-here>
     ```
   - Save and reopen web service

4. **Test**
   - Once deployed, visit: `https://your-app.onrender.com/api/auth/test-email`
   - Check your email for test message

---

### Option 2: Gmail SMTP

**Best for:** Small scale or testing

1. **Enable 2FA on your Gmail Account**
   - Go to myaccount.google.com → Security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to myaccount.google.com → Security → App passwords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy it (will include spaces - don't worry, app removes them)

3. **Set on Render**
   - Go to your Render service dashboard
   - Environment → Environment Variables
   - Add:
     ```
     EMAIL_USER=your-gmail@gmail.com
     EMAIL_PASS=your-16-character-app-password
     EMAIL_SERVICE=gmail
     ADMIN_EMAIL=your-email@gmail.com
     CLIENT_URL=https://your-app.onrender.com
     ```

4. **Test**
   - Once deployed, visit: `https://your-app.onrender.com/api/auth/test-email`

---

### Option 3: Custom SMTP Server

**Best for:** Corporate mail servers or specific providers**

1. **Gather SMTP Details**
   - SMTP Host (e.g., `smtp.company.com`)
   - SMTP Port (usually 587 or 465)
   - Email Username
   - Email Password
   - Use TLS/SSL? (usually yes for 587, 465)

2. **Set on Render**
   - Go to your Render service dashboard
   - Environment → Environment Variables
   - Add:
     ```
     EMAIL_HOST=smtp.company.com
     EMAIL_PORT=587
     EMAIL_USER=sender@company.com
     EMAIL_PASS=your-password
     EMAIL_SECURE=false
     ADMIN_EMAIL=admin@company.com
     CLIENT_URL=https://your-app.onrender.com
     ```
   - If PORT is 465, set EMAIL_SECURE=true

3. **Test**
   - Once deployed, visit: `https://your-app.onrender.com/api/auth/test-email`

---

## Additional Environment Variables

Add these to all options:

| Variable | Example | Purpose |
|----------|---------|---------|
| `ADMIN_EMAIL` | `admin@company.com` | Receives admin notifications |
| `CLIENT_URL` | `https://your-app.onrender.com` | Used in email links (reset password, etc.) |
| `NODE_ENV` | `production` | Already set by Render |

---

## Testing Email Configuration

After setting environment variables:

### 1. **Quick Test Endpoint**
```
GET https://your-app.onrender.com/api/auth/test-email
```

Expected response (success):
```json
{
  "success": true,
  "message": "Test email sent to sender@email.com",
  "transport": "sendgrid-api"
}
```

Expected response (failure):
```json
{
  "success": false,
  "message": "Mailer is using fallback stub transport; no emails will be delivered.",
  "error": "Fallback transport enabled",
  "troubleshooting": "Set EMAIL_USER and EMAIL_PASS, or configure SENDGRID_API_KEY for production."
}
```

### 2. **Check Server Logs**
- In Render dashboard → Logs
- Look for lines like:
  - ✅ `Configured mailer: SendGrid API transport`
  - ✅ `Email transporter verified successfully`
  - ❌ `EMAIL_USER or EMAIL_PASS is not configured`
  - ❌ `Switching to fallback email transport`

---

## Troubleshooting

### "Using fallback stub transport"
**Cause:** Environment variables not set
**Fix:** 
1. Double-check all variable names (case-sensitive)
2. Make sure you copied values without extra spaces
3. Redeploy after adding variables: Settings → Redeploy latest commit

### "Email transporter verification failed"
**Cause:** Credentials are incorrect or SMTP server rejected connection
**Fix:**
- For Gmail: Verify app password (not regular password)
- For Gmail: Confirm 2FA is enabled
- For custom SMTP: Verify host, port, and credentials are correct
- Try with a different provider

### "SMTP connection timeout"
**Cause:** Port or host is wrong, or firewall blocking
**Fix:**
- Verify SMTP host and port are correct
- Try port 587 instead of 465, or vice versa
- Contact your email provider for correct SMTP settings

### "Emails send but don't arrive"
**Cause:** 
- Sender address not verified (SendGrid/Custom)
- Email filtered to spam
- Recipient email configured wrong

**Fix:**
- Check spam folder
- Verify sender domain in SendGrid
- Test with a different recipient email

---

## How Email System Works

```
User Registration
    ↓
Backend: generateJWT + create user record
    ↓
Frontend: Show success message
    ↓
Backend (background): sendPostRegistrationNotifications()
    ├→ Email to User: "Welcome to portal"
    └→ Email to Admin: "New registration"

Password Reset
    ↓
User: Forgot Password form → Backend
    ↓
Backend: Generate reset token
    ↓
Backend (background): sendMail() with reset link
    ↓
User: Clicks link in email → Frontend form
    ↓
User: New password → Backend
    ↓
Backend: Update password + send confirmation email
```

---

## SendGrid Setup (Detailed Steps)

### Step 1: Create Account
1. Go to https://sendgrid.com/pricing
2. Click "Free" plan
3. Sign up with Google or email

### Step 2: Verify Sender
1. In dashboard, click "Sender authentication"
2. Choose "Verify a Single Sender" or "Verify a Domain"
3. Follow steps (usually just verify via email)

### Step 3: Create API Key
1. Click "Settings" → "API Keys"
2. Click "Create API Key"
3. Give it a name: `Campus Portal Production`
4. Select "Full Access"
5. Click "Create & Copy"
6. **Don't close this page** - you won't see it again!
7. Paste into Render environment variables

---

## Gmail App Password Setup (Detailed Steps)

### Step 1: Enable 2FA
1. Go to https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. Click it and follow setup (use phone)

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select: App = "Mail", Device = "Windows Computer"
3. Google generates 16-char password with spaces
4. Copy it exactly as shown
5. Paste into Render (app automatically removes spaces)

### Step 3: What NOT to do
❌ Don't use your regular Gmail password  
❌ Don't enable "Less secure app access"  
❌ Don't remove spaces from app password manually

---

## Manual Testing Locally

Before deploying, test email locally:

### Linux/Mac:
```bash
cd server
export EMAIL_USER="your-gmail@gmail.com"
export EMAIL_PASS="your-app-password"
export EMAIL_SERVICE="gmail"
node test-sendmail.js
```

### Windows PowerShell:
```powershell
cd server
$env:EMAIL_USER="your-gmail@gmail.com"
$env:EMAIL_PASS="your-app-password"
$env:EMAIL_SERVICE="gmail"
node test-sendmail.js
```

Expected output:
```
Configured mailer transport: gmail
Email transporter verified successfully
✅ Email sent to your-email@gmail.com...
```

---

## Render Redeployment

After setting environment variables:

1. Go to your Render service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Check logs for: `Configured mailer: ...`
5. Test via `/api/auth/test-email`

---

## Quick Reference: What to Add to Render

### SendGrid (Copy-Paste Ready):
```
SENDGRID_API_KEY=<your-key>
ADMIN_EMAIL=admin@yourdomain.com
CLIENT_URL=https://your-app.onrender.com
```

### Gmail (Copy-Paste Ready):
```
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_SERVICE=gmail
ADMIN_EMAIL=your@gmail.com
CLIENT_URL=https://your-app.onrender.com
```

### Custom SMTP (Copy-Paste Ready):
```
EMAIL_HOST=smtp.company.com
EMAIL_PORT=587
EMAIL_USER=noreply@company.com
EMAIL_PASS=your-password
EMAIL_SECURE=false
ADMIN_EMAIL=admin@company.com
CLIENT_URL=https://your-app.onrender.com
```

---

## Still Not Working?

1. **Check Render Logs**
   - Go to your Render service
   - Click "Logs"
   - Scroll to deployment and look for email-related messages

2. **Run Test Endpoint**
   - Visit: `https://your-app.onrender.com/api/auth/test-email`
   - Copy exact error message

3. **Verify Variables Added**
   - Go to Settings → Environment
   - Verify each variable is listed correctly
   - No typos or extra spaces

4. **Redeploy**
   - Sometimes environment variables don't take effect until redeploy
   - Click "Manual Deploy" in Render

5. **Check Email Spam**
   - Emails might be going to spam folder
   - Gmail: Check "Promotions" or "All Mail"

---

## Production Recommendations

✅ **Do:**
- Use SendGrid for production (most reliable)
- Set ADMIN_EMAIL for error notifications
- Test with `/api/auth/test-email` after each config change
- Monitor Render logs for email errors

❌ **Don't:**
- Use Gmail for high-volume apps (100/day limit on free tier)
- Share API keys or app passwords
- Store credentials in code (use Render environment variables)
- Test with real production email addresses in development
