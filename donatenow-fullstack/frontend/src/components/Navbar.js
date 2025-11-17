// frontend/src/components/Navbar.js
import React, { useEffect, useState } from 'react';

export default function Navbar({ user, onNavigate }){
  const [me, setMe] = useState(null);

  useEffect(()=> {
    // Only use the passed user prop
    setMe(user);
  }, [user]);

  function getInitials(name){
    if(!name) return '';
    return name.split(' ').map(n=>n[0]).join('').toUpperCase();
  }

  function handleLogout(){
    localStorage.removeItem('dn_user');
    localStorage.removeItem('dn_token');
    setMe(null);
    if(onNavigate) onNavigate('home');
  }

  function handleNav(page){
    if(onNavigate) onNavigate(page);
  }

  return (
    <nav className="bg-white p-3 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          onClick={()=>handleNav('home')}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Logo Icon */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            💝
          </div>
          
          {/* Logo Text */}
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#4f46e5',
              lineHeight: 1,
              margin: '0'
            }}>
              DonateNow
            </div>
            <div style={{
              fontSize: 10,
              color: '#64748b',
              fontWeight: 500,
              margin: '2px 0 0 0'
            }}>
              Inspire • Act • Transform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <button onClick={()=>handleNav('home')} style={{cursor:'pointer', background:'none', border:'none', color:'#334155', padding:0}}>Home</button>
          <button onClick={()=>handleNav('create')} style={{cursor:'pointer', background:'none', border:'none', color:'#334155', padding:0}}>Create Cause</button>
          <button onClick={()=>handleNav('stories')} style={{cursor:'pointer', background:'none', border:'none', color:'#334155', padding:0}}>Success Stories</button>
          <button onClick={()=>handleNav('insights')} style={{cursor:'pointer', background:'none', border:'none', color:'#334155', padding:0}}>Insights</button>
          {me && me.role === 'admin' ? (
            <button onClick={()=>handleNav('admin')} style={{cursor:'pointer', background:'none', border:'none', color:'#f97316', fontWeight:600, padding:0}}>Admin</button>
          ) : null}

          {me ? (
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <button 
                onClick={()=>handleNav('profile')} 
                style={{
                  cursor:'pointer', 
                  display:'flex', 
                  alignItems:'center', 
                  gap:8,
                  background:'linear-gradient(90deg, #7c3aed, #06b6d4)',
                  color:'white',
                  padding:'6px 14px',
                  borderRadius:'20px',
                  border:'none',
                  fontSize:13,
                  fontWeight:600
                }}
                title="Click to view profile"
              >
                <div style={{
                  width:28,
                  height:28,
                  borderRadius:'50%',
                  background:'rgba(255,255,255,0.25)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:10,
                  fontWeight:700
                }}>
                  {getInitials(me.name)}
                </div>
                {me.name}
              </button>
              <button 
                onClick={handleLogout} 
                style={{
                  cursor:'pointer',
                  background:'none',
                  border:'1px solid #e2e8f0',
                  color:'#334155',
                  padding:'6px 12px',
                  borderRadius:'6px',
                  fontSize:12,
                  fontWeight:600
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={()=>handleNav('auth')} 
              style={{
                cursor:'pointer',
                background:'linear-gradient(90deg, #4f46e5, #06b6d4)',
                color:'white',
                border:'none',
                padding:'8px 16px',
                borderRadius:'6px',
                fontSize:13,
                fontWeight:600
              }}
            >
              Login / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
