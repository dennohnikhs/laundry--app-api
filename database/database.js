const mysql = require("mysql");
const { makeDb } = require("mysql-async-simple");

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "laundry",
});

const db = makeDb();

async function executeQuery(sql, fields) {
  try {
    await db.connect(connection);
  } catch (e) {
    console.log("KOMOCHE KOIMECH SETANI");
  }

  returnObj = null;

  try {
    returnObj = await db.query(connection, sql, fields);
  } catch (e) {
    // handle exception
  } finally {
  }

  return returnObj;
}

module.exports = {
  connection,
  executeQuery,
};
