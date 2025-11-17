import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function Admin({user}){
  const [causes,setCauses]=useState([]);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){ const r = await axios.get('http://localhost:4000/api/causes'); setCauses(r.data); }
  if(!user || user.role!=='admin') return <div>Admin only.</div>;
  return (
    <div>
      <h3 className="font-semibold">Admin Dashboard</h3>
      <div className="mt-4 bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Causes</h4>
        <ul>
          {causes.map(c=>(<li key={c.id}>{c.title} — {c.creator_name} — ₹{Math.round(c.raised_amount)}</li>))}
        </ul>
      </div>
    </div>
  );
}
