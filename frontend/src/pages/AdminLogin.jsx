import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

function AdminLogin({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

      const response = await axios.post(`${API_BASE}/api/admin/login`, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      Swal.fire({
        title: 'Success',
        text: 'Welcome back, Admin!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/admin/dashboard');
    } catch (err) {
      Swal.fire('Access Denied', 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <ShieldAlert size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h1>Admin Portal</h1>
        <p>Secure login for authorized personnel only.</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label><Mail size={16} /> Email Address</label>
          <input 
            type="email" 
            placeholder="admin@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label><Lock size={16} /> Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Authenticating...' : 'Secure Login'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;

