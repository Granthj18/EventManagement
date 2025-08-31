const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",         
  password: "",        
  database: "eventmanagement_users",
  port: 3307           
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

module.exports = db;
