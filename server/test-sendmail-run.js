const { sendMail } = require('./utils/mailer');
(async () => {
  const res = await sendMail({
    to: 'campus.placement.info@gmail.com',
    subject: 'Direct SMTP delivery test',
    html: '<p>If you see this, Gmail SMTP works.</p>'
  });
  console.log(JSON.stringify(res, null, 2));
})();
