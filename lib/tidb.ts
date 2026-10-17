import mysql, { Pool } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __tidbPool: Pool | undefined;
}

function createTiDBPool(): Pool {
  return mysql.createPool({
    host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: Number(process.env.TIDB_PORT) || 4000,
    user: process.env.TIDB_USER || '2CnfyAiBNhfahTF.root',
    password: process.env.TIDB_PASSWORD || 'uUMomkpG8gokIVuM',
    database: process.env.TIDB_DATABASE || 'wikidino',
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
