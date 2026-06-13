import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }} className="animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--text-main)' }}>Echos</span> <span style={{ color: 'var(--primary-crimson)' }}>Portal</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Secure Logistics Access</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(230, 57, 70, 0.1)', borderLeft: '4px solid var(--primary-crimson)', color: '#ff8a93', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-glass)', 
                background: 'rgba(0,0,0,0.4)', 
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Master Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-glass)', 
                background: 'rgba(0,0,0,0.4)', 
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="primary-button"
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              fontSize: '1rem', 
              marginTop: '1rem',
              cursor: isLoading ? 'wait' : 'pointer'
            }}
          >
            {isLoading ? <span className="spin-icon">↻</span> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}
