const mysql = require('mysql2');

config = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    keepAliveInitialDelay: 10000,
  enableKeepAlive: true, 
}

// MySQL Database Connection Pool
const db = mysql.createPool(config);

// Test MySQL Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
    connection.release();
});

module.exports = db;