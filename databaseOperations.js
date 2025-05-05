const inquirer = require('inquirer');

const {
  createClient,
  updateClient,
  deleteClient,
  viewFilteredClients,
} = require('./operations/clientDetails');

const {
  createFamily,
  updateFamily,
  deleteFamily,
  viewFamilies,
} = require('./operations/family');

const {
  createClientProduct,
  updateClientProduct,
  deleteClientProduct,
  viewClientProducts,
} = require('./operations/clientProducts');

const {
  createProduct,
  updateProduct,
  deleteProduct,
  viewProducts,
} = require('./operations/products');

// Database operations menu
const databaseOperationsMenu = async (previousMenu) => {
  const { table } = await inquirer.prompt([
    {
      type: 'list',
      name: 'table',
      message: 'Select a table to operate on:',
      choices: ['clientDetails', 'family', 'clientProducts', 'products', 'Back to Main'],
    },
  ]);

  if (table === 'Back to Main') {
    // Go back to the main menu
    return previousMenu();
  }

  const operations = {
    clientDetails: [
      ['Create Client', createClient],
      ['Update Client', updateClient],
      ['Delete Client', deleteClient],
      ['View Filtered Clients', viewFilteredClients],
    ],
    family: [
      ['Create Family', createFamily],
      ['Update Family', updateFamily],
      ['Delete Family', deleteFamily],
      ['View Families', viewFamilies],
    ],
    clientProducts: [
      ['Create Client-Product', createClientProduct],
      ['Delete Client-Product', deleteClientProduct],
      ['Update Client-Product', updateClientProduct],
      ['View Client-Products', viewClientProducts],
    ],
    products: [
      ['Create Product', createProduct],
      ['Update Product', updateProduct],
      ['Delete Product', deleteProduct],
      ['View Products', viewProducts],
    ],
  };

  const choices = operations[table].map(([label]) => label).concat('Back');

  const { op } = await inquirer.prompt([
    {
      type: 'list',
      name: 'op',
      message: `Select an operation for ${table}:`,
      choices,
    },
  ]);

  if (op === 'Back') {
    // Return to the previous menu
    return databaseOperationsMenu(previousMenu);
  }

  const action = operations[table].find(([label]) => label === op);
  if (action) await action[1]();

  // Keep the flow in the current menu until the user presses "Back"
  await databaseOperationsMenu(previousMenu);
};

module.exports = { databaseOperationsMenu };
