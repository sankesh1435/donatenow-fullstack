// frontend/src/pages/CreateStory.js
import React, { useState } from 'react';
import axios from 'axios';

export default function CreateStory({ causeId, onDone }) {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  function pickFile(e){
    const f = e.target.files[0];
    if(!f) return;
    setMedia(f);
    if(f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function submit(e){
    e.preventDefault();
    if(!title || !story) return alert('Title and story required');
    setBusy(true);
    try{
      const fd = new FormData();
      fd.append('cause_id', String(causeId));
      fd.append('title', title);
      fd.append('story', story);
      if(media) fd.append('media', media);
      const token = localStorage.getItem('dn_token');
      const headers = token ? { Authorization: 'Bearer '+token } : {};
      const res = await axios.post('http://localhost:4000/api/stories', fd, { headers, maxBodyLength: Infinity });
      alert('Story created');
      onDone && onDone(res.data.story);
    }catch(err){ alert(err?.response?.data?.error || 'Upload failed'); }
    setBusy(false);
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">Create Success Story</h4>
      <form onSubmit={submit} className="space-y-3 mt-3">
        <input className="w-full border px-3 py-2 rounded" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea rows="5" className="w-full border px-3 py-2 rounded" placeholder="Describe the impact" value={story} onChange={e=>setStory(e.target.value)} required />
        <div>
          <input type="file" accept="image/*,video/*" onChange={pickFile} />
          {preview && <img src={preview} alt="preview" style={{width:'100%',marginTop:8,borderRadius:8}} />}
        </div>
        <div className="flex gap-2">
          <button disabled={busy} className="bg-green-600 text-white px-4 py-2 rounded">{busy ? 'Posting...' : 'Publish Story'}</button>
          <button type="button" onClick={()=>onDone && onDone(null)} className="px-3 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
