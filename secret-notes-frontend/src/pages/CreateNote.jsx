import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createNote } from '../api/notes'
import { captureEvent } from '../posthog'

function CreateNote() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!title.trim() || !content.trim() || !passphrase.trim()) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      const note = await createNote({ title, content, passphrase })
      captureEvent('note_created', { note_id: note.id })
      setResult(note)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="card">
        <h1>Create a Secret Note</h1>
        <div className="alert alert-success">Note created securely!</div>
        <div className="result-box">
          <strong>Note ID:</strong>
          <pre>{result.id}</pre>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Save this ID — you need it to retrieve the note.
          </p>
        </div>
        <button className="btn" style={{ marginTop: '1rem' }} onClick={() => navigate('/read')}>
          Read a Note
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>Create a Secret Note</h1>
      <p>Your note will be encrypted before storage. Share the Note ID and passphrase with your recipient.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Your secret message..." />
        </div>
        <div className="form-group">
          <label htmlFor="passphrase">Passphrase</label>
          <input id="passphrase" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Encryption passphrase" />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Encrypting...' : 'Create Secret Note'}
        </button>
      </form>
    </div>
  )
}

export default CreateNote
