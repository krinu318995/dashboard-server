import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
// require("dotenv").config();
dotenv.config();
const pool = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  namedPlaceholders: true,
});

export default pool;
// module.exports = pool;
