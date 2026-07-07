import { describe, expect, it } from '@jest/globals';
import { encryptNote, decryptNote } from '../src/crypto.js';

describe('crypto helpers', () => {
  it('returns ciphertext, iv, auth tag, and salt', async () => {
    const result = await encryptNote('hello world', 'secret');

    expect(result).toEqual({
      ciphertext: expect.any(String),
      iv: expect.any(String),
      authTag: expect.any(String),
      salt: expect.any(String),
    });
  });

  it('decrypts note content with the correct passphrase', async () => {
    const encrypted = await encryptNote('hello world', 'secret');
    const decrypted = await decryptNote(encrypted, 'secret');

    expect(decrypted).toBe('hello world');
  });

  it('rejects a wrong passphrase', async () => {
    const encrypted = await encryptNote('hello world', 'secret');

    await expect(decryptNote(encrypted, 'wrong')).rejects.toThrow();
  });

  it('produces different encryption metadata for repeated calls', async () => {
    const first = await encryptNote('same content', 'secret');
    const second = await encryptNote('same content', 'secret');

    expect(first.iv).not.toBe(second.iv);
    expect(first.salt).not.toBe(second.salt);
    expect(first.ciphertext).not.toBe('');
    expect(second.ciphertext).not.toBe('');
  });

  it('fails when the ciphertext is modified', async () => {
    const encrypted = await encryptNote('hello world', 'secret');

    await expect(
      decryptNote({ ...encrypted, ciphertext: 'AAAA' }, 'secret')
    ).rejects.toThrow();
  });
});
