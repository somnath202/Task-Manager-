// Mock email helper for development and production-ready logging
// Can be easily connected to SendGrid, Mailgun, or standard SMTP transport by configuring nodemailer
const sendEmail = async (options) => {
  console.log('==================================================');
  console.log('SENDING EMAIL SIMULATION:');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message:\n${options.message}`);
  console.log('==================================================');

  // In a real-world application, you would configure nodemailer here:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
  */
  return true;
};

module.exports = sendEmail;
