const pool = require('../db/connection');

class Employee {
  constructor(firstName, lastName, roleId, managerId) {
    this.first_name = firstName;
    this.last_name = lastName;
    this.role_id = roleId;
    this.manager_id = managerId;
  }

  static getAllEmployees() {
    return pool.query('SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employees AS e LEFT JOIN roles AS r ON e.role_id = r.id LEFT JOIN departments AS d ON r.department_id = d.id LEFT JOIN employees AS m ON e.manager_id = m.id');
  }

  addEmployee() {
    return pool.query('INSERT INTO employees SET ?', this);
  }

  static updateEmployeeRole(employeeId, roleId) {
    return pool.query('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, employeeId]);
  }
}

module.exports = Employee;
