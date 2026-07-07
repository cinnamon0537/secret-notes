import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const ALGORITHM = "aes-256-gcm"; 
const KEY_LENGTH = 32; 
const IV_LENGTH = 12; 
const SALT_LENGTH = 16;

async function deriveKey(passphrase, salt) {
  return scryptAsync(passphrase, salt, KEY_LENGTH);
}

export async function encryptNote(content, passphrase) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(content, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"), 
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    salt: salt.toString("base64"),
  };
}

export async function decryptNote(note, passphrase) {
  const salt = Buffer.from(note.salt, "base64");
  const iv = Buffer.from(note.iv, "base64");
  const authTag = Buffer.from(note.authTag, "base64");
  const ciphertext = Buffer.from(note.ciphertext, "base64");

  const key = await deriveKey(passphrase, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
