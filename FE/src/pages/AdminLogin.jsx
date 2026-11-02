import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/pages/admin-dashboard.html');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminName', data.data.name);
        navigate('/pages/admin-dashboard.html');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #f0fdf4 100%)',
      width: '100%',
      position: 'absolute',
      top: 0, left: 0, zIndex: 9999,
      padding: '24px'
    }}>
      <div className="login-card" style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        borderTop: '4px solid #22c55e'
      }}>
        <div className="logo-icon" style={{
          width: '56px', height: '56px', margin: '0 auto 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #22c55e, #eab308)',
          borderRadius: '14px', color: '#fff', fontSize: '28px'
        }}>🔐</div>
        <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: 700, color: '#166534', margin: '0 0 6px 0' }}>Admin Panel</h1>
        <p className="subtitle" style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', margin: '0 0 32px 0' }}>Sign in to manage your store</p>
        
        {errorMsg && (
          <div className="error-message show" id="errorMsg" style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'block'
          }}>
            {errorMsg}
          </div>
        )}
        
        <form id="loginForm" onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email Address</label>
            <input type="email" id="email" placeholder="admin@example.com" required value={email} onChange={e=>setEmail(e.target.value)} style={{
              width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', background: '#fafafa', boxSizing: 'border-box'
            }} />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
            <input type="password" id="password" placeholder="••••••••" required value={password} onChange={e=>setPassword(e.target.value)} style={{
              width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', background: '#fafafa', boxSizing: 'border-box'
            }} />
          </div>
          <button type="submit" className="login-btn" id="loginBtn" disabled={isLoading} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1
          }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      <footer style={{
        marginTop: '24px',
        color: '#4b5563',
        fontSize: '13px',
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 600, color: '#166534' }}>Apple Store Admin</div>
        <div>Secure access for store management</div>
        <div style={{ color: '#6b7280' }}>© 2026 Apple Store. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default AdminLogin;
