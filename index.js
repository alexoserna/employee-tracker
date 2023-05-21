const inquirer = require('inquirer');
const consoleTable = require('console.table');
const db = require('./config/index');

async function init() {
  const choice = await inquirer.prompt({
    name: 'welcomePrompt',
    type: 'list',
    choices: ['View all Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit'],
    message: 'What would you like to do?'
  });

  switch (choice.welcomePrompt) {
    case 'View all Employees':
      viewAllEmployees();
      break;
    case 'Add Employee':
      addEmployee();
      break;
    case 'Update Employee Role':
      updateEmployeeRole();
      break;
    case 'View All Roles':
      viewAllRoles();
      break;
    case 'Add Role':
      addRole();
      break;
    case 'View All Departments':
      viewAllDepartments();
      break;
    case 'Add Department':
      addDepartment();
      break;
    case 'Exit':
      exitApp();
      break;
  }
}

async function viewAllEmployees() {
  db.query(`
    SELECT 
      employees.id, 
      employees.first_name, 
      employees.last_name, 
      roles.title, 
      department.name, 
      roles.salary, 
      CONCAT(managers.first_name, ' ', managers.last_name) AS manager_name 
    FROM 
      employees 
    JOIN 
      roles ON employees.role_id = roles.role_id
    JOIN 
      department ON roles.department_id = department.department_id
    LEFT JOIN 
      employees AS managers ON employees.manager_id = managers.id;
  `, function (err, results) {
    console.log('\n');
    console.table(results);
    console.log('\n');
    init();
  });
}

async function addEmployee() {
  const addEmployeeQuestions = [
    {
      type: 'input',
      message: 'What is the first name of the employee?',
      name: 'newFirstName',
      validate: validateName
    },
    {
      type: 'input',
      message: 'What is the last name of the employee?',
      name: 'newLastName',
      validate: validateName
    },
    {
      type: 'list',
      message: 'What is the role for the employee?',
      name: 'newEmpRole',
      choices: await roleChoices(),
    },
    {
      type: 'list',
      message: 'Who is their manager?',
      name: 'newEmpManager',
      choices: await managerChoices(),
    }
  ];

  let employeeInfo = await inquirer.prompt(addEmployeeQuestions);

  const selectedManager = employeeInfo.newEmpManager;
  const managerQuery = `
    SELECT 
      id 
    FROM 
      employees 
    WHERE 
      CONCAT(first_name, ' ', last_name) = '${selectedManager}'
  `;

  db.query(managerQuery, (err, managerResults) => {
    if (err) throw err;

    const managerId = managerResults[0].id;

    db.query(
      'INSERT INTO employees SET ?',
      {
        first_name: employeeInfo.newFirstName,
        last_name: employeeInfo.newLastName,
        role_id: employeeInfo.newEmpRole,
        manager_id: managerId
      },
      (err, res) => {
        if (err) throw err;
        console.log('\nEmployee successfully added.\n');
        init();
      }
    );
  });
}

async function roleChoices() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT role_id, title FROM roles';
    db.query(query,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          const choices = results.map((role) => ({
            name: role.title,
            value: role.role_id,
          }));
          resolve(choices);
        }
      });
  });
}

async function departmentChoices() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT department_id, name FROM department';
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const choices = results.map((department) => ({
          name: department.name,
          value: department.department_id,
        }));
        resolve(choices);
      }
    });
  });
}

async function managerChoices() {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
          CONCAT(first_name, ' ', last_name) AS manager_name 
        FROM 
          employees
      `;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const choices = results.map((result) => result.manager_name);
        resolve(choices);
      }
    });
  });
}

async function updateEmployeeRole() {
  const updateEmpRoleQuestions = [
    {
      type: 'input',
      message: "Enter the employee's first name:",
      name: 'empFirstName',
      validate: validateName,
    },
    {
      type: 'input',
      message: "Enter the employee's last name:",
      name: 'empLastName',
      validate: validateName,
    },
    {
      type: 'list',
      message: 'Select the new role for the employee:',
      name: 'newRole',
      choices: await roleChoices(),
    },
  ];

  const employeeInfo = await inquirer.prompt(updateEmpRoleQuestions);

  const updateQuery = `
      UPDATE 
        employees 
      SET 
        role_id = ${employeeInfo.newRole} 
      WHERE 
        first_name = '${employeeInfo.empFirstName}' 
        AND 
        last_name = '${employeeInfo.empLastName}'
    `;

  db.query(updateQuery, (err) => {
    if (err) throw err;
    console.log('\nEmployee role updated successfully.\n');
    init();
  });
}

async function viewAllRoles() {
  const query = 'SELECT title, salary FROM roles';
  db.query(query, (err, results) => {
    console.log('\n');
    console.table(results);
    console.log('\n');
    init();
  });
}

async function addRole() {
  const addRoleQuestions = [
    {
      type: 'input',
      message: 'Enter the title of the new role:',
      name: 'newRoleTitle',
      validate: validateString,
    },
    {
      type: 'input',
      message: 'Enter the salary for the new role:',
      name: 'newRoleSalary',
      validate: validateNumber,
    },
    {
      type: 'list',
      message: 'Select the department for the new role:',
      name: 'newRoleDepartment',
      choices: await departmentChoices(),
    },
  ];

  const roleInfo = await inquirer.prompt(addRoleQuestions);

  const addRoleQuery = `
      INSERT INTO 
        roles (title, salary, department_id) 
      VALUES 
        (
          '${roleInfo.newRoleTitle}', 
          '${roleInfo.newRoleSalary}', 
          '${roleInfo.newRoleDepartment}'
        )
    `;

  db.query(addRoleQuery, (err) => {
    if (err) throw err;
    console.log('\nRole successfully added.\n');
    init();
  });
}

//view all departments function
function viewAllDepartments() {
  db.query(`SELECT * FROM department`, function (err, results) {
    console.log(`\n`)
    console.table(results)
    init();
  })
};

//view all roles function
function viewAllRoles() {
  db.query(`SELECT roles.role_id, roles.title, roles.salary, department.name, department.department_id FROM roles JOIN department ON roles.department_id = department.department_id ORDER BY roles.role_id ASC`, function (err, results) {
    console.log(`\n`);
    console.table(results)
    init();
  })
};

//ADD DEPARTMENT FUNCTION
function addDepartment() {
  inquirer.prompt({
    type: 'input',
    message: 'What is the name of the department?',
    name: 'newDept',
    validate: validateString
  })
    .then((function (res) {
      db.query("INSERT INTO department SET ?",
        {
          name: res.newDept
        })
      console.log(`\n Department successfully entered.\n`);
      init();
    }))
};


//Exit app function
let exitApp = () => {
  process.exit(console.log("\nGoodbye!"));
}

// Input validation

const validateName = (input) => {
  const name = input;
  if (typeof input !== 'string') {
    return 'Please re-enter employee name.';
  }
  if (name === '') {
    return 'Please enter a name.';
  }
  return true;
};

const validateNumber = (input) => {
  const isNum = parseInt(input);
  if (Number.isNaN(isNum)) {
    return 'Please a number.';
  }
  if (isNum === '') {
    return 'Please enter a number.';
  }
  return true;
};

const validateString = (input) => {
  const isString = input;
  if (typeof isString !== 'string') {
    return 'Please re-enter.';
  }
  if (isString === '') {
    return 'Please enter.';
  }
  return true;
};

init();