const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'UnifiedMessaging',
});

// Fetch all clients (optionally filter unassigned only)
const fetchClients = async (filterUnassigned = false) => {
  const condition = filterUnassigned ? 'WHERE familyId IS NULL' : '';
  const [rows] = await connection.query(`SELECT clientId, clientName, familyId FROM clientDetails ${condition}`);
  return rows.map(row => ({
    name: `${row.clientName} (${row.clientId})`,
    value: row.clientId,
    familyId: row.familyId,
  }));
};

// Create Family
const createFamily = async () => {
  try {
    const clients = await fetchClients(true); // Only unassigned
    if (!clients.length) return console.log('⚠️ No unassigned clients found. Create clients first.');

    const answers = await inquirer.prompt([
      { name: 'familyName', message: 'Family Name:' },
      { name: 'familyAddress', message: 'Family Address:' },
      {
        type: 'checkbox',
        name: 'clientChoices',
        message: 'Select clients to include in this family:',
        choices: clients,
        validate: input => input.length ? true : 'You must select at least one client.',
      },
      {
        type: 'list',
        name: 'familyHeadId',
        message: 'Select family head:',
        choices: (answers) => clients.filter(c => answers.clientChoices.includes(c.value)),
      },
    ]);

    const { familyName, familyAddress, clientChoices, familyHeadId } = answers;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO family (familyName, familyAddress, familyHeadId, totalMembers, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [familyName, familyAddress, familyHeadId, clientChoices.length]
    );
    const familyId = result.insertId;

    for (const clientId of clientChoices) {
      const isHead = clientId === familyHeadId ? 1 : 0;
      await conn.query(
        `UPDATE clientDetails SET familyId = ?, familyHead = ?, updatedAt = NOW() WHERE clientId = ?`,
        [familyId, isHead, clientId]
      );
    }

    await conn.commit();
    conn.release();
    console.log('✅ Family created and clients updated.');
  } catch (err) {
    console.error('❌ An error occurred:', err.message);
  }
};

// View all families
const viewFamilies = async () => {
  const [results] = await connection.query('SELECT * FROM family');
  console.table(results);
};

// Update Family
const updateFamily = async () => {
  try {
    const [families] = await connection.query('SELECT familyId, familyName FROM family');
    if (!families.length) return console.log('⚠️ No families available.');

    const { selectedFamilyId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFamilyId',
        message: 'Select the family to update:',
        choices: families.map(f => ({ name: `${f.familyName} (${f.familyId})`, value: f.familyId })),
      },
    ]);

    const [familyData] = await connection.query('SELECT * FROM family WHERE familyId = ?', [selectedFamilyId]);
    const family = familyData[0];

    const allClients = await fetchClients();
    const currentMembers = allClients.filter(c => c.familyId === selectedFamilyId);
    const availableClients = allClients.filter(c => c.familyId === null || c.familyId === selectedFamilyId);

    if (!availableClients.length) {
      return console.log('⚠️ No clients available to assign.');
    }

    const { familyName, familyAddress } = await inquirer.prompt([
      { name: 'familyName', message: 'Family Name:', default: family.familyName },
      { name: 'familyAddress', message: 'Family Address:', default: family.familyAddress },
    ]);

    const { clientChoices } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'clientChoices',
        message: 'Select members for this family:',
        choices: availableClients.map(c => ({
          name: `${c.name}`,
          value: c.value,
          checked: currentMembers.some(m => m.value === c.value),
        })),
        validate: input => input.length ? true : 'Select at least one member.',
      },
    ]);

    const { familyHeadId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'familyHeadId',
        message: 'Select the new family head:',
        choices: availableClients.filter(c => clientChoices.includes(c.value)),
      },
    ]);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE family SET familyName = ?, familyAddress = ?, familyHeadId = ?, totalMembers = ?, updatedAt = NOW() WHERE familyId = ?`,
      [familyName, familyAddress, familyHeadId, clientChoices.length, selectedFamilyId]
    );

    await conn.query(
      `UPDATE clientDetails SET familyId = NULL, familyHead = 0 WHERE familyId = ?`,
      [selectedFamilyId]
    );

    for (const clientId of clientChoices) {
      const isHead = clientId === familyHeadId ? 1 : 0;
      await conn.query(
        `UPDATE clientDetails SET familyId = ?, familyHead = ?, updatedAt = NOW() WHERE clientId = ?`,
        [selectedFamilyId, isHead, clientId]
      );
    }

    await conn.commit();
    conn.release();
    console.log('✅ Family updated successfully.');
  } catch (err) {
    console.error('❌ Error updating family:', err.message);
  }
};

// Delete Family
// Delete Family
const deleteFamily = async () => {
  try {
    const [families] = await connection.query('SELECT familyId, familyName FROM family');
    if (!families.length) return console.log('⚠️ No families available.');

    const { selectedFamilyIds } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFamilyIds',
        message: 'Select families to delete:',
        choices: families.map(f => ({
          name: `${f.familyName} (${f.familyId})`,
          value: f.familyId,
        })),
        validate: input => input.length ? true : 'Select at least one family.',
      },
    ]);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    for (const familyId of selectedFamilyIds) {
      // Remove client references to avoid FK constraint errors
      await conn.query(
        `UPDATE clientDetails SET familyId = NULL, familyHead = 0 WHERE familyId = ?`,
        [familyId]
      );

      // Delete the family
      await conn.query(`DELETE FROM family WHERE familyId = ?`, [familyId]);
    }

    await conn.commit();
    conn.release();

    console.log('🗑️ Selected families deleted successfully.');
  } catch (err) {
    console.error('❌ Error deleting family:', err.message);
  }
};


module.exports = { createFamily, viewFamilies, updateFamily, deleteFamily };
