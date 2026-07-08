const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000')

export async function createNote({ title, content, passphrase }) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, passphrase }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create note')
  }
  return res.json()
}

export async function getNotes() {
  const res = await fetch(`${API_URL}/notes`)
  if (!res.ok) throw new Error('Failed to fetch notes')
  return res.json()
}

export async function decryptNote(id, passphrase) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passphrase }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to decrypt note')
  }
  return res.json()
}
