import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import CreateNote from './pages/CreateNote'
import ReadNote from './pages/ReadNote'
import { getFeatureFlag, identifyUser } from './posthog'
import './App.css'

function App() {
  const [theme, setTheme] = useState('control')
  const location = useLocation()

  useEffect(() => {
    const flag = getFeatureFlag('ui-theme')
    setTheme(flag)
    identifyUser(`anon_${Math.random().toString(36).slice(2)}`)
  }, [])

  const isGreenTheme = theme === 'test'

  return (
    <div className={`app ${isGreenTheme ? 'theme-green' : 'theme-blue'}`}>
      <nav className="nav">
        <Link to="/" className="nav-brand">Secret Notes</Link>
        <div className="nav-links">
          <Link to="/create" className="nav-link">Create Note</Link>
          <Link to="/read" className="nav-link">Read Note</Link>
        </div>
        <span className="theme-badge">
          {isGreenTheme ? 'Group B (Green)' : 'Group A (Blue)'}
        </span>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateNote />} />
          <Route path="/read" element={<ReadNote />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
