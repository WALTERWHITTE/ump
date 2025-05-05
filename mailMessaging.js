const fs = require('fs');
const mysql = require('mysql2/promise');
const { getFilterQuery } = require('./utils/getFilterQuery');
const { sendEmail } = require('./utils/emailUtils');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getTimestamp = () => new Date().toISOString();

const runEmailMessaging = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'UnifiedMessaging',
  });

  try {
    const { query, filter } = await getFilterQuery();
    const [results] = await connection.query(query);

    if (!results.length) {
      console.log('⚠️ No clients found for the selected filter.');
      return;
    }

    const successfulEmails = [];
    const failedEmails = [];

    // Determine type based on selected filter
    let type = 'standard';
    if (filter === 'Female Clients for Digital Gold Investment') {
      type = 'digitalGold';
    } else if (filter === 'Clients celebrating their birthday today') {
      type = 'birthday';
    }

    for (const client of results) {
      try {
        await sendEmail(client.clientEmail, client.clientName, client.clientProducts, type);
        successfulEmails.push({
          name: client.clientName,
          email: client.clientEmail,
          type,
          timestamp: getTimestamp()
        });
      } catch (error) {
        console.error(`❌ Failed to send to ${client.clientName}:`, error.message);
        failedEmails.push({
          name: client.clientName,
          email: client.clientEmail,
          products: client.clientProducts,
          type
        });
      }
    }

    if (successfulEmails.length) {
      fs.writeFileSync('successful-emails.json', JSON.stringify(successfulEmails, null, 2));
      console.log('📝 Email log saved to successful-emails.json');
    }

    const retrySuccesses = [];

    for (const client of failedEmails) {
      let attempts = 0;
      let sent = false;
      while (!sent && attempts < 5) {
        try {
          await sendEmail(client.email, client.name, client.products, client.type);
          console.log(`✅ Re-sent to ${client.name}`);
          retrySuccesses.push({
            name: client.name,
            email: client.email,
            type: client.type,
            timestamp: getTimestamp()
          });
          sent = true;
        } catch (err) {
          attempts++;
          console.log(`🔁 Retry ${attempts} failed for ${client.name}. Retrying in 5s...`);
          await delay(5000);
        }
      }

      if (!sent) {
        console.log(`❌ Giving up on ${client.name} after 5 attempts.`);
      }
    }

    if (retrySuccesses.length) {
      const allEmails = [...successfulEmails, ...retrySuccesses];
      fs.writeFileSync('successful-emails.json', JSON.stringify(allEmails, null, 2));
      console.log('📝 Appended retry successes to successful-emails.json');
    }

    console.log(`\n📊 Summary:
✅ Initial Success: ${successfulEmails.length}
🔁 Retried & Succeeded: ${retrySuccesses.length}
📦 Total Delivered: ${successfulEmails.length + retrySuccesses.length}`);

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  } finally {
    await connection.end();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
};

module.exports = { runEmailMessaging };
