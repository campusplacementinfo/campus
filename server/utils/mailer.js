const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

const serverEnvPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath, override: true });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('Mailer not fully configured. Set EMAIL_USER and EMAIL_PASS in .env');
}

let transporter;

// Prefer SendGrid if API key provided
if (SENDGRID_API_KEY) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.sendgrid.net',
    port: EMAIL_PORT || 587,
    secure: typeof EMAIL_SECURE === 'boolean' ? EMAIL_SECURE : false,
    auth: {
      user: 'apikey',
      pass: SENDGRID_API_KEY
    }
  });
  console.log('Configured transporter: SendGrid SMTP');
} else {
  const transportConfig = {
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  };

  if (EMAIL_HOST) {
    transportConfig.host = EMAIL_HOST;
    transportConfig.port = EMAIL_PORT || 587;
    transportConfig.secure = typeof EMAIL_SECURE === 'boolean' ? EMAIL_SECURE : EMAIL_PORT === 465;
  } else if (EMAIL_SERVICE) {
    transportConfig.service = EMAIL_SERVICE;
  } else {
    transportConfig.service = 'gmail';
  }

  transporter = nodemailer.createTransport(transportConfig);
  console.log('Configured transporter:', transportConfig.service || transportConfig.host);
}


// Verify transporter asynchronously (non-blocking)
setImmediate(() => {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error.message);
    } else {
      console.log('Email transporter verified successfully');
    }
  });
});

const sendMail = async ({ to, subject, html, text }) => {
  // Send email asynchronously without awaiting (fire and forget)
  transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text: text || undefined,
    html: html || undefined
  }, (error, info) => {
    if (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
    } else {
      console.log(`✅ Email sent to ${to} subject="${subject}"`);
    }
  });

  // Return success immediately without waiting
  return { success: true };
};
module.exports = {
  sendMail
};
