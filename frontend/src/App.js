import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import FetchMessages from './pages/FetchMessages';
import Dashboard from './pages/Dashboard';
import ModelResult from './pages/ModelResult';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fetch" element={<FetchMessages />} />
          <Route path="/model-result" element={<ModelResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
