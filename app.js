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
const sendEmail = async (email, name, products, isRetry = false) => {
  const htmlMessage = `
    <h3>Hello ${name},</h3>
    <p>This is your personalized financial update for April 2025.</p>
    <p>You are currently using the following services: <strong>${products}</strong>.</p>
    <p>Thank you for being with us.</p>
    <br><p>– VB Abundance</p>
  `;

  const mailOptions = {
    from: 'ironmanonlineminecraft@gmail.com',
    to: email,
    subject: 'Your Personalized Finance Update – April 2025',
    html: htmlMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email ${isRetry ? 're-' : ''}sent to ${name} (${email})`);
    successfulEmails.push({ name, email, products });
  } catch (error) {
    console.error(`❌ ${isRetry ? 'Retry failed' : 'Failed'} to send to ${name} (${email}):`, error.message);
    if (!isRetry) failedEmails.push({ name, email, products });
  }
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
      ],
    },
  ]);

  switch (filter) {
    case 'Only Family Heads':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE familyHead = 1`;

    case 'Clients older than 40':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE TIMESTAMPDIFF(YEAR, clientDob, CURDATE()) > 40`;

    case 'Clients using Loan products':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE clientProducts LIKE '%Loan%'`;

    case 'Family Heads over 40 using Loans':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE familyHead = 1 AND TIMESTAMPDIFF(YEAR, clientDob, CURDATE()) > 40 AND clientProducts LIKE '%Loan%'`;

    default:
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails`;
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

      // 1. Initial send
      for (const client of results) {
        await sendEmail(client.clientEmail, client.clientName, client.clientProducts);
        await delay(500); // Half-second delay to reduce risk of spam flags
      }

      // 2. Retry failed ones
      if (failedEmails.length > 0) {
        console.log('\n🔁 Retrying failed emails...\n');
        const failedRetry = [...failedEmails];
        failedEmails = [];

        for (const client of failedRetry) {
          await sendEmail(client.email, client.name, client.products, true);
          await delay(2000); // 2-second delay between retries
        }
      }

      // 3. Export results
      if (failedEmails.length > 0) {
        fs.writeFileSync('failed-emails.json', JSON.stringify(failedEmails, null, 2));
        console.log('\n💾 Failed emails saved to failed-emails.json');
      } else if (fs.existsSync('failed-emails.json')) {
        fs.unlinkSync('failed-emails.json');
      }

      if (successfulEmails.length > 0) {
        fs.writeFileSync('successful-emails.json', JSON.stringify(successfulEmails, null, 2));
        console.log('✅ Successful emails saved to successful-emails.json');
      } else if (fs.existsSync('successful-emails.json')) {
        fs.unlinkSync('successful-emails.json');
      }

      connection.end();
    });
  });
};

run();
