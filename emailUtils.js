const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ironmanonlineminecraft@gmail.com',
    pass: 'xxqu uxhu qwcy uotn',
  },
});

const sendEmail = async (email, name, products, type = 'standard') => {
  const validTypes = ['birthday', 'digitalGold', 'standard'];
  if (!validTypes.includes(type)) {
    console.warn(`⚠️ Invalid email type "${type}" for ${email}, defaulting to 'standard'.`);
    type = 'standard';
  }

  console.log(`📨 Sending email to ${name} (${email}) with type: ${type}`);

  let subject = '';
  let htmlMessage = '';

  switch (type) {
    case 'birthday':
      subject = `🎂 Happy Birthday, ${name}!`;
      htmlMessage = `
        <h1>Wishing You a Very Happy Birthday!</h1>
        <p>Dear <strong>${name}</strong>,</p>
        <p>On behalf of all of us at <strong>VB Abundance</strong>, we extend our warmest wishes to you on your special day.</p>
        <p>May this year bring you happiness, health, and continued success. Thank you for being a cherished part of our community.</p>
        <p>Warm regards,<br><strong>-VB Abundance</strong></p>
      `;
      break;

    case 'digitalGold':
      subject = `💰 Invest in Your Future: Digital Gold Opportunity`;
      htmlMessage = `
        <h2>Dear ${name},</h2>
        <p>As a valued client, we're excited to offer you a unique opportunity to invest in the future of wealth: <strong>Digital Gold</strong>.</p>
        <p>Digital Gold is a secure and convenient way to grow your savings and achieve long-term financial goals.</p>
        <p>Let us help you make smart investment choices that align with your aspirations.</p>
        <p>Best regards,<br><strong>-VB Abundance</strong></p>
      `;
      break;

    case 'standard':
    default:
      subject = 'Your Personalized Finance Update – April 2025';
      htmlMessage = `
        <h1>Your Personalized Financial Update – April 2025</h1>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We appreciate your continued trust in our services. As of April 2025, you are currently using the following financial services with us: <strong>${products}</strong>.</p>
        <p>Thank you for being a valued part of our community. We remain committed to supporting your financial goals with dedication and care.</p>
        <p>Warm regards,<br><strong>-VB Abundance</strong></p>
      `;
      break;
  }

  const mailOptions = {
    from: 'ironmanonlineminecraft@gmail.com',
    to: email,
    subject: subject,
    html: htmlMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${name} (${email})`);
  } catch (error) {
    throw new Error(`Failed to send email to ${name} (${email}): ${error.message}`);
  }
};

module.exports = { sendEmail };
