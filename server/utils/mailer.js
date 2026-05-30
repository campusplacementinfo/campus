const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const sendgridMail = require('@sendgrid/mail');

const rootEnvPath = path.join(__dirname, '../../.env');
const serverEnvPath = path.join(__dirname, '../.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath, override: true });

const EMAIL_USER = process.env.EMAIL_USER?.trim();
const EMAIL_PASS = process.env.EMAIL_PASS?.trim();
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || EMAIL_USER;
const FROM_EMAIL = EMAIL_FROM || EMAIL_USER;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE?.trim();
const EMAIL_HOST = process.env.EMAIL_HOST?.trim();
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
const FORCE_ALL_EMAILS_TO = process.env.FORCE_ALL_EMAILS_TO?.trim();

let transporter;
let fallbackTransport = false;
let transporterMode = 'unknown';
let useSendGridApi = false;

let normalizedEmailPass = EMAIL_PASS;
if (typeof normalizedEmailPass === 'string' && normalizedEmailPass.includes(' ')) {
  normalizedEmailPass = normalizedEmailPass.replace(/\s+/g, '');
  console.log('Normalized EMAIL_PASS by removing spaces from app password');
}

const useStubTransport = () => {
  transporter = nodemailer.createTransport({ jsonTransport: true });
  fallbackTransport = true;
  transporterMode = 'stub';
  console.warn('Using fallback email transport: emails will not be sent but will be logged as JSON.');
};

const wrapHtmlEmail = (heading, bodyHtml) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 20px;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 14px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="background-color: #1d4ed8; color: #ffffff; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.02em;">${heading}</h1>
        </div>
        <div style="padding: 30px 32px; color: #333333; line-height: 1.65;">
          ${bodyHtml}
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding: 20px 32px; font-size: 13px; color: #667085;">
          <p style="margin: 0;">Campus Placement Portal</p>
          <p style="margin: 8px 0 0; color: #9ca3af;">This email was sent automatically. If you did not expect it, please contact support.</p>
        </div>
      </div>
    </div>
  `;
};

const buildSmtpConfig = () => {
  const config = {
    authMethod: 'LOGIN',
    auth: {
      user: EMAIL_USER,
      pass: normalizedEmailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  if (EMAIL_HOST) {
    config.host = EMAIL_HOST;
    config.port = EMAIL_PORT || 587;
    config.secure = EMAIL_SECURE || config.port === 465;
  } else if (EMAIL_SERVICE) {
    if (EMAIL_SERVICE.toLowerCase() === 'gmail') {
      config.service = 'gmail';
      config.host = 'smtp.gmail.com';
      config.port = EMAIL_PORT || 465;
      config.secure = EMAIL_SECURE || config.port === 465;
      config.auth = {
        user: EMAIL_USER,
        pass: normalizedEmailPass
      };
    } else {
      config.service = EMAIL_SERVICE;
    }
  } else {
    config.host = 'smtp.gmail.com';
    config.port = 587;
    config.secure = false;
  }

  if (EMAIL_SERVICE?.toLowerCase() === 'gmail' && EMAIL_FROM && !EMAIL_FROM.toLowerCase().includes(EMAIL_USER.toLowerCase())) {
    console.warn('EMAIL_FROM differs from EMAIL_USER for Gmail SMTP. Gmail may require a verified alias or reject the message.');
  }

  return config;
};

if (SENDGRID_API_KEY) {
  useSendGridApi = true;
  sendgridMail.setApiKey(SENDGRID_API_KEY);
  transporterMode = 'sendgrid-api';
  console.log('Configured mailer: SendGrid API transport');
} else if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('EMAIL_USER or EMAIL_PASS is not configured. Falling back to stub transport.');
  useStubTransport();
}

if (!useSendGridApi && !fallbackTransport) {
  transporter = nodemailer.createTransport({
    ...buildSmtpConfig(),
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
  });
  transporterMode = EMAIL_HOST ? 'smtp' : 'gmail';
  console.log('Configured mailer transport:', EMAIL_HOST || EMAIL_SERVICE || 'gmail');
}

if (!transporter && !useSendGridApi) {
  useStubTransport();
}

if (!fallbackTransport && transporter) {
  setImmediate(() => {
    transporter.verify((error) => {
      if (error) {
        console.error('Email transporter verification failed:', error.message);
        console.warn('Switching to fallback email transport.');
        useStubTransport();
      } else {
        console.log('Email transporter verified successfully');
      }
    });
  });
}

const normalizeRecipients = (val) => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
};

const sendMail = async ({ to, cc, bcc, subject, html, text, from }) => {
  const originalRecipients = { to, cc, bcc };

  const toList = normalizeRecipients(to);
  const ccList = normalizeRecipients(cc);
  const bccList = normalizeRecipients(bcc);

  let overrideRecipients = null;
  if (FORCE_ALL_EMAILS_TO && process.env.NODE_ENV !== 'production') {
    overrideRecipients = normalizeRecipients(FORCE_ALL_EMAILS_TO);
    console.log(`Overriding recipients for non-production: routing all mail to ${overrideRecipients}`);
  } else if (FORCE_ALL_EMAILS_TO && process.env.NODE_ENV === 'production') {
    console.warn('FORCE_ALL_EMAILS_TO is set but ignored in production to prevent recipient override');
  }

  if (fallbackTransport) {
    const errorMessage = 'Mailer is using fallback stub transport; no messages are sent.';
    console.error(errorMessage);
    return { success: false, error: errorMessage, transport: transporterMode };
  }

  if (useSendGridApi) {
    const msg = {
      to: overrideRecipients || toList || undefined,
      cc: ccList || undefined,
      bcc: bccList || undefined,
      from: from || FROM_EMAIL,
      subject,
      text: text || undefined,
      html: html || undefined,
      replyTo: EMAIL_USER
    };

    try {
      const [response] = await sendgridMail.send(msg);
      console.log(`✅ SendGrid email sent to ${JSON.stringify(msg.to)} subject="${subject}" originalRecipients="${JSON.stringify(originalRecipients)}" from="${msg.from}"`);
      return { success: true, info: response, transport: transporterMode };
    } catch (error) {
      console.error(`Failed to send email via SendGrid to ${JSON.stringify(msg.to)}:`, error.message || error);
      return { success: false, error: error.message || String(error), transport: transporterMode };
    }
  }

  const mailOptions = {
    from: from || FROM_EMAIL,
    to: overrideRecipients || toList || undefined,
    cc: ccList || undefined,
    bcc: bccList || undefined,
    subject,
    text: text || undefined,
    html: html || undefined,
    replyTo: EMAIL_USER,
    sender: EMAIL_USER
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const accepted = info.accepted || [];
    const rejected = info.rejected || [];
    console.log(`✅ Email sent to ${JSON.stringify(mailOptions.to)} subject="${subject}" originalRecipients="${JSON.stringify(originalRecipients)}" from="${mailOptions.from}" accepted=${JSON.stringify(accepted)} rejected=${JSON.stringify(rejected)}`);
    return { success: true, info, accepted, rejected, transport: transporterMode };
  } catch (error) {
    let rejected = [];
    let responseInfo = undefined;
    try {
      if (error.rejected) rejected = error.rejected;
      if (error.response) responseInfo = error.response;
      if (error.response && error.response.body && error.response.body.errors) responseInfo = error.response.body;
    } catch (e) {
    }

    console.error(`Failed to send email to ${JSON.stringify(mailOptions.to)}:`, error.message, 'originalRecipients=', originalRecipients, 'from=', mailOptions.from, 'response=', responseInfo);
    return { success: false, error: error.message || String(error), rejected, response: responseInfo, transport: transporterMode };
  }
};

module.exports = {
  sendMail,
  wrapHtmlEmail,
  transporterMode: () => transporterMode,
  isFallbackTransport: () => fallbackTransport
};
