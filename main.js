const inquirer = require('inquirer');
const { databaseOperationsMenu } = require('./databaseOperations');
const { runEmailMessaging } = require('./mailMessaging');

const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: ['Mail Messaging', 'Database Operations', 'Exit'],
    },
  ]);

  if (action === 'Mail Messaging') {
    await runEmailMessaging();
    await mainMenu(); // Repeat the main menu after finishing email messaging
  } else if (action === 'Database Operations') {
    await databaseOperationsMenu(mainMenu); // Pass mainMenu as the previousMenu argument
  } else {
    console.log('Goodbye!');  // Print exit message
    process.exit();  // Exit the program
  }
};

mainMenu();
