const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const inquirer = require('inquirer');

// 1. MySQL DB connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'UnifiedMessaging',
});

// 2. Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ironmanonlineminecraft@gmail.com',
    pass: 'xxqu uxhu qwcy uotn',
  },
});

// 3. Email sending function
const sendEmail = async (email, name, products) => {
  const htmlMessage = `
    <h3>Hello ${name},</h3>
    <p>This is your personalized financial update for April 2025.</p>
    <p>You are currently using the following services: <strong>${products}</strong>.</p>
    <p>Thank you for being with us.</p>
    <br><p>– VB abundance</p>
  `;

  const mailOptions = {
    from: 'ironmanonlineminecraft@gmail.com',
    to: email,
    subject: 'Your Personalized Finance Update – April 2025',
    html: htmlMessage,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${name} (${email})`);
  } catch (error) {
    console.error(`❌ Failed to send to ${name} (${email}):`, error.message);
  }
};

// 4. Filter prompt logic
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
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE clientAge > 40`;
    case 'Clients using Loan products':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE clientProducts LIKE '%Loan%'`;
    case 'Family Heads over 40 using Loans':
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails WHERE familyHead = 1 AND clientAge > 40 AND clientProducts LIKE '%Loan%'`;
    default:
      return `SELECT clientName, clientEmail, clientProducts FROM clientDetails`;
  }
};

// 5. Main runner
const run = async () => {
  try {
    const query = await getFilterQuery(); // Wait for filter choice

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

        // Send emails in parallel
        await Promise.all(
          results.map(client =>
            sendEmail(client.clientEmail, client.clientName, client.clientProducts)
          )
        );

        connection.end();
      });
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    connection.end();
  }
};

run();
