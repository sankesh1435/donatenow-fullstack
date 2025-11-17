// frontend/src/pages/SuccessStories.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SuccessStories(){
  const [stories, setStories] = useState([]);
  useEffect(()=>{ axios.get('http://localhost:4000/api/stories').then(r=>setStories(r.data)); }, []);

  function bgColor(idx){ const arr=['#fde68a','#bfdbfe','#d1fae5','#fee2e2','#ede9fe','#fef3c7']; return arr[idx % arr.length]; }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Success Stories</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((s,i)=>(
          <div 
            key={s.id} 
            className="bg-white p-3 rounded-xl shadow card-animate cursor-pointer" 
            data-aos="fade-up"
            style={{
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
            }}
          >
            <div style={{height:180, borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background: s.image ? 'transparent' : bgColor(i)}}>
              {s.image ? (
                (s.image.endsWith('.mp4') || s.image.includes('video')) ? (
                  <video src={'http://localhost:4000'+s.image} controls style={{width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  <img src={'http://localhost:4000'+s.image} alt={s.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                )
              ) : (
                <div style={{padding:16, textAlign:'center'}}>
                  <div style={{fontWeight:700, fontSize:18}}>{s.title}</div>
                  <div style={{fontSize:13, marginTop:8}}>{s.name}</div>
                </div>
              )}
            </div>
            <h4 className="mt-3 font-semibold">{s.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{s.story?.slice(0,150)}{s.story && s.story.length>150 ? '...' : ''}</p>
            <div className="mt-2 text-xs text-gray-500">By {s.name} • {new Date(s.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
