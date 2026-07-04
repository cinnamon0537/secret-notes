import { useState } from 'react'
import { decryptNote } from '../api/notes'
import { captureEvent } from '../posthog'

function ReadNote() {
  const [noteId, setNoteId] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!noteId.trim() || !passphrase.trim()) {
      setError('Both Note ID and passphrase are required')
      return
    }

    setLoading(true)
    try {
      const note = await decryptNote(noteId, passphrase)
      captureEvent('note_read', { note_id: noteId })
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
        <h1>Read a Secret Note</h1>
        <div className="alert alert-success">Note decrypted successfully!</div>
        <div className="result-box">
          <strong>Title:</strong> {result.title}
          <br /><br />
          <strong>Content:</strong>
          <pre>{result.content}</pre>
        </div>
        <button className="btn" style={{ marginTop: '1rem' }} onClick={() => { setResult(null); setNoteId(''); setPassphrase('') }}>
          Read Another Note
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>Read a Secret Note</h1>
      <p>Enter the Note ID and the passphrase to decrypt and view the note.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="noteId">Note ID</label>
          <input id="noteId" value={noteId} onChange={(e) => setNoteId(e.target.value)} placeholder="Paste the Note ID here" />
        </div>
        <div className="form-group">
          <label htmlFor="passphrase">Passphrase</label>
          <input id="passphrase" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="The passphrase used to encrypt" />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Decrypting...' : 'Decrypt Note'}
        </button>
      </form>
    </div>
  )
}

export default ReadNote
