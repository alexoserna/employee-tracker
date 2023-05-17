const mysql = require('mysql2');

const db = mysql.createConnection(
    {
    host: '127.0.0.1',
    user: 'root',
    password: 'GoonsSince16!',
    database: 'emp_db'
    },
    console.log('Connected to emp_db')
)

module.exports = db; 