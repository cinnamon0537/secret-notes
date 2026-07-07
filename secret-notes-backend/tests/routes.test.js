import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const db = {
  createNote: jest.fn(),
  getNoteById: jest.fn(),
  listNotes: jest.fn(),
};

const crypto = {
  encryptNote: jest.fn(),
  decryptNote: jest.fn(),
};

await jest.unstable_mockModule('../src/db.js', () => ({
  createNote: db.createNote,
  getNoteById: db.getNoteById,
  listNotes: db.listNotes,
}));

await jest.unstable_mockModule('../src/crypto.js', () => ({
  encryptNote: crypto.encryptNote,
  decryptNote: crypto.decryptNote,
}));

const { buildApp } = await import('../src/app.js');

describe('notes routes', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists notes', async () => {
    db.listNotes.mockResolvedValue([{ id: '1', title: 'First note' }]);

    const response = await app.inject({ method: 'GET', url: '/notes' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([{ id: '1', title: 'First note' }]);
    expect(db.listNotes).toHaveBeenCalledTimes(1);
  });

  it('returns health status', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('rejects invalid note creation payloads', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: { title: '', content: 'x' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'error in request body' });
  });

  it('creates an encrypted note', async () => {
    crypto.encryptNote.mockResolvedValue({
      ciphertext: 'ciphertext',
      iv: 'iv',
      authTag: 'auth-tag',
      salt: 'salt',
    });
    db.createNote.mockResolvedValue({ id: 'abc-123', title: 'Secret' });

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'Secret',
        content: 'Top secret content',
        passphrase: 'passphrase',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ id: 'abc-123', title: 'Secret' });
    expect(crypto.encryptNote).toHaveBeenCalledWith('Top secret content', 'passphrase');
    expect(db.createNote).toHaveBeenCalledWith({
      title: 'Secret',
      ciphertext: 'ciphertext',
      iv: 'iv',
      authTag: 'auth-tag',
      salt: 'salt',
    });
  });

  it('returns 404 when a note does not exist', async () => {
    db.getNoteById.mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/notes/missing',
      payload: { passphrase: 'secret' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Note not found' });
  });

  it('decrypts a note with the correct passphrase', async () => {
    db.getNoteById.mockResolvedValue({
      id: 'abc-123',
      title: 'Secret',
      ciphertext: 'ciphertext',
      iv: 'iv',
      authTag: 'auth-tag',
      salt: 'salt',
    });
    crypto.decryptNote.mockResolvedValue('Plaintext content');

    const response = await app.inject({
      method: 'POST',
      url: '/notes/abc-123',
      payload: { passphrase: 'secret' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 'abc-123',
      title: 'Secret',
      content: 'Plaintext content',
    });
    expect(crypto.decryptNote).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'abc-123' }),
      'secret'
    );
  });

  it('rejects an invalid decryption payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/notes/abc-123',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'error in request body' });
  });

  it('returns 403 for a wrong decryption key', async () => {
    db.getNoteById.mockResolvedValue({
      id: 'abc-123',
      title: 'Secret',
      ciphertext: 'ciphertext',
      iv: 'iv',
      authTag: 'auth-tag',
      salt: 'salt',
    });
    crypto.decryptNote.mockRejectedValue(new Error('bad key'));

    const response = await app.inject({
      method: 'POST',
      url: '/notes/abc-123',
      payload: { passphrase: 'wrong' },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ error: 'wrong decryption key' });
  });
});
