const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'UnifiedMessaging',
});

const getClientDetails = async (clientId) => {
  const [rows] = await connection.query('SELECT * FROM clientDetails WHERE clientId = ?', [clientId]);
  if (!rows.length) throw new Error('Client not found');
  return rows[0];
};

const createClient = async () => {
  const newClient = await inquirer.prompt([
    { name: 'name', message: 'Client Name:' },
    { name: 'email', message: 'Client Email:' },
    { name: 'contact', message: 'Client Contact:' },
    { name: 'dob', message: 'DOB (YYYY-MM-DD):' },
    { name: 'profession', message: 'Profession:' },
    { name: 'gender', message: 'Gender (Male/Female):' },
  ]);

  await connection.query(
    `INSERT INTO clientDetails (clientName, clientEmail, clientContact, clientDob, clientProfession, clientGender, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [newClient.name, newClient.email, newClient.contact, newClient.dob, newClient.profession, newClient.gender]
  );
  console.log('✅ Client added.');
};

const updateClient = async () => {
  const [clients] = await connection.query('SELECT clientId, clientName FROM clientDetails');
  if (!clients.length) return console.log('⚠️ No clients found.');

  const { selectedClientId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedClientId',
      message: 'Select the client you want to update:',
      choices: clients.map(client => ({ name: client.clientName, value: client.clientId })),
    },
  ]);

  const clientDetails = await getClientDetails(selectedClientId);

  const updatedClient = await inquirer.prompt([
    { name: 'clientName', message: 'Client Name:', default: clientDetails.clientName },
    { name: 'clientEmail', message: 'Client Email:', default: clientDetails.clientEmail },
    { name: 'clientContact', message: 'Client Contact:', default: clientDetails.clientContact },
    { name: 'clientDob', message: 'DOB (YYYY-MM-DD):', default: clientDetails.clientDob.toISOString().split('T')[0] },
    { name: 'clientProfession', message: 'Profession:', default: clientDetails.clientProfession },
    { name: 'clientGender', message: 'Gender (Male/Female):', default: clientDetails.clientGender },
  ]);

  await connection.query(
    `UPDATE clientDetails SET clientName = ?, clientEmail = ?, clientContact = ?, clientDob = ?, clientProfession = ?, clientGender = ?, updatedAt = NOW() WHERE clientId = ?`,
    [
      updatedClient.clientName,
      updatedClient.clientEmail,
      updatedClient.clientContact,
      updatedClient.clientDob,
      updatedClient.clientProfession,
      updatedClient.clientGender,
      selectedClientId
    ]
  );

  console.log('✅ Client updated successfully.');
};

const deleteClient = async () => {
  const [clients] = await connection.query('SELECT clientId, clientName FROM clientDetails');
  if (!clients.length) return console.log('⚠️ No clients found.');

  const { selectedClientIds } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedClientIds',
      message: 'Select client(s) to delete:',
      choices: clients.map(client => ({
        name: `${client.clientName} (ID: ${client.clientId})`,
        value: client.clientId,
      })),
      validate: input => input.length ? true : 'Select at least one client to delete.',
    },
  ]);

  for (const clientId of selectedClientIds) {
    await connection.query('DELETE FROM clientDetails WHERE clientId = ?', [clientId]);
  }

  console.log('🗑️ Selected client(s) deleted.');
};


const viewFilteredClients = async () => {
  const { filter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filter',
      message: 'Choose a filter:',
      choices: ['All Clients', 'Only Family Heads', 'Female Clients', 'Clients over 40'],
    },
  ]);

  let query = 'SELECT * FROM clientDetails';
  if (filter === 'Only Family Heads') query += ' WHERE familyHead = 1';
  else if (filter === 'Female Clients') query += ` WHERE clientGender = 'Female'`;
  else if (filter === 'Clients over 40') query += ` WHERE TIMESTAMPDIFF(YEAR, clientDob, CURDATE()) > 40`;

  const [results] = await connection.query(query);
  if (!results.length) console.log('⚠️ No clients found matching this filter.');
  else console.table(results);
};

module.exports = { createClient, updateClient, deleteClient, viewFilteredClients };
