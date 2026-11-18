const mysql = require('mysql2/promise');

/**
 * Curated chronological, paleobiogeographic, and locomotor metadata
 * verified against International Commission on Stratigraphy (ICS) stages,
 * formation radiometric dating (Morrison, Hell Creek, Dinosaur Park,
 * Nemegt, Djadochta, Yixian, Ischigualasto, Kem Kem, Elrhaz, etc.),
 * and peer-reviewed paleobiological consensus.
 */
const DINOSAUR_V2_METADATA = {
  acrocanthosaurus: { sub_period: 'Early Cretaceous', mya_start: 115.0, mya_end: 110.0, continent: 'North America', locomotion: 'Bipedal' },
  alamosaurus: { sub_period: 'Late Cretaceous', mya_start: 70.0, mya_end: 66.0, continent: 'North America', locomotion: 'Quadrupedal' },
  albertosaurus: { sub_period: 'Late Cretaceous', mya_start: 73.0, mya_end: 68.0, continent: 'North America', locomotion: 'Bipedal' },
  allosaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Bipedal' },
  amargasaurus: { sub_period: 'Early Cretaceous', mya_start: 129.0, mya_end: 122.0, continent: 'South America', locomotion: 'Quadrupedal' },
  ankylosaurus: { sub_period: 'Late Cretaceous', mya_start: 68.0, mya_end: 66.0, continent: 'North America', locomotion: 'Quadrupedal' },
  apatosaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  argentinosaurus: { sub_period: 'Late Cretaceous', mya_start: 96.0, mya_end: 92.0, continent: 'South America', locomotion: 'Quadrupedal' },
  barosaurus: { sub_period: 'Late Jurassic', mya_start: 155.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  baryonyx: { sub_period: 'Early Cretaceous', mya_start: 130.0, mya_end: 125.0, continent: 'Europe', locomotion: 'Bipedal' },
  brachiosaurus: { sub_period: 'Late Jurassic', mya_start: 155.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  brachylophosaurus: { sub_period: 'Late Cretaceous', mya_start: 78.5, mya_end: 76.5, continent: 'North America', locomotion: 'Facultative Biped' },
  brontosaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  camarasaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  carcharodontosaurus: { sub_period: 'Late Cretaceous', mya_start: 100.0, mya_end: 94.0, continent: 'Africa', locomotion: 'Bipedal' },
  carnotaurus: { sub_period: 'Late Cretaceous', mya_start: 72.0, mya_end: 66.0, continent: 'South America', locomotion: 'Bipedal' },
  caudipteryx: { sub_period: 'Early Cretaceous', mya_start: 125.0, mya_end: 122.0, continent: 'Asia', locomotion: 'Bipedal' },
  centrosaurus: { sub_period: 'Late Cretaceous', mya_start: 76.5, mya_end: 75.5, continent: 'North America', locomotion: 'Quadrupedal' },
  ceratosaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Bipedal' },
  chasmosaurus: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 74.0, continent: 'North America', locomotion: 'Quadrupedal' },
  coelophysis: { sub_period: 'Late Triassic', mya_start: 215.0, mya_end: 201.5, continent: 'North America', locomotion: 'Bipedal' },
  compsognathus: { sub_period: 'Late Jurassic', mya_start: 151.0, mya_end: 145.0, continent: 'Europe', locomotion: 'Bipedal' },
  concavenator: { sub_period: 'Early Cretaceous', mya_start: 130.0, mya_end: 125.0, continent: 'Europe', locomotion: 'Bipedal' },
  corythosaurus: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 75.5, continent: 'North America', locomotion: 'Facultative Biped' },
  daspletosaurus: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 74.4, continent: 'North America', locomotion: 'Bipedal' },
  deinonychus: { sub_period: 'Early Cretaceous', mya_start: 115.0, mya_end: 108.0, continent: 'North America', locomotion: 'Bipedal' },
  dilophosaurus: { sub_period: 'Early Jurassic', mya_start: 193.0, mya_end: 183.0, continent: 'North America', locomotion: 'Bipedal' },
  diplodocus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  dreadnoughtus: { sub_period: 'Late Cretaceous', mya_start: 76.0, mya_end: 70.0, continent: 'South America', locomotion: 'Quadrupedal' },
  edmontosaurus: { sub_period: 'Late Cretaceous', mya_start: 73.0, mya_end: 66.0, continent: 'North America', locomotion: 'Facultative Biped' },
  eoraptor: { sub_period: 'Late Triassic', mya_start: 231.4, mya_end: 228.9, continent: 'South America', locomotion: 'Bipedal' },
  euoplocephalus: { sub_period: 'Late Cretaceous', mya_start: 76.5, mya_end: 75.5, continent: 'North America', locomotion: 'Quadrupedal' },
  gallimimus: { sub_period: 'Late Cretaceous', mya_start: 71.0, mya_end: 66.0, continent: 'Asia', locomotion: 'Bipedal' },
  giganotosaurus: { sub_period: 'Late Cretaceous', mya_start: 100.0, mya_end: 97.0, continent: 'South America', locomotion: 'Bipedal' },
  gorgosaurus: { sub_period: 'Late Cretaceous', mya_start: 76.5, mya_end: 73.0, continent: 'North America', locomotion: 'Bipedal' },
  gryposaurus: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 74.5, continent: 'North America', locomotion: 'Facultative Biped' },
  herrerasaurus: { sub_period: 'Late Triassic', mya_start: 231.4, mya_end: 228.9, continent: 'South America', locomotion: 'Bipedal' },
  iguanodon: { sub_period: 'Early Cretaceous', mya_start: 126.0, mya_end: 122.0, continent: 'Europe', locomotion: 'Facultative Biped' },
  kentrosaurus: { sub_period: 'Late Jurassic', mya_start: 155.0, mya_end: 148.0, continent: 'Africa', locomotion: 'Quadrupedal' },
  lambeosaurus: { sub_period: 'Late Cretaceous', mya_start: 76.5, mya_end: 74.5, continent: 'North America', locomotion: 'Facultative Biped' },
  maiasaura: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 75.5, continent: 'North America', locomotion: 'Facultative Biped' },
  majungasaurus: { sub_period: 'Late Cretaceous', mya_start: 70.0, mya_end: 66.0, continent: 'Africa', locomotion: 'Bipedal' },
  mamenchisaurus: { sub_period: 'Late Jurassic', mya_start: 161.0, mya_end: 155.0, continent: 'Asia', locomotion: 'Quadrupedal' },
  mapusaurus: { sub_period: 'Late Cretaceous', mya_start: 97.0, mya_end: 93.0, continent: 'South America', locomotion: 'Bipedal' },
  masiakasaurus: { sub_period: 'Late Cretaceous', mya_start: 70.0, mya_end: 66.0, continent: 'Africa', locomotion: 'Bipedal' },
  megalosaurus: { sub_period: 'Middle Jurassic', mya_start: 167.0, mya_end: 164.0, continent: 'Europe', locomotion: 'Bipedal' },
  microraptor: { sub_period: 'Early Cretaceous', mya_start: 125.0, mya_end: 120.0, continent: 'Asia', locomotion: 'Bipedal' },
  mononykus: { sub_period: 'Late Cretaceous', mya_start: 71.0, mya_end: 66.0, continent: 'Asia', locomotion: 'Bipedal' },
  muttaburrasaurus: { sub_period: 'Early Cretaceous', mya_start: 105.0, mya_end: 100.0, continent: 'Australia', locomotion: 'Facultative Biped' },
  nigersaurus: { sub_period: 'Early Cretaceous', mya_start: 115.0, mya_end: 105.0, continent: 'Africa', locomotion: 'Quadrupedal' },
  nodosaurus: { sub_period: 'Late Cretaceous', mya_start: 99.0, mya_end: 89.0, continent: 'North America', locomotion: 'Quadrupedal' },
  ouranosaurus: { sub_period: 'Early Cretaceous', mya_start: 115.0, mya_end: 112.0, continent: 'Africa', locomotion: 'Facultative Biped' },
  oviraptor: { sub_period: 'Late Cretaceous', mya_start: 75.0, mya_end: 71.0, continent: 'Asia', locomotion: 'Bipedal' },
  pachycephalosaurus: { sub_period: 'Late Cretaceous', mya_start: 70.0, mya_end: 66.0, continent: 'North America', locomotion: 'Bipedal' },
  pachyrhinosaurus: { sub_period: 'Late Cretaceous', mya_start: 73.5, mya_end: 72.5, continent: 'North America', locomotion: 'Quadrupedal' },
  parasaurolophus: { sub_period: 'Late Cretaceous', mya_start: 76.5, mya_end: 73.0, continent: 'North America', locomotion: 'Facultative Biped' },
  patagotitan: { sub_period: 'Early Cretaceous', mya_start: 102.0, mya_end: 100.5, continent: 'South America', locomotion: 'Quadrupedal' },
  plateosaurus: { sub_period: 'Late Triassic', mya_start: 227.0, mya_end: 204.0, continent: 'Europe', locomotion: 'Bipedal' },
  protoceratops: { sub_period: 'Late Cretaceous', mya_start: 75.0, mya_end: 71.0, continent: 'Asia', locomotion: 'Quadrupedal' },
  psittacosaurus: { sub_period: 'Early Cretaceous', mya_start: 126.0, mya_end: 105.0, continent: 'Asia', locomotion: 'Bipedal' },
  saurolophus: { sub_period: 'Late Cretaceous', mya_start: 71.5, mya_end: 66.0, continent: 'North America, Asia', locomotion: 'Facultative Biped' },
  sauropelta: { sub_period: 'Early Cretaceous', mya_start: 115.0, mya_end: 108.0, continent: 'North America', locomotion: 'Quadrupedal' },
  sinosauropteryx: { sub_period: 'Early Cretaceous', mya_start: 125.0, mya_end: 122.0, continent: 'Asia', locomotion: 'Bipedal' },
  spinosaurus: { sub_period: 'Late Cretaceous', mya_start: 100.0, mya_end: 94.0, continent: 'Africa', locomotion: 'Bipedal' },
  stegosaurus: { sub_period: 'Late Jurassic', mya_start: 157.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  struthiomimus: { sub_period: 'Late Cretaceous', mya_start: 77.0, mya_end: 68.0, continent: 'North America', locomotion: 'Bipedal' },
  styracosaurus: { sub_period: 'Late Cretaceous', mya_start: 75.5, mya_end: 74.5, continent: 'North America', locomotion: 'Quadrupedal' },
  supersaurus: { sub_period: 'Late Jurassic', mya_start: 155.0, mya_end: 148.0, continent: 'North America', locomotion: 'Quadrupedal' },
  tarbosaurus: { sub_period: 'Late Cretaceous', mya_start: 71.0, mya_end: 66.0, continent: 'Asia', locomotion: 'Bipedal' },
  therizinosaurus: { sub_period: 'Late Cretaceous', mya_start: 71.0, mya_end: 66.0, continent: 'Asia', locomotion: 'Bipedal' },
  torosaurus: { sub_period: 'Late Cretaceous', mya_start: 68.0, mya_end: 66.0, continent: 'North America', locomotion: 'Quadrupedal' },
  torvosaurus: { sub_period: 'Late Jurassic', mya_start: 155.0, mya_end: 148.0, continent: 'North America', locomotion: 'Bipedal' },
  triceratops: { sub_period: 'Late Cretaceous', mya_start: 68.0, mya_end: 66.0, continent: 'North America', locomotion: 'Quadrupedal' },
  troodon: { sub_period: 'Late Cretaceous', mya_start: 77.5, mya_end: 75.0, continent: 'North America', locomotion: 'Bipedal' },
  tuojiangosaurus: { sub_period: 'Late Jurassic', mya_start: 161.0, mya_end: 155.0, continent: 'Asia', locomotion: 'Quadrupedal' },
  'tyrannosaurus-rex': { sub_period: 'Late Cretaceous', mya_start: 69.0, mya_end: 66.0, continent: 'North America', locomotion: 'Bipedal' },
  utahraptor: { sub_period: 'Early Cretaceous', mya_start: 139.0, mya_end: 134.0, continent: 'North America', locomotion: 'Bipedal' },
  velociraptor: { sub_period: 'Late Cretaceous', mya_start: 75.0, mya_end: 71.0, continent: 'Asia', locomotion: 'Bipedal' },
  yutyrannus: { sub_period: 'Early Cretaceous', mya_start: 126.0, mya_end: 122.0, continent: 'Asia', locomotion: 'Bipedal' },
  zuul: { sub_period: 'Late Cretaceous', mya_start: 75.5, mya_end: 75.0, continent: 'North America', locomotion: 'Quadrupedal' },
};

async function ensureColumn(connection, tableName, columnName, definition) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  if (rows.length === 0) {
    console.log(`Adding column ${tableName}.${columnName}...`);
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
  } else {
    console.log(`Column ${tableName}.${columnName} already exists.`);
  }
}

async function ensureIndex(connection, tableName, indexName, columnsSql) {
  const [rows] = await connection.query(
    `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tableName, indexName]
  );
  if (rows.length === 0) {
    console.log(`Creating index ${indexName} on ${tableName}...`);
    await connection.query(`CREATE INDEX \`${indexName}\` ON \`${tableName}\` (${columnsSql})`);
  } else {
    console.log(`Index ${indexName} on ${tableName} already exists.`);
  }
}

async function migrateV2() {
  console.log('--- Starting Non-Destructive TiDB V2 Schema Migration ---');

  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile();
    } catch {
      // Allow pre-injected environment variables when .env file is absent
    }
  }

  const host = process.env.TIDB_HOST?.trim();
  const user = process.env.TIDB_USER?.trim();
  const password = process.env.TIDB_PASSWORD;
  const database = process.env.TIDB_DATABASE?.trim() || 'wikidino';

  if (!host || !user || !password) {
    throw new Error(
      'Missing TiDB credentials. Set TIDB_HOST, TIDB_USER, and TIDB_PASSWORD in .env.'
    );
  }

  const connection = await mysql.createConnection({
    host,
    port: Number(process.env.TIDB_PORT) || 4000,
    user,
    password,
    database,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
  });

  try {
    await ensureColumn(connection, 'dinosaurs', 'sub_period', 'VARCHAR(60) DEFAULT NULL');
    await ensureColumn(connection, 'dinosaurs', 'mya_start', 'DECIMAL(5,1) DEFAULT NULL');
    await ensureColumn(connection, 'dinosaurs', 'mya_end', 'DECIMAL(5,1) DEFAULT NULL');
    await ensureColumn(connection, 'dinosaurs', 'continent', 'VARCHAR(100) DEFAULT NULL');
    await ensureColumn(connection, 'dinosaurs', 'locomotion', 'VARCHAR(50) DEFAULT NULL');

    await ensureIndex(connection, 'dinosaurs', 'idx_dinosaurs_period_diet', '`period`, `diet`');
    await ensureIndex(connection, 'dinosaurs', 'idx_dinosaurs_mya', '`mya_start` DESC, `mya_end` ASC');

    console.log('Ensuring table `ai_analysis_cache` exists...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`ai_analysis_cache\` (
        \`cache_key\` VARCHAR(128) NOT NULL,
        \`feature_type\` VARCHAR(50) NOT NULL,
        \`species_ids\` VARCHAR(255) NOT NULL,
        \`prompt_tag\` VARCHAR(120) DEFAULT NULL,
        \`response_data\` JSON NOT NULL,
        \`model_used\` VARCHAR(64) DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`cache_key\`),
        INDEX \`idx_species_feature\` (\`species_ids\`, \`feature_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [existingRows] = await connection.query('SELECT id FROM dinosaurs ORDER BY id ASC');
    console.log(`Found ${existingRows.length} existing dinosaur records in TiDB.`);

    let updated = 0;
    const missingFromMap = [];

    for (const row of existingRows) {
      const meta = DINOSAUR_V2_METADATA[row.id];
      if (!meta) {
        missingFromMap.push(row.id);
        continue;
      }

      if (meta.mya_start < meta.mya_end) {
        throw new Error(`Invalid MYA range for ${row.id}: ${meta.mya_start} < ${meta.mya_end}`);
      }

      await connection.execute(
        `UPDATE dinosaurs
         SET sub_period = ?, mya_start = ?, mya_end = ?, continent = ?, locomotion = ?
         WHERE id = ?`,
        [meta.sub_period, meta.mya_start, meta.mya_end, meta.continent, meta.locomotion, row.id]
      );
      updated++;
    }

    if (missingFromMap.length > 0) {
      console.warn('Warning: missing metadata mapping for IDs:', missingFromMap.join(', '));
    }

    const [verifyRows] = await connection.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN sub_period IS NULL OR mya_start IS NULL OR mya_end IS NULL OR continent IS NULL OR locomotion IS NULL THEN 1 ELSE 0 END) AS null_count,
        SUM(CASE WHEN mya_start < mya_end THEN 1 ELSE 0 END) AS invalid_range_count
      FROM dinosaurs
    `);

    const [cacheCheck] = await connection.query("SHOW TABLES LIKE 'ai_analysis_cache'");

    console.log(`Updated ${updated} records cleanly.`);
    console.log('Verification Summary:', {
      totalDinosaurs: Number(verifyRows[0].total),
      nullMetadataCount: Number(verifyRows[0].null_count),
      invalidMyaRangeCount: Number(verifyRows[0].invalid_range_count),
      aiAnalysisCacheTableExists: cacheCheck.length > 0,
    });
  } finally {
    await connection.end();
  }

  console.log('--- TiDB V2 Schema Migration Finished ---');
}

if (require.main === module) {
  migrateV2().catch((err) => {
    console.error('V2 Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { DINOSAUR_V2_METADATA, migrateV2 };
