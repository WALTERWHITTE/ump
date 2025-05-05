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

// Create Product
const createProduct = async () => {
  try {
    const { productName } = await inquirer.prompt([
      { name: 'productName', message: 'Product Name:' },
    ]);

    await connection.query(
      'INSERT INTO products (productName) VALUES (?)',
      [productName]
    );

    console.log('✅ Product added.');
  } catch (err) {
    console.error('❌ Insert failed:', err.message);
  }
};

// Update Product(s)
const updateProduct = async () => {
  try {
    const [products] = await connection.query('SELECT productId, productName FROM products');

    if (!products.length) {
      console.log('⚠️ No products available.');
      return;
    }

    const { selectedProducts } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedProducts',
        message: 'Select products to update:',
        choices: products.map(p => ({
          name: `${p.productName} (${p.productId})`,
          value: p,
        })),
        validate: input => input.length ? true : 'Select at least one product.',
      },
    ]);

    const updatedNames = [];

    for (const product of selectedProducts) {
      const { newName } = await inquirer.prompt([
        {
          name: 'newName',
          message: `Enter new name for "${product.productName}":`,
          validate: input => input.trim() !== '' || 'Name cannot be empty.',
        },
      ]);
      updatedNames.push({ productId: product.productId, productName: newName });
    }

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    for (const { productId, productName } of updatedNames) {
      await conn.query(
        'UPDATE products SET productName = ? WHERE productId = ?',
        [productName, productId]
      );
    }

    await conn.commit();
    conn.release();

    console.log('✅ Selected products updated successfully.');
  } catch (err) {
    console.error('❌ Update failed:', err.message);
  }
};

// Delete Product
const deleteProduct = async () => {
  try {
    const [products] = await connection.query('SELECT productId, productName FROM products');

    if (!products.length) {
      console.log('⚠️ No products to delete.');
      return;
    }

    const { productId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'productId',
        message: 'Select product to delete:',
        choices: products.map(p => ({
          name: `${p.productName} (${p.productId})`,
          value: p.productId,
        })),
      },
    ]);

    // Check if the product is associated with any client
    const [associatedClients] = await connection.query(
      'SELECT clientId FROM clientProducts WHERE productId = ?',
      [productId]
    );

    if (associatedClients.length) {
      // Unlink the product from all clients before deleting
      const { confirmUnlink } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmUnlink',
          message: `This product is associated with clients. Do you want to unlink it from them before deletion?`,
          default: true,
        },
      ]);

      if (confirmUnlink) {
        const conn = await connection.getConnection();
        await conn.beginTransaction();

        // Unlink the product from associated clients
        await conn.query('DELETE FROM clientProducts WHERE productId = ?', [productId]);

        await conn.commit();
        conn.release();
        console.log('✅ Product unlinked from clients.');
      }
    }

    // Delete the product
    await connection.query('DELETE FROM products WHERE productId = ?', [productId]);
    console.log('🗑️ Product deleted.');
  } catch (err) {
    console.error('❌ Delete failed:', err.message);
  }
};

// View Products
const viewProducts = async () => {
  try {
    const [results] = await connection.query('SELECT * FROM products');
    if (results.length === 0) {
      console.log('⚠️ No products found.');
    } else {
      console.table(results);
    }
  } catch (err) {
    console.error('❌ Query failed:', err.message);
  }
};

module.exports = { createProduct, updateProduct, deleteProduct, viewProducts };
