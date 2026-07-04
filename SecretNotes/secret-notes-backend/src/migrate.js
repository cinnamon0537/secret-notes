import fs from 'node:fs/promises';  //datei lesen
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closeDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    const migrationPath = path.join(
      __dirname,
      '..',
      'migrations',
      '001_create_notes.sql'
    );

    const sql = await fs.readFile(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('Db migratio success');
  } catch (error) {
    console.error('Db migration failed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

migrate();