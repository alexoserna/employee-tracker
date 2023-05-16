const pool = require('../db/connection');

class Role {
  constructor(title, salary, departmentId) {
    this.title = title;
    this.salary = salary;
    this.department_id = departmentId;
  }

  static getAllRoles() {
    return pool.query('SELECT roles.*, departments.name AS department_name FROM roles JOIN departments ON roles.department_id = departments.id');
  }

  addRole() {
    return pool.query('INSERT INTO roles SET ?', this);
  }
}

module.exports = Role;
