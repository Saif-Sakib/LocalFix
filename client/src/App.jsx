import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🔧 LocalFix</h1>
          <p>Fix Local Issues Together</p>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Temporary home page component
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>Welcome to LocalFix! 🏠</h2>
    <p>Platform to fix local community issues</p>
    <div style={{ marginTop: '30px' }}>
      <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
      <button style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
    </div>
  </div>
)

export default App
