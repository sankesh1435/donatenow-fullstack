// frontend/src/pages/AuthPage.js
import React, { useState } from 'react';
import axios from 'axios';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // login | register
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);

  async function submit(e){
    e.preventDefault();
    setBusy(true);
    try{
      if(mode==='login'){
        const r = await axios.post('http://localhost:4000/api/login', { email, password });
        localStorage.setItem('dn_token', r.data.token);
        localStorage.setItem('dn_user', JSON.stringify(r.data.user));
        onAuthSuccess && onAuthSuccess(r.data.user);
      } else {
        const r = await axios.post('http://localhost:4000/api/register', { name, email, password });
        localStorage.setItem('dn_token', r.data.token);
        localStorage.setItem('dn_user', JSON.stringify(r.data.user));
        onAuthSuccess && onAuthSuccess(r.data.user);
      }
    }catch(err){ alert(err?.response?.data?.error || 'Auth failed'); }
    setBusy(false);
  }

  return (
    <div className="auth-center" style={{background:'linear-gradient(180deg,#eef2ff,#fff)'}}>
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="auth-hero rounded-xl p-6 flex flex-col justify-center glass-card auth-cta">
          <h2 className="text-3xl font-bold">DonateNow</h2>
          <p className="mt-2">Create causes. Support communities. Share impact.</p>
          <div className="mt-6 grid gap-3">
            <div className="p-3 bg-white/10 rounded">🎯 Create campaigns & track goals</div>
            <div className="p-3 bg-white/10 rounded">✨ Beautiful success stories</div>
            <div className="p-3 bg-white/10 rounded">📊 Insights & leaderboards</div>
          </div>
        </div>

        <div className="p-6 rounded-xl glass-card" style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{mode==='login' ? 'Welcome back' : 'Create your account'}</h3>
            <div>
              <button onClick={()=>setMode(mode==='login'?'register':'login')} className="text-sm text-indigo-600">
                {mode==='login' ? 'Register' : 'Sign in'}
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode==='register' && <input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded input-animated" />}
            <input required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded input-animated" />
            <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2 rounded input-animated" />
            <div className="flex justify-between items-center">
              <small className="text-xs text-gray-500">By continuing you agree to the terms.</small>
              <button disabled={busy} type="submit" className="glass-btn px-4 py-2 rounded">{busy ? 'Please wait...' : (mode==='login' ? 'Sign in' : 'Create')}</button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">Or continue as guest</div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button className="border rounded p-2">G</button>
            <button className="border rounded p-2">f</button>
            <button onClick={()=>{ localStorage.removeItem('dn_user'); localStorage.removeItem('dn_token'); onAuthSuccess && onAuthSuccess(null); }} className="border rounded p-2">Guest</button>
          </div>
        </div>
      </div>
    </div>
  );
}
