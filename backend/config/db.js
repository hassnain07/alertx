const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "alertx",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to DB");
});

module.exports = db;
