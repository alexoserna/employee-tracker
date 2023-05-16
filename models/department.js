const pool = require('../db/connection');

class Department {
  constructor(name) {
    this.name = name;
  }

  static getAllDepartments() {
    return pool.query('SELECT * FROM departments');
  }

  addDepartment() {
    return pool.query('INSERT INTO departments SET ?', this);
  }
}

module.exports = Department;
