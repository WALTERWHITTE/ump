const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const inquirer = require('inquirer');
const fs = require('fs');

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// DB connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'UnifiedMessaging',
});

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ironmanonlineminecraft@gmail.com',
    pass: 'xxqu uxhu qwcy uotn',
  },
});

// Email result tracking
let failedEmails = [];
const successfulEmails = [];

// Send email
const sendEmail = async (email, name, products, type = 'standard', isRetry = false) => {
  let subject = 'Your Personalized Finance Update – April 2025';
  let htmlMessage = `
    <h1>Your Personalized Financial Update – April 2025</h1>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We appreciate your continued trust in our services. As of April 2025, you are currently using the following financial services with us: <strong>${products}</strong>.</p>
    <p>Thank you for being a valued part of our community. We remain committed to supporting your financial goals with dedication and care.</p>
    <p>Warm regards,<br><strong>-VB Abundance</strong></p>
  `;

  if (type === 'birthday') {
    subject = `🎂 Happy Birthday, ${name}!`;
    htmlMessage = `
      <h1>Wishing You a Very Happy Birthday!</h1>
      <p>Dear <strong>${name}</strong>,</p>
      <p>On behalf of all of us at <strong>VB Abundance</strong>, we extend our warmest wishes to you on your special day.</p>
      <p>May this year bring you happiness, health, and continued success. Thank you for being a cherished part of our community.</p>
      <p>Warm regards,<br><strong>-VB Abundance</strong></p>
    `;
  }

  if (type === 'digitalGold') {
    subject = `💰 Invest in Your Future: Digital Gold Opportunity`;
    htmlMessage = `
      <h2>Dear ${name},</h2>
      <p>As a valued client, we're excited to offer you a unique opportunity to invest in the future of wealth: <strong>Digital Gold</strong>.</p>
      <p>Digital Gold is a secure and convenient way to grow your savings and achieve long-term financial goals.</p>
      <p>Let us help you make smart investment choices that align with your aspirations.</p>
      <br><p>Best regards,</p><br>
        <strong>-VB Abundance</strong>
    `;
  }

  const mailOptions = {
    from: 'ironmanonlineminecraft@gmail.com',
    to: email,
    subject,
    html: htmlMessage,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Email ${isRetry ? 're-' : ''}sent to ${name} (${email})`);
  successfulEmails.push({ name, email, products });
};

// Prompt for filter
const getFilterQuery = async () => {
  const { filter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filter',
      message: 'Choose which clients to email:',
      choices: [
        'All Clients',
        'Only Family Heads',
        'Clients older than 40',
        'Clients using Loan products',
        'Family Heads over 40 using Loans',
        'Clients celebrating their birthday today',
        'Female Clients for Digital Gold Investment',
      ],
    },
  ]);

  switch (filter) {
    case 'Only Family Heads':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE familyHead = 1`;

    case 'Clients older than 40':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE TIMESTAMPDIFF(YEAR, clientDob, CURDATE()) > 40`;

    case 'Clients using Loan products':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE clientProducts LIKE '%Loan%'`;

    case 'Family Heads over 40 using Loans':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE familyHead = 1 AND TIMESTAMPDIFF(YEAR, clientDob, CURDATE()) > 40 AND clientProducts LIKE '%Loan%'`;

    case 'Clients celebrating their birthday today':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE DAY(clientDob) = DAY(CURDATE()) AND MONTH(clientDob) = MONTH(CURDATE())`;

    case 'Female Clients for Digital Gold Investment':
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails WHERE clientGender = 'Female'`;

    default:
      return `SELECT clientName, clientEmail, clientProducts, clientGender, clientDob FROM clientDetails`;
  }
};

// Main runner
const run = async () => {
  const query = await getFilterQuery();

  connection.connect((err) => {
    if (err) {
      console.error('❌ Database connection error:', err.message);
      process.exit(1);
    }

    console.log('✅ Connected to MySQL');

    connection.query(query, async (err, results) => {
      if (err) {
        console.error('❌ Error querying database:', err.message);
        connection.end();
        return;
      }

      for (const client of results) {
        let emailType = 'standard';

        const isBirthdayToday =
          new Date(client.clientDob).getDate() === new Date().getDate() &&
          new Date(client.clientDob).getMonth() === new Date().getMonth();

        if (query.includes('birthday') || isBirthdayToday) {
          emailType = 'birthday';
        } else if (query.toLowerCase().includes('female') && client.clientGender === 'Female') {
          emailType = 'digitalGold';
        }

        try {
          await sendEmail(client.clientEmail, client.clientName, client.clientProducts, emailType);
        } catch (error) {
          console.error(`❌ Failed to send to ${client.clientName} (${client.clientEmail}):`, error.message);
          failedEmails.push({ name: client.clientName, email: client.clientEmail, products: client.clientProducts, type: emailType });
        }

        await delay(500);
      }

      // Infinite retry block
      if (failedEmails.length > 0) {
        console.log('\n🔁 Retrying failed emails until they succeed...\n');
        const retryQueue = [...failedEmails];
        failedEmails = [];

        for (const client of retryQueue) {
          let sent = false;
          let attempts = 0;

          while (!sent) {
            try {
              await sendEmail(client.email, client.name, client.products, client.type, true);
              sent = true;
              await delay(1000);
            } catch (err) {
              attempts++;
              console.log(`⏳ Retry attempt ${attempts} for ${client.name} (${client.email})`);
              await delay(5000);
            }
          }
        }
      }

      // Export results
      if (successfulEmails.length > 0) {
        fs.writeFileSync('successful-emails.json', JSON.stringify(successfulEmails, null, 2));
        console.log('✅ Successful emails saved to successful-emails.json');
      }

      connection.end();
    });
  });
};

run();
