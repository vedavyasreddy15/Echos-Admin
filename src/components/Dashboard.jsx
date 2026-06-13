import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token, onLogout }) {
  const [capsules, setCapsules] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  useEffect(() => {
    fetchCapsules();
  }, []);

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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
        <h2 style={{ color: '#d32f2f', margin: 0 }}>Echos Logistics Dashboard</h2>
        <div>
          <button onClick={fetchCapsules} style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem', fontWeight: 'bold' }}>Refresh ↻</button>
          <button onClick={onLogout} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ccc', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setFilter('all')} style={btnStyle('all')}>All Orders</button>
        <button onClick={() => setFilter('virtual')} style={btnStyle('virtual')}>Virtual (Automated Emails)</button>
        <button onClick={() => setFilter('physical')} style={btnStyle('physical')}>Physical (Manual Fulfillment)</button>
      </div>

      {loading ? (
        <p>Loading secure data...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Receipt & Sender</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Recipient Details</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Type</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Delivery Date</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCapsules.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontFamily: 'monospace', background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#c1121f', fontWeight: 'bold' }}>{c.receiptNumber || 'LEGACY'}</span><br/>
                  <small style={{ color: '#333' }}><strong>{c.senderName || 'Anonymous'}</strong></small><br/>
                  <small style={{ color: '#666' }}>{c.senderEmail || 'N/A'}</small>
                </td>
                <td style={{ padding: '1rem', color: '#333' }}>
                  <strong>{c.recipientDetails.fullName || 'N/A'}</strong><br/>
                  <small style={{ color: '#666' }}>{c.recipientDetails.email}</small><br/>
                  {c.deliveryType === 'physical' && (
                    <small style={{ color: '#888' }}>
                      {c.recipientDetails.street}, {c.recipientDetails.city}, {c.recipientDetails.state} {c.recipientDetails.zipCode}
                    </small>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: c.deliveryType === 'virtual' ? '#e3f2fd' : '#f3e5f5',
                    color: c.deliveryType === 'virtual' ? '#1565c0' : '#7b1fa2',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {c.deliveryType.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#333' }}>{new Date(c.deliveryDate).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: c.status === 'delivered' ? '#d4edda' : '#fff3cd', 
                    color: c.status === 'delivered' ? '#155724' : '#856404',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => setSelectedCapsule(c)} style={{ marginRight: '0.5rem', cursor: 'pointer', padding: '4px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>View Content</button>
                  {c.deliveryType === 'physical' && c.status === 'pending' && (
                    <button onClick={() => handleEdit(c)} style={{ marginRight: '0.5rem', cursor: 'pointer', padding: '4px 8px', background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '4px' }}>Mark Delivered</button>
                  )}
                  <button onClick={() => handleDelete(c._id)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px' }}>Del</button>
                  {c.files.length > 0 && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>{c.files.length} Attachments</div>}
                </td>
              </tr>
            ))}
            {filteredCapsules.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No capsules found in this category.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {selectedCapsule && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#fdf5e6', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '3rem', position: 'relative' }}>
            <button onClick={() => setSelectedCapsule(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>✖</button>
            
            <div style={{ borderBottom: '1px solid #e0d0b5', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', color: '#c1121f', fontFamily: 'serif', margin: 0 }}>Time Capsule Content</h2>
              <p style={{ color: '#666', marginTop: '0.5rem', fontFamily: 'monospace' }}>Receipt: {selectedCapsule.receiptNumber}</p>
            </div>

            <h3 style={{ color: '#444', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>The Letter</h3>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', fontFamily: 'serif', fontSize: '1.2rem', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap', minHeight: '200px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
              {selectedCapsule.letter || <em style={{ color: '#ccc' }}>No letter was included in this capsule.</em>}
            </div>

            {selectedCapsule.files && selectedCapsule.files.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: '#444', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Attached Files for Physical Packaging ({selectedCapsule.files.length})</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {selectedCapsule.files.map((file, i) => (
                    <div key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                      <span style={{ color: '#333', fontWeight: 'bold' }}>{i + 1}. {file.originalName}</span>
                      <button onClick={() => handleDownload(file.fileId, file.originalName)} style={{ background: '#c1121f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Secure Download
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
