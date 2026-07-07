import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const useSsl = process.env.DATABASE_SSL === 'true';

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/encr_notes',
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function closeDb() {
  await pool.end();
}

export async function createNote({ title, ciphertext, iv, authTag, salt }) {
  const result = await pool.query(
    `
      INSERT INTO notes (title, ciphertext, iv, auth_tag, salt)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title;
    `,
    [title, ciphertext, iv, authTag, salt]
  );
  return result.rows[0];
}

export async function getNoteById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        title,
        ciphertext,
        iv,
        auth_tag AS "authTag",
        salt
      FROM notes
      WHERE id = $1;   
    `,
    [id]
  );                   
  return result.rows[0] || null;
}

export async function listNotes() {
  const result = await pool.query(
    `
      SELECT id, title
      FROM notes
      ORDER BY id;
    `
  );

  return result.rows;
}
