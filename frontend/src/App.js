import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import Upload from './components/Upload';
import Verify from './components/Verify';
import Dashboard from './components/Dashboard';
import './App.css';


function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        {!user ? (
          <Routes>
            <Route path="/*" element={<Login onLogin={setUser} />} />
          </Routes>
        ) : (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;