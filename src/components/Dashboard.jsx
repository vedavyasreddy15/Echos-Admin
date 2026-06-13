import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token, onLogout }) {
  const [capsules, setCapsules] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCapsules();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // Force the backend to check and send any due emails immediately
      await axios.post(`${apiUrl}/api/capsules/process-due`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Then fetch the updated list
      await fetchCapsules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/capsules/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Error downloading file.');
    }
  };

  const fetchCapsules = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.get(`${apiUrl}/api/capsules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapsules(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this capsule?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await axios.delete(`${apiUrl}/api/capsules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCapsules(); // refresh
    } catch (err) {
      alert("Failed to delete capsule.");
    }
  };

  const handleEdit = async (c) => {
    if (c.deliveryType !== 'physical') {
      alert("Only physical deliveries can be manually marked as delivered.");
      return;
    }
    if (!window.confirm("Mark this physical delivery as DELIVERED? This will notify the sender.")) return;
    
    try {
      await axios.put(`http://localhost:3001/api/capsules/${c._id}`, { status: 'delivered' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCapsules(); // refresh
    } catch (err) {
      alert("Failed to update capsule.");
    }
  };

  const filteredCapsules = capsules.filter(c => {
    if (filter === 'all') return true;
    return c.deliveryType === filter;
  });

  const btnStyle = (type) => ({
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: filter === type ? '#d32f2f' : '#fff',
    color: filter === type ? 'white' : '#333',
    cursor: 'pointer'
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--text-main)' }}>Echos</span> <span style={{ color: 'var(--primary-crimson)' }}>Logistics</span>
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="primary-button"
            style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: isRefreshing ? 'wait' : 'pointer' }}>
            <span style={{ marginRight: '8px' }}>Force Send Due Emails</span>
            <span className={isRefreshing ? 'spin-icon' : ''} style={{ display: 'inline-block' }}>↻</span>
          </button>
          <button onClick={onLogout} className="glass-button" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setFilter('all')} 
          className={filter === 'all' ? 'primary-button' : 'glass-button'}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
          All Orders
        </button>
        <button 
          onClick={() => setFilter('virtual')} 
          className={filter === 'virtual' ? 'primary-button' : 'glass-button'}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
          Virtual
        </button>
        <button 
          onClick={() => setFilter('physical')} 
          className={filter === 'physical' ? 'primary-button' : 'glass-button'}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
          Physical
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spin-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>↻</span>
            <p>Decrypting secure ledger...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Receipt & Sender</th>
                <th>Recipient</th>
                <th>Type</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapsules.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontFamily: 'var(--mono)', color: 'var(--primary-crimson)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                      {c.receiptNumber || 'LEGACY'}
                    </div>
                    <div style={{ fontWeight: 500 }}>{c.senderName || 'Anonymous'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.senderEmail || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.recipientDetails.fullName || 'N/A'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.recipientDetails.email}</div>
                    {c.deliveryType === 'physical' && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', maxWidth: '200px' }}>
                        {c.recipientDetails.street}, {c.recipientDetails.city}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${c.deliveryType === 'virtual' ? 'badge-virtual' : 'badge-physical'}`}>
                      {c.deliveryType.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{new Date(c.deliveryDate).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.deliveryTime || '12:00'}</div>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'delivered' ? 'badge-delivered' : 'badge-pending'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => setSelectedCapsule(c)} className="glass-button" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        View
                      </button>
                      {c.deliveryType === 'physical' && c.status === 'pending' && (
                        <button onClick={() => handleEdit(c)} className="glass-button" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--badge-blue-text)' }}>
                          Deliver
                        </button>
                      )}
                      <button onClick={() => handleDelete(c._id)} className="glass-button" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--primary-crimson)', borderColor: 'rgba(230,57,70,0.3)' }}>
                        Del
                      </button>
                    </div>
                    {c.files.length > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>📎 {c.files.length} Attachments</div>}
                  </td>
                </tr>
              ))}
              {filteredCapsules.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No capsules found in this sector.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Capsule Viewer Modal */}
      {selectedCapsule && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', position: 'relative' }}>
            <button onClick={() => setSelectedCapsule(null)} className="glass-button" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', padding: 0 }}>
              ✕
            </button>
            
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0, fontWeight: 300 }}>Time Capsule Payload</h2>
              <p style={{ color: 'var(--primary-crimson)', marginTop: '0.5rem', fontFamily: 'var(--mono)', fontWeight: 700 }}>Receipt: {selectedCapsule.receiptNumber}</p>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>The Letter</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-glass)', fontFamily: 'serif', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-wrap', minHeight: '150px' }}>
              {selectedCapsule.letter || <em style={{ color: 'var(--text-muted)' }}>No written message was included.</em>}
            </div>

            {selectedCapsule.files && selectedCapsule.files.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Encrypted Attachments ({selectedCapsule.files.length})</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedCapsule.files.map((file, i) => (
                    <div key={file.fileId} className="glass-button" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>{file.originalName}</span>
                      <button onClick={() => handleDownload(file.fileId, file.originalName)} className="primary-button" style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
