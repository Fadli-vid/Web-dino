import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
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
  queueLimit: 0,
});
