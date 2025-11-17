// frontend/src/pages/CauseDetail.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreateStory from './CreateStory';

function ConfettiSmallInline(){
  return (
    <div style={{display:'flex', alignItems:'center', gap:12}}>
      <div className="checkmark">✓</div>
      <div>
        <div style={{fontWeight:700}}>Goal Reached!</div>
        <div style={{fontSize:13, color:'#475569'}}>Thank you to all supporters.</div>
      </div>
    </div>
  );
}

// Simple QR Payment Mock (displays placeholder gradient)
function QRPaymentMock(){
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:16,background:'linear-gradient(135deg,#f3e8ff,#dbeafe)',borderRadius:12}}>
      <div style={{width:160,height:160,background:'linear-gradient(90deg,#a78bfa,#60a5fa)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14}}>UPI QR Code</div>
      <small style={{color:'#64748b'}}>Scan with your UPI app or use: donate@example.upi</small>
    </div>
  );
}

// QR Scanner Mock
function QRScannerMock(){
  const [scanning, setScanning] = useState(false);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <button onClick={()=>setScanning(!scanning)} style={{background:scanning?'#ef4444':'#3b82f6',color:'white',padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600}}>
        {scanning ? '⚫ Scanning...' : '📱 Scan QR'}
      </button>
      {scanning && <div style={{fontSize:12,color:'#64748b',textAlign:'center'}}>Hold your device steady over a QR code</div>}
    </div>
  );
}

/* Lightweight Toast/Modal component for success/error messages */
function Toast({type='info', title, message, onClose}) {
  const color = type === 'error' ? '#f97316' : type === 'success' ? '#10b981' : '#6366f1';
  return (
    <div style={{
      position:'fixed', right:20, top:20, zIndex:9999,
      background:'#0f172a', color:'#fff', padding:18, minWidth:320, borderRadius:12, boxShadow:'0 12px 30px rgba(2,6,23,0.35)'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{width:12, height:12, borderRadius:999, background:color}} />
        <div style={{flex:1}}>
          <div style={{fontWeight:700}}>{title}</div>
          <div style={{fontSize:13, opacity:0.9, marginTop:6}}>{message}</div>
        </div>
        <button onClick={onClose} style={{
          background:'transparent', border:'none', color:'#c7c7d2', cursor:'pointer', fontSize:16
        }}>✕</button>
      </div>
    </div>
  );
}

export default function CauseDetail({ causeId, onBack, user }) {
  const [data, setData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showQR, setShowQR] = useState(false);

  // toast state
  const [toast, setToast] = useState(null);

  useEffect(()=> { if(causeId) load(); }, [causeId]);

  async function load(){
    try{
      const r = await axios.get(`http://localhost:4000/api/causes/${causeId}`);
      setData(r.data);
    } catch(err){
      console.error(err);
      setToast({ type:'error', title:'Load error', message: err?.response?.data?.error || err.message || 'Unable to load cause' });
      setData(null);
    }
  }

  async function donate(ev){
    ev.preventDefault();
    const f = ev.target;
    const name = f.name.value || 'Anonymous';
    const amount = Number(f.amount.value);
    const message = f.message.value;
    const place = (f.place && f.place.value) ? f.place.value : null;

    if(!amount || amount <= 0) {
      setToast({type:'error', title:'Invalid amount', message:'Please enter a donation amount greater than zero.'});
      return;
    }

    setProcessing(true);
    try{
      const token = localStorage.getItem('dn_token');
      const headers = token ? { Authorization: 'Bearer '+token } : {};
      // POST donation - NOTE: endpoint must accept { name, amount, message, place }
      const res = await axios.post(`http://localhost:4000/api/causes/${causeId}/donate`, { name, amount, message, place }, { headers });

      // expected: success body, maybe { goalReached: bool, donation }
      const successMsg = res?.data?.message || 'Donation recorded. Thank you!';
      setToast({type:'success', title:'Thanks!', message: successMsg});
      // reload cause data to show new totals & donation list
      await load();
    } catch (err) {
      console.error('donate error', err);
      // prefer server-provided error message
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || null;
      const status = err?.response?.status;
      const friendly = serverMsg || (status ? `Server returned ${status}` : err.message || 'Donate error');
      setToast({type:'error', title:'Donate error', message: friendly});
    } finally {
      setProcessing(false);
      // auto-dismiss toast after 6s
      setTimeout(()=> setToast(null), 6000);
    }
  }

  async function handleDelete(){
    if(!confirm('Delete this cause?')) return;
    const token = localStorage.getItem('dn_token');
    try{
      await axios.delete(`http://localhost:4000/api/causes/${causeId}`, { headers: { Authorization: 'Bearer '+token }});
      setToast({type:'success', title:'Deleted', message:'Cause deleted'});
      onBack && onBack();
    }catch(err){ setToast({type:'error', title:'Delete failed', message: err?.response?.data?.error || err.message}); }
    setTimeout(()=> setToast(null), 5000);
  }

  if(!data) return (
    <div style={{padding:'40px 20px', textAlign:'center', minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <div style={{marginBottom:'24px'}}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'conic-gradient(#7c3aed 0deg, #06b6d4 90deg, #f97316 180deg, #7c3aed 360deg)',
          animation: 'spin 1.5s linear infinite',
          marginBottom: '16px'
        }} />
        <div style={{fontSize: 18, fontWeight: 600, color: '#334155', marginTop: '16px'}}>Loading Cause Details...</div>
        <div style={{fontSize: 12, color: '#94a3b8', marginTop: '8px'}}>Please wait</div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  const { cause, donations } = data;
  const raised = Number(cause.raised_amount || 0);
  const goal = Number(cause.goal_amount || 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised/goal)*100)) : 0;
  const isCreatorOrAdmin = user && (user.role==='admin' || user.id === cause.creator_id);

  return (
    <div style={{padding:'24px 8px'}}>
      { toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={()=>setToast(null)} /> }

      <button onClick={onBack} className="text-sm mb-4 text-indigo-700">← Back to home</button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow card-animate">
            <h2 className="text-2xl font-bold">{cause.title}</h2>
            <p className="mt-2 text-gray-600">{cause.description}</p>

            <div className="mt-4 flex gap-4">
              <div>
                <div className="text-2xl font-semibold">₹{Math.round(raised)}</div>
                <div className="text-sm text-gray-500">Raised</div>
              </div>
              <div>
                <div className="text-2xl text-green-600 font-semibold">₹{Math.round(goal)}</div>
                <div className="text-sm text-gray-500">Goal</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{donations.length}</div>
                <div className="text-sm text-gray-500">Supporters</div>
              </div>
            </div>

            <div className="progress-grad mt-4">
              <div style={{width: pct+'%', background: 'linear-gradient(90deg,#34d399,#06b6d4)'}}>{pct}% Funded</div>
            </div>

            {pct >= 100 ? (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <ConfettiSmallInline />
              </div>
            ) : (
              <p className="mt-2 text-gray-500">₹{Math.round(goal-raised)} needed to reach goal</p>
            )}
          </div>

          <div className="bg-white p-6 mt-4 rounded shadow card-animate">
            <h4 className="font-semibold text-center mb-4">Make a Difference Today</h4>
            <form onSubmit={donate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-500">Your name</label>
                <input name="name" className="w-full border px-3 py-2 rounded" placeholder="Enter name or Anonymous"/>
              </div>
              <div>
                <label className="block text-sm font-500">Amount (INR)</label>
                <input name="amount" type="number" min="1" required className="w-full border px-3 py-2 rounded"/>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-500">Place (city / area) — optional</label>
                <div className="flex gap-2">
                  <input name="place" id="donor_place" className="w-full border px-3 py-2 rounded" placeholder="e.g., Bangalore, India or '12.97,77.59'" />
                  <button type="button" onClick={async ()=>{
                    if(!navigator.geolocation){ setToast({type:'error', title:'Location', message:'Geolocation not supported by your browser'}); return; }
                    try {
                      const p = await new Promise((res, rej)=> navigator.geolocation.getCurrentPosition(res, rej, {timeout:8000}));
                      const val = p.coords.latitude.toFixed(5)+','+p.coords.longitude.toFixed(5);
                      document.getElementById('donor_place').value = val;
                    } catch(e){ setToast({type:'error', title:'Location', message:'Unable to detect location'}); }
                    setTimeout(()=> setToast(null), 3500);
                  }} className="px-3 py-2 border rounded">Detect</button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-500">Message (optional)</label>
                <textarea name="message" rows="2" className="w-full border px-3 py-2 rounded" placeholder="Leave a message of support"></textarea>
              </div>

              <div className="md:col-span-2 text-center">
                <button disabled={processing} type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition">
                  {processing ? 'Processing...' : 'Donate Now'}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-gray-500">Quick amounts</small>
              <div className="flex gap-2 justify-center mt-2">
                <button onClick={(e)=>{ e.preventDefault(); e.target.closest('form').amount.value = 500; }} className="px-3 py-1 border rounded hover:bg-indigo-50 transition">₹500</button>
                <button onClick={(e)=>{ e.preventDefault(); e.target.closest('form').amount.value = 1000; }} className="px-3 py-1 border rounded hover:bg-indigo-50 transition">₹1000</button>
                <button onClick={(e)=>{ e.preventDefault(); e.target.closest('form').amount.value = 2000; }} className="px-3 py-1 border rounded hover:bg-indigo-50 transition">₹2000</button>
              </div>
            </div>
          </div>

          {/* Payment Options: QR + Scanner */}
          <div className="bg-white p-6 mt-4 rounded shadow card-animate">
            <h4 className="font-semibold mb-4">Alternative Payment Methods</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-500 mb-3">UPI Payment</h5>
                <QRPaymentMock />
              </div>
              <div>
                <h5 className="font-500 mb-3">Scan QR Code</h5>
                <QRScannerMock />
              </div>
            </div>
          </div>

          {/* Feedback / Testimonials */}
          <div className="bg-white p-6 mt-4 rounded shadow card-animate">
            <h4 className="font-semibold mb-4">Share Your Feedback</h4>
            <form onSubmit={(e)=>{ e.preventDefault(); setFeedback(''); setToast({type:'success', title:'Thanks!', message:'Your feedback helps us improve'}); setTimeout(()=>setToast(null),3000); }} className="space-y-3">
              <textarea value={feedback} onChange={(e)=>setFeedback(e.target.value)} rows="3" className="w-full border px-3 py-2 rounded" placeholder="Tell us how this cause impacted you..."></textarea>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Submit Feedback</button>
            </form>
          </div>

          <div className="bg-white p-4 mt-4 rounded shadow">
            <h4 className="font-semibold">Recent Donations</h4>
            {donations.length === 0 ? <p className="text-gray-500">No donations yet — be the first!</p> :
              <ul className="mt-2 space-y-2">
                {donations.map((d,i)=>(
                  <li key={i} className="border rounded p-2">
                    <div className="flex justify-between"><strong>{d.donor_name||'Anonymous'}</strong><small className="text-gray-500">{new Date(d.timestamp).toLocaleString()}</small></div>
                    <div>₹{Math.round(d.amount)} {d.message ? <span className="text-sm text-gray-600">— {d.message}</span> : null}</div>
                    {d.place && <div className="text-xs text-gray-500 mt-1">Place: {d.place}</div>}
                  </li>
                ))}
              </ul>}
          </div>
        </div>

        <div>
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold">Actions</h5>
            <div className="mt-3">
              <button onClick={()=>{ navigator.clipboard.writeText(window.location.href); setToast({type:'success', title:'Copied', message:'Link copied to clipboard'}); setTimeout(()=>setToast(null),2500); }} className="w-full py-2 rounded border hover:bg-gray-50 transition" style={{fontWeight: 500}}>📋 Copy Link</button>
              {isCreatorOrAdmin && (
                <button 
                  onClick={handleDelete} 
                  className="w-full py-2 mt-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  style={{fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                  🗑️ Delete Cause
                </button>
              )}
              {pct >= 100 && isCreatorOrAdmin && (
                <button 
                  onClick={()=>setShowCreate(true)} 
                  className="w-full py-2 mt-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  style={{fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                  ✨ Create Success Story
                </button>
              )}
              {!isCreatorOrAdmin && user && (
                <div style={{fontSize: 12, color: '#94a3b8', marginTop: '12px', textAlign: 'center', padding: '8px', background: '#f1f5f9', borderRadius: '4px'}}>
                  Only creator or admin can delete this cause
                </div>
              )}
            </div>
          </div>

          {showCreate && <div className="mt-4"><CreateStory causeId={causeId} onDone={()=>{ setShowCreate(false); window.location.hash='#/stories'; }} /></div>}
        </div>
      </div>
    </div>
  );
}
