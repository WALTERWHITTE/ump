const inquirer = require('inquirer');

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

  const baseSelect = `
    SELECT 
      cd.clientName, 
      cd.clientEmail, 
      GROUP_CONCAT(p.productName SEPARATOR ', ') AS clientProducts,
      cd.clientGender, 
      cd.clientDob AS clientDOB
    FROM clientDetails cd
    LEFT JOIN clientProducts cp ON cd.clientId = cp.clientId
    LEFT JOIN products p ON cp.productId = p.productId
  `;

  let query = '';

  switch (filter) {
    case 'Only Family Heads':
      query = baseSelect + `WHERE cd.familyHead = 1 GROUP BY cd.clientId`;
      break;
    case 'Clients older than 40':
      query = baseSelect + `WHERE TIMESTAMPDIFF(YEAR, cd.clientDob, CURDATE()) > 40 GROUP BY cd.clientId`;
      break;
    case 'Clients using Loan products':
      query = baseSelect + `
        WHERE cp.productId IN (SELECT productId FROM products WHERE productName LIKE '%Loan%')
        GROUP BY cd.clientId`;
      break;
    case 'Family Heads over 40 using Loans':
      query = baseSelect + `
        WHERE cd.familyHead = 1 
          AND TIMESTAMPDIFF(YEAR, cd.clientDob, CURDATE()) > 40
          AND cp.productId IN (SELECT productId FROM products WHERE productName LIKE '%Loan%')
        GROUP BY cd.clientId`;
      break;
    case 'Clients celebrating their birthday today':
      query = baseSelect + `
        WHERE DAY(cd.clientDob) = DAY(CURDATE()) AND MONTH(cd.clientDob) = MONTH(CURDATE())
        GROUP BY cd.clientId`;
      break;
    case 'Female Clients for Digital Gold Investment':
      query = baseSelect + `WHERE cd.clientGender = 'Female' GROUP BY cd.clientId`;
      break;
    default:
      query = baseSelect + `GROUP BY cd.clientId`;
      break;
  }

  return { query, filter }; 
};

module.exports = { getFilterQuery };
