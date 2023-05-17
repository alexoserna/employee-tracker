const inquirer = require('inquirer');
const consoleTable = require('console.table');
const Department = require('./models/department');
const Role = require('./models/role');
const Employee = require('./models/employee');

const express = require('express');
const router = express.Router();
const db = require('./queries');

// Departments Routes
router.get('/departments', db.getAllDepartments);
router.post('/departments', db.addDepartment);

// Roles Routes
router.get('/roles', db.getAllRoles);
router.post('/roles', db.addRole);

// Employees Routes
router.get('/employees', db.getAllEmployees);
router.post('/employees', db.addEmployee);
router.put('/employees/:id', db.updateEmployee);

module.exports = router;


// Function to prompt the user for the action to perform
const promptUserAction = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    },
  ]);
};

// Function to handle the selected action
const handleAction = async (action) => {
  switch (action) {
    case 'View all departments':
      await viewAllDepartments();
      break;
    case 'View all roles':
      await viewAllRoles();
      break;
    case 'View all employees':
      await viewAllEmployees();
      break;
    case 'Add a department':
      await addNewDepartment();
      break;
    case 'Add a role':
      await addNewRole();
      break;
    case 'Add an employee':
      await addNewEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRolePrompt();
      break;
    case 'Exit':
      console.log('Goodbye!');
      process.exit();
  }
};

// Function to view all departments
const viewAllDepartments = async () => {
  try {
    const department = new Department();
    const departments = await department.getAllDepartments();
    console.table(departments);
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to view all roles
const viewAllRoles = async () => {
  try {
    const role = new Role();
    const roles = await role.getAllRoles();
    console.table(roles);
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to view all employees
const viewAllEmployees = async () => {
  try {
    const employee = new Employee();
    const employees = await employee.getAllEmployees();
    console.table(employees);
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to prompt for adding a new department
const addNewDepartment = async () => {
  try {
    const { departmentName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
      },
    ]);

    const department = new Department(departmentName);
    await department.addDepartment();
    console.log('Department added successfully!');
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to prompt for adding a new role
const addNewRole = async () => {
  try {
    // Retrieve department information for role creation
    const department = new Department();
    const departments = await department.getAllDepartments();

    const { title, salary, departmentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the role:',
      },
      {
        type: 'number',
        name: 'salary',
        message: 'Enter the salary for the role:',
      },
      {

        type: 'list',
        name: 'departmentId',
        message: 'Select the department for the role:',
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      }]);

    const role = new Role(title, salary, departmentId);
    await role.addRole();
    console.log('Role added successfully!');
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to prompt for adding a new employee
const addNewEmployee = async () => {
  try {
    // Retrieve role and manager information for employee creation
    const role = new Role();
    const roles = await role.getAllRoles();

    const employee = new Employee();

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Enter the employee's first name:",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Enter the employee's last name:",
      },
      {
        type: 'list',
        name: 'roleId',
        message: "Select the employee's role:",
        choices: roles.map((role) => ({ name: role.title, value: role.id })),
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Select the employee's manager:",
        choices: [{ name: 'None', value: null }].concat(
          await employee.getAllEmployees()
        ),
      },
    ]);

    await employee.addEmployee(firstName, lastName, roleId, managerId);
    console.log('Employee added successfully!');
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to prompt for updating an employee's role
const updateEmployeeRolePrompt = async () => {
  try {
    const employee = new Employee();
    const employees = await employee.getAllEmployees();

    const { employeeId, roleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employees.map((employee) => ({
          name: `${employee.firstName} ${employee.lastName}`,
          value: employee.id,
        })),
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the new role for the employee:',
        choices: async () => {
          const role = new Role();
          const roles = await role.getAllRoles();
          return roles.map((role) => ({ name: role.title, value: role.id }));
        },
      },
    ]);

    await employee.updateEmployeeRole(employeeId, roleId);
    console.log('Employee role updated successfully!');
    promptUserActionLoop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

// Function to prompt the user for the next action
const promptUserActionLoop = () => {
  promptUserAction()
    .then((answers) => handleAction(answers.action))
    .catch((error) => console.error('Error occurred:', error));
};

// Start the application
console.log('Employee Management System');
promptUserActionLoop();
