const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'UnifiedMessaging',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create multiple Client-Product associations
const createClientProduct = async () => {
  try {
    const [clients] = await connection.query('SELECT clientId, clientName FROM clientDetails');
    const [products] = await connection.query('SELECT productId, productName FROM products');

    if (!clients.length || !products.length) {
      console.log('⚠️ No clients or products available.');
      return;
    }

    const { clientId, productChoices } = await inquirer.prompt([
      {
        type: 'list',
        name: 'clientId',
        message: 'Select a client:',
        choices: clients.map(c => ({ name: `${c.clientName} (${c.clientId})`, value: c.clientId })),
      },
      {
        type: 'checkbox',
        name: 'productChoices',
        message: 'Select products to associate:',
        choices: products.map(p => ({ name: `${p.productName} (${p.productId})`, value: p.productId })),
        validate: input => input.length ? true : 'Select at least one product.',
      },
    ]);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    for (const productId of productChoices) {
      await conn.query(
        `INSERT INTO clientProducts (clientId, productId, createdAt, updatedAt)
         VALUES (?, ?, NOW(), NOW())`,
        [clientId, productId]
      );
    }

    await conn.commit();
    conn.release();
    console.log('✅ Client-Product associations created.');
  } catch (err) {
    console.error('❌ Insert failed:', err.message);
  }
};

// Update client’s product associations
const updateClientProduct = async () => {
  try {
    const [clients] = await connection.query('SELECT clientId, clientName FROM clientDetails');
    if (!clients.length) return console.log('⚠️ No clients found.');

    const { clientId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'clientId',
        message: 'Select a client to update their product associations:',
        choices: clients.map(c => ({ name: `${c.clientName} (${c.clientId})`, value: c.clientId })),
      },
    ]);

    const [products] = await connection.query('SELECT productId, productName FROM products');
    const [currentAssociations] = await connection.query(
      'SELECT productId FROM clientProducts WHERE clientId = ?',
      [clientId]
    );

    const currentProductIds = currentAssociations.map(p => p.productId);

    const { updatedProductChoices } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'updatedProductChoices',
        message: 'Select new products for the client:',
        choices: products.map(p => ({
          name: `${p.productName} (${p.productId})`,
          value: p.productId,
          checked: currentProductIds.includes(p.productId),
        })),
        validate: input => input.length ? true : 'Select at least one product.',
      },
    ]);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    // Clear previous associations
    await conn.query('DELETE FROM clientProducts WHERE clientId = ?', [clientId]);

    // Insert new ones
    for (const productId of updatedProductChoices) {
      await conn.query(
        `INSERT INTO clientProducts (clientId, productId, createdAt, updatedAt)
         VALUES (?, ?, NOW(), NOW())`,
        [clientId, productId]
      );
    }

    await conn.commit();
    conn.release();
    console.log('✅ Client-Product associations updated.');
  } catch (err) {
    console.error('❌ Update failed:', err.message);
  }
};

// Delete one Client-Product association
const deleteClientProduct = async () => {
  try {
    const [associations] = await connection.query(
      `SELECT cp.clientId, c.clientName, cp.productId, p.productName
       FROM clientProducts cp
       JOIN clientDetails c ON cp.clientId = c.clientId
       JOIN products p ON cp.productId = p.productId`
    );

    if (!associations.length) return console.log('⚠️ No associations to delete.');

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select an association to delete:',
        choices: associations.map(a => ({
          name: `${a.clientName} ↔ ${a.productName}`,
          value: { clientId: a.clientId, productId: a.productId },
        })),
      },
    ]);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    // Delete the client-product association
    await conn.query(
      'DELETE FROM clientProducts WHERE clientId = ? AND productId = ?',
      [selected.clientId, selected.productId]
    );

    // Optionally, delete or update related records in other tables if necessary
    // (Add logic for other relationships if required)

    await conn.commit();
    conn.release();
    console.log('🗑️ Client-Product association deleted.');
  } catch (err) {
    console.error('❌ Delete failed:', err.message);
  }
};


// View all Client-Product associations
const viewClientProducts = async () => {
  try {
    const [results] = await connection.query(
      `SELECT cp.clientId, c.clientName, cp.productId, p.productName, cp.createdAt
       FROM clientProducts cp
       JOIN clientDetails c ON cp.clientId = c.clientId
       JOIN products p ON cp.productId = p.productId`
    );

    if (!results.length) {
      console.log('⚠️ No associations found.');
    } else {
      console.table(results);
    }
  } catch (err) {
    console.error('❌ Query failed:', err.message);
  }
};

module.exports = {
  createClientProduct,
  updateClientProduct,
  deleteClientProduct,
  viewClientProducts,
};
