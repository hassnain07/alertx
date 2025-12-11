const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "alertx",
});

// Convert DB to promise-based version
const promiseDB = db.promise();

module.exports = promiseDB;
