const { sendMail } = require('./utils/mailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev-test@example.com';

(async () => {
  try {
    console.log('Triggering test email to', ADMIN_EMAIL);
    const res = await sendMail({
      to: ADMIN_EMAIL,
      subject: 'Dev Test Email',
      html: '<p>This is a development test email from Campus Placement Portal.</p>'
    });
    console.log('sendMail returned:', res);
  } catch (err) {
    console.error('Test send failed:', err && err.message ? err.message : err);
  }
  setTimeout(() => process.exit(0), 500);
})();
