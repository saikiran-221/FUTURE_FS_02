import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LeadForm from './pages/LeadForm';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import './styles.css';

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar token={token} setToken={setToken} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LeadForm />} />
            <Route path="/admin/login" element={<AdminLogin setToken={setToken} />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute token={token}>
                  <Dashboard token={token} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

