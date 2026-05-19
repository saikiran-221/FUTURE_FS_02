import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, Send } from 'lucide-react';

function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <Send size={18} />
        </div>
        <Link to="/">Mini CRM</Link>
      </div>
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/admin/dashboard" className="nav-link"><LayoutDashboard size={18} /> Dashboard</Link>
            <button className="nav-btn logout" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </>
        ) : (
          <>
            <Link to="/" className="nav-link"><Send size={18} /> Submit Lead</Link>
            <Link to="/admin/login" className="nav-link"><LogIn size={18} /> Admin</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
