import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
  host: process.env.TIDB_HOST || process.env.TIDB_HOST || '',
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER || process.env.TIDB_USER || '',
  password: process.env.TIDB_PASSWORD || process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'wikidino',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
