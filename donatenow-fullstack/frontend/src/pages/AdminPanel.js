// frontend/src/pages/AdminPanel.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function AdminPanel({ user, onOpenCause }){
  const [causes, setCauses] = useState([]);
  useEffect(()=>{ if(user && user.role==='admin') load(); }, [user]);

  async function load(){
    const r = await axios.get('http://localhost:4000/api/causes');
    setCauses(r.data || []);
  }

  async function remove(id){
    if(!confirm('Delete cause?')) return;
    const token = localStorage.getItem('dn_token');
    try{ await axios.delete(`http://localhost:4000/api/causes/${id}`, { headers: { Authorization: 'Bearer '+token } }); load(); alert('Deleted'); }
    catch(err){ alert(err?.response?.data?.error || 'Error'); }
  }

  if(!user || user.role!=='admin') return <div className="text-red-500">Admin only</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Causes</h4>
        <ul>
          {causes.map(c=>(
            <li key={c.id} className="border-b py-2 flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-500">Raised: ₹{Math.round(c.raised_amount)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>onOpenCause && onOpenCause(c.id)} className="px-2 py-1 border rounded">View</button>
                <button onClick={()=>remove(c.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
