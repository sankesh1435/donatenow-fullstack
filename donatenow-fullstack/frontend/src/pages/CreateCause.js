import React, {useState, useRef} from 'react';
import axios from 'axios';

export default function CreateCause({user,onCreated}){
  const [title,setTitle]=useState('');
  const [description,setDescription]=useState('');
  const [goal,setGoal]=useState('');
  const [end,setEnd]=useState('');
  const [photo,setPhoto]=useState(null);
  const [preview,setPreview]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  function pickFile(e){
    const f = e.target.files[0];
    if(!f) return;
    setPhoto(f);
    if(f.type.startsWith('image/')){
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function submit(e){
    e.preventDefault();
    const token = localStorage.getItem('dn_token');
    if(!token){ alert('Login first'); return; }
    
    if(!title || !goal){
      setToast({type:'error', title:'Missing fields', message:'Title and goal amount required'});
      setTimeout(()=>setToast(null), 3000);
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('goal_amount', goal);
    fd.append('end_date', end);
    if(photo) fd.append('photo', photo);
    try{
      await axios.post('http://localhost:4000/api/causes', fd, { headers: { Authorization: 'Bearer '+token, 'Content-Type':'multipart/form-data' } });
      setToast({type:'success', title:'Success!', message:'Cause created successfully'});
      setTimeout(()=>{ setToast(null); onCreated && onCreated(); }, 2000);
    }catch(err){ 
      setToast({type:'error', title:'Error', message: err?.response?.data?.error || 'Failed to create cause'}); 
      setTimeout(()=>setToast(null), 3000);
    } finally {
      setUploading(false);
    }
  }

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
          <button onClick={onClose} style={{background:'transparent', border:'none', color:'#c7c7d2', cursor:'pointer', fontSize:16}}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'24px 16px', background:'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 50%, #e0f2fe 100%)'}}>
      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={()=>setToast(null)} />}

      <div style={{width:'100%', maxWidth:600, background:'white', borderRadius:16, boxShadow:'0 20px 60px rgba(2,6,23,0.12)', overflow:'hidden'}}>
        {/* Header gradient */}
        <div style={{background:'linear-gradient(90deg, #7c3aed, #06b6d4)', color:'white', padding:'24px 24px 16px 24px'}}>
          <h2 style={{fontSize:24, fontWeight:700, margin:0}}>Create a Cause</h2>
          <p style={{fontSize:13, opacity:0.9, marginTop:4}}>Start your fundraising journey today</p>
        </div>

        <form onSubmit={submit} style={{padding:'32px 24px', display:'flex', flexDirection:'column', gap:20}}>
          {/* Title */}
          <div>
            <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'#0f172a'}}>Cause Title *</label>
            <input required placeholder="e.g., Clean Water for Village" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:'12px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, transition:'box-shadow 0.18s, border 0.18s'}} onFocus={(e)=>{e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.borderColor='#6366f1';}} onBlur={(e)=>{e.target.style.boxShadow='none'; e.target.style.borderColor='#e2e8f0';}} />
          </div>

          {/* Description */}
          <div>
            <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'#0f172a'}}>Description</label>
            <textarea placeholder="Tell us about your cause..." value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%', padding:'12px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, fontFamily:'inherit', minHeight:100, transition:'box-shadow 0.18s, border 0.18s', resize:'vertical'}} onFocus={(e)=>{e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.borderColor='#6366f1';}} onBlur={(e)=>{e.target.style.boxShadow='none'; e.target.style.borderColor='#e2e8f0';}} />
          </div>

          {/* Goal & End Date */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div>
              <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'#0f172a'}}>Goal Amount (₹) *</label>
              <input required placeholder="100000" type="number" value={goal} onChange={e=>setGoal(e.target.value)} style={{width:'100%', padding:'12px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, transition:'box-shadow 0.18s, border 0.18s'}} onFocus={(e)=>{e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.borderColor='#6366f1';}} onBlur={(e)=>{e.target.style.boxShadow='none'; e.target.style.borderColor='#e2e8f0';}} />
            </div>
            <div>
              <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'#0f172a'}}>End Date (YYYY-MM-DD)</label>
              <input placeholder="2024-12-31" type="date" value={end} onChange={e=>setEnd(e.target.value)} style={{width:'100%', padding:'12px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, transition:'box-shadow 0.18s, border 0.18s'}} onFocus={(e)=>{e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.borderColor='#6366f1';}} onBlur={(e)=>{e.target.style.boxShadow='none'; e.target.style.borderColor='#e2e8f0';}} />
            </div>
          </div>

          {/* File Uploader with Animation */}
          <div>
            <label style={{display:'block', fontSize:13, fontWeight:600, marginBottom:8, color:'#0f172a'}}>Image / Banner</label>
            <div onClick={()=>fileInputRef.current?.click()} style={{border:'2px dashed #a78bfa', borderRadius:12, padding:32, textAlign:'center', cursor:'pointer', transition:'all 0.22s', background:preview ? 'transparent' : '#f3e8ff'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#7c3aed'; e.currentTarget.style.background='#faf5ff';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor='#a78bfa'; e.currentTarget.style.background=preview ? 'transparent' : '#f3e8ff';}}>
              {preview ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
                  <img src={preview} alt="preview" style={{maxWidth:'100%', maxHeight:160, borderRadius:8}} />
                  <small style={{color:'#64748b'}}>Click to change image</small>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:24, marginBottom:8}}>📸</div>
                  <div style={{fontWeight:600, color:'#0f172a'}}>Upload Image</div>
                  <small style={{color:'#64748b', marginTop:4}}>Drag & drop or click to select</small>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={pickFile} style={{display:'none'}} />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={uploading} style={{background:'linear-gradient(90deg, #7c3aed, #06b6d4)', color:'white', border:'none', padding:'14px 24px', borderRadius:8, fontSize:15, fontWeight:600, cursor:uploading?'not-allowed':'pointer', opacity:uploading?0.7:1, transition:'transform 0.22s, box-shadow 0.22s'}} onMouseEnter={(e)=>{if(!uploading){e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(99,102,241,0.3)';}}} onMouseLeave={(e)=>{if(!uploading){e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none';}}}>{uploading ? '⏳ Creating...' : '✨ Create Cause'}</button>
        </form>
      </div>
    </div>
  );
}
