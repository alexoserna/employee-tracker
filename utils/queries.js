const pool = require('../db/connection');

// Department queries
const getAllDepartments = () => {
  return pool.query('SELECT * FROM departments');
};

const addDepartment = (name) => {
  return pool.query('INSERT INTO departments (name) VALUES (?)', [name]);
};

// Role queries
const getAllRoles = () => {
  return pool.query('SELECT roles.*, departments.name AS department_name FROM roles JOIN departments ON roles.department_id = departments.id');
};

const addRole = (title, salary, departmentId) => {
  return pool.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
};

// Employee queries
const getAllEmployees = () => {
  return pool.query('SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employees AS e LEFT JOIN roles AS r ON e.role_id = r.id LEFT JOIN departments AS d ON r.department_id = d.id LEFT JOIN employees AS m ON e.manager_id = m.id');
};

const addEmployee = (firstName, lastName, roleId, managerId) => {
  return pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
};

const updateEmployeeRole = (employeeId, roleId) => {
  return pool.query('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, employeeId]);
};

module.exports = {
  getAllDepartments,
  addDepartment,
  getAllRoles,
  addRole,
  getAllEmployees,
  addEmployee,
  updateEmployeeRole,
};
