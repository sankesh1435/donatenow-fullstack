import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem('dn_token');
      if (!token) {
        setData(null);
        setLoading(false);
        return;
      }
      const res = await axios.get('http://localhost:4000/api/me', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Profile load error:', err);
      setData(null);
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  if (!data) return <div style={{ padding: '24px' }}>Not logged in</div>;

  const { user: userData, donations, created, likes } = data;

  return (
    <div style={{ padding: '24px' }}>
      <div className="max-w-4xl mx-auto">
        {/* User Header */}
        <div
          className="bg-white p-8 rounded-xl shadow-sm mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(6,182,212,0.05))',
            borderLeft: '4px solid #7c3aed'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                boxShadow: '0 12px 30px rgba(124,58,237,0.2)'
              }}
            >
              {userData.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>
                {userData.name}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                {userData.email}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 12 }}>
                Role: <strong style={{ color: '#334155' }}>{userData.role === 'admin' ? '👨‍💼 Admin' : '💝 Donor'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>
              {donations.length}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: '4px' }}>
              Donations Made
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#06b6d4' }}>
              {created.length}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: '4px' }}>
              Causes Created
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>
              {likes.length}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: '4px' }}>
              Causes Liked
            </div>
          </div>
        </div>

        {/* Donations */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: '16px' }}>
            💳 Your Donations
          </h2>
          {donations.length === 0 ? (
            <p style={{ color: '#94a3b8', margin: 0 }}>You haven't made any donations yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Cause
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Amount
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', color: '#0f172a' }}>
                        {d.cause_title || 'Untitled Cause'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 8px', color: '#10b981', fontWeight: 600 }}>
                        ₹{Math.round(d.amount)}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#64748b' }}>
                        {new Date(d.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Created Causes */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: '16px' }}>
            🎯 Causes You Created
          </h2>
          {created.length === 0 ? (
            <p style={{ color: '#94a3b8', margin: 0 }}>You haven't created any causes yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Title
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Raised
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Goal
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: '#334155' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {created.map((c, i) => {
                    const pct = Math.min(
                      100,
                      Math.round(((c.raised_amount || 0) / (c.goal_amount || 1)) * 100)
                    );
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 8px', color: '#0f172a' }}>
                          {c.title}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 8px', color: '#10b981', fontWeight: 600 }}>
                          ₹{Math.round(c.raised_amount || 0)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 8px', color: '#334155' }}>
                          ₹{Math.round(c.goal_amount || 0)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              background: pct >= 100 ? '#d1fae5' : '#fef3c7',
                              color: pct >= 100 ? '#047857' : '#b45309',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: 11,
                              fontWeight: 600
                            }}
                          >
                            {pct >= 100 ? '✓ Completed' : `${pct}% Funded`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Liked Causes */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: '16px' }}>
            ♥️ Causes You Liked
          </h2>
          {likes.length === 0 ? (
            <p style={{ color: '#94a3b8', margin: 0 }}>You haven't liked any causes yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {likes.map((l, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #fcd34d'
                  }}
                >
                  ♥ {l.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
