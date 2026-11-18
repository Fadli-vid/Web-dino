const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { DINOSAUR_V2_METADATA } = require('./migrate-v2-schema');

function parseCSVLine(line) {
  const fields = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const n = line[i + 1];
    if (c === '"') {
      if (inQ && n === '"') {
        field += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === ',' && !inQ) {
      fields.push(field);
      field = '';
    } else {
      field += c;
    }
  }
  fields.push(field);
  return fields;
}

function parseCSV(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  let current = '';
  let inQ = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line && !inQ) continue;
    
    current = current ? current + '\n' + line : line;
    // Count quotes
    let quoteCount = 0;
    for (let c of current) {
      if (c === '"') quoteCount++;
    }
    
    if (quoteCount % 2 === 0) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);

  return lines.map(l => parseCSVLine(l));
}

function safeJson(str, isArray = false) {
  if (!str || !str.trim()) return isArray ? '[]' : '{}';
  const trimmed = str.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch (e) {
    return isArray ? '[]' : '{}';
  }
}

async function migrate() {
  console.log('--- Starting Clean TiDB Migration ---');

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
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false
    }
  });

  console.log('Connected to TiDB Cloud Server.');

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.query(`USE \`${database}\`;`);
  console.log(`Using database \`${database}\`.`);

  console.log('Recreating table `dinosaurs`...');
  await connection.query('DROP TABLE IF EXISTS dinosaurs;');

  const schemeSql = fs.readFileSync(path.join(__dirname, '../doc/Scheme.sql'), 'utf-8');
  console.log('Executing Scheme.sql...');
  const statements = schemeSql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await connection.query(stmt);
  }
  console.log('Tables created cleanly.');

  const csvContent = fs.readFileSync(path.join(__dirname, '../doc/dinosaurs_rows.csv'), 'utf-8');
  const rows = parseCSV(csvContent);
  
  const headers = rows[0];
  console.log(`Found CSV headers (${headers.length}):`, headers.join(', '));

  const dataRows = rows.slice(1);
  console.log(`Parsed ${dataRows.length} data rows from CSV.`);

  let insertedCount = 0;

  for (let index = 0; index < dataRows.length; index++) {
    const row = dataRows[index];
    if (row.length < 18) {
      console.warn(`Skipping incomplete row ${index} for ID: ${row[0]}`);
      continue;
    }

    const [
      id, name, scientific_name, period, length, weight, diet, description,
      image, image_alt, taxonomy, characteristics, fossils, discovered,
      location_found, size_comparison_url, habitat_map_url, evolutionary_tree_url
    ] = row;

    const parsedTaxonomy = safeJson(taxonomy, false);
    const parsedCharacteristics = safeJson(characteristics, true);

    const v2 = DINOSAUR_V2_METADATA[id ? id.trim() : ''] || {};

    const insertSql = `
      INSERT INTO dinosaurs (
        id, name, scientific_name, period, sub_period, mya_start, mya_end,
        length, weight, diet, locomotion, continent, description,
        image, image_alt, taxonomy, characteristics, fossils, discovered,
        location_found, size_comparison_url, habitat_map_url, evolutionary_tree_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        scientific_name = VALUES(scientific_name),
        period = VALUES(period),
        sub_period = VALUES(sub_period),
        mya_start = VALUES(mya_start),
        mya_end = VALUES(mya_end),
        length = VALUES(length),
        weight = VALUES(weight),
        diet = VALUES(diet),
        locomotion = VALUES(locomotion),
        continent = VALUES(continent),
        description = VALUES(description),
        image = VALUES(image),
        image_alt = VALUES(image_alt),
        taxonomy = VALUES(taxonomy),
        characteristics = VALUES(characteristics),
        fossils = VALUES(fossils),
        discovered = VALUES(discovered),
        location_found = VALUES(location_found),
        size_comparison_url = VALUES(size_comparison_url),
        habitat_map_url = VALUES(habitat_map_url),
        evolutionary_tree_url = VALUES(evolutionary_tree_url);
    `;

    try {
      await connection.execute(insertSql, [
        id ? id.trim() : null,
        name ? name.trim() : null,
        scientific_name ? scientific_name.trim() : null,
        period ? period.trim() : null,
        v2.sub_period || null,
        v2.mya_start ?? null,
        v2.mya_end ?? null,
        length && !isNaN(parseFloat(length)) ? parseFloat(length) : null,
        weight && !isNaN(parseFloat(weight)) ? parseFloat(weight) : null,
        diet ? diet.trim() : null,
        v2.locomotion || null,
        v2.continent || null,
        description ? description.trim() : null,
        image ? image.trim() : null,
        image_alt ? image_alt.trim() : null,
        parsedTaxonomy,
        parsedCharacteristics,
        fossils ? fossils.trim() : null,
        discovered ? discovered.trim() : null,
        location_found ? location_found.trim() : null,
        size_comparison_url ? size_comparison_url.trim() : null,
        habitat_map_url ? habitat_map_url.trim() : null,
        evolutionary_tree_url ? evolutionary_tree_url.trim() : null
      ]);
      insertedCount++;
    } catch (err) {
      console.error(`Error inserting row ${index} (ID: ${id}):`, err.message);
      throw err;
    }
  }

  console.log(`Successfully migrated ${insertedCount} dinosaur records to TiDB!`);

  const [countResult] = await connection.query('SELECT COUNT(*) as total FROM dinosaurs');
  console.log('TiDB Total Rows:', countResult[0].total);

  const [sample] = await connection.query('SELECT id, name, scientific_name, taxonomy, characteristics FROM dinosaurs LIMIT 1');
  console.log('Sample Record from TiDB:');
  console.log('ID:', sample[0].id);
  console.log('Taxonomy:', sample[0].taxonomy);
  console.log('Characteristics:', sample[0].characteristics);

  await connection.end();
  console.log('--- Migration Finished Successfully ---');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
