import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="card">
      <h1>Welcome to Secret Notes</h1>
      <p>
        Create encrypted notes that can only be read with the correct passphrase.
        Your data is encrypted using AES-256-GCM before it is stored.
      </p>
      <div className="home-links">
        <Link to="/create" className="home-link">Create a Secret Note</Link>
        <Link to="/read" className="home-link">Read a Secret Note</Link>
      </div>
    </div>
  )
}

export default Home
