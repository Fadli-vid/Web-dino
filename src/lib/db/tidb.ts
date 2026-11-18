import mysql, { Pool } from 'mysql2/promise';

declare global {
  var __tidbPool: Pool | undefined;
}

function createTiDBPool(): Pool {
  const host = process.env.TIDB_HOST?.trim();
  const user = process.env.TIDB_USER?.trim();
  const password = process.env.TIDB_PASSWORD;

  if (!host || !user || !password) {
    throw new Error(
      'Missing TiDB credentials. Set TIDB_HOST, TIDB_USER, and TIDB_PASSWORD in .env.'
    );
  }

  return mysql.createPool({
    host,
    port: Number(process.env.TIDB_PORT) || 4000,
    user,
    password,
    database: process.env.TIDB_DATABASE?.trim() || 'wikidino',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    queueLimit: 0,
  });
}

// Preserve single pool instance across Next.js HMR reloads in development
export const dbPool: Pool = globalThis.__tidbPool ?? createTiDBPool();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__tidbPool = dbPool;
}
