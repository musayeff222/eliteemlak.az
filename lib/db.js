const mysql = require("mysql2/promise");

let pool = null;

function getDbConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "elite_emlak",
  };
}

function getSafeDbInfo() {
  const cfg = getDbConfig();
  return {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    database: cfg.database,
    passwordSet: Boolean(cfg.password),
  };
}

function getPool() {
  if (!pool) {
    const cfg = getDbConfig();
    pool = mysql.createPool({
      ...cfg,
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function ping() {
  const rows = await query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}

module.exports = { getPool, query, ping, getDbConfig, getSafeDbInfo };
