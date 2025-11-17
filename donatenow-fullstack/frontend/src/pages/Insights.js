// frontend/src/pages/Insights.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

// leaflet icon fix for CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper: try to extract lat/lng from a transaction object
function extractLatLngFromTx(tx){
  // Candidate keys to check
  const candidates = ['place', 'location', 'coords', 'donor_place', 'donor_location', 'location_coords', 'latlng'];
  // 1) check combined string "lat,lng" or "lat, lng"
  for(const k of candidates){
    if(tx[k] && typeof tx[k] === 'string'){
      const s = tx[k].trim();
      // match "-?digits(.digits) , -?digits(.digits)"
      const m = s.match(/^\s*([-+]?\d{1,3}(?:\.\d+)?)[\s,;]+([-+]?\d{1,3}(?:\.\d+)?)\s*$/);
      if(m){
        const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
        if(!Number.isNaN(lat) && !Number.isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [lat, lng];
      }
    }
  }

  // 2) check separate numeric fields like tx.lat & tx.lng or tx.latitude & tx.longitude
  const latKeys = ['lat','latitude','latitud','location_lat','place_lat'];
  const lngKeys = ['lng','lon','longitude','location_lng','place_lng'];
  for(const lk of latKeys){
    for(const rk of lngKeys){
      if(typeof tx[lk] === 'number' && typeof tx[rk] === 'number'){
        return [tx[lk], tx[rk]];
      }
      if(typeof tx[lk] === 'string' && typeof tx[rk] === 'string'){
        const lat = parseFloat(tx[lk]), lng = parseFloat(tx[rk]);
        if(!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
      }
    }
  }

  // 3) check nested object like tx.location = {lat:.., lng:..}
  if(tx.location && typeof tx.location === 'object'){
    const l = tx.location;
    if((l.lat || l.latitude) && (l.lng || l.lon || l.longitude)){
      const lat = parseFloat(l.lat || l.latitude), lng = parseFloat(l.lng || l.lon || l.longitude);
      if(!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
    }
  }

  // nothing found
  return null;
}

// Hook to fit map to bounds when markers change
function FitBounds({ positions }){
  const map = useMap();
  useEffect(()=>{
    if(!map) return;
    if(!positions || positions.length === 0){
      // optionally reset view to India
      map.setView([20.5937,78.9629], 5);
      return;
    }
    const bounds = L.latLngBounds(positions.map(p=>L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40,40] });
  }, [map, positions]);
  return null;
}

export default function Insights(){
  const [summary, setSummary] = useState([]);
  const [selectedCause, setSelectedCause] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [positions, setPositions] = useState([]);
  const mapRef = useRef(null);

  useEffect(()=>{ loadSummary(); }, []);

  async function loadSummary(){
    try {
      const s = await axios.get('http://localhost:4000/api/analytics/summary');
      setSummary(s.data || []);
    } catch (e){
      console.error('analytics load failed', e);
      setSummary([]);
    }
  }

  async function onBarClick(evt, elements){
    if(!elements.length) return;
    const idx = elements[0].index;
    const cause = summary[idx];
    if(!cause) return;
    setSelectedCause(cause);
    await loadTransactions(cause.id);
  }

  async function loadTransactions(causeId){
    try {
      const r = await axios.get(`http://localhost:4000/api/causes/${causeId}/transactions`);
      const txs = r.data || [];
      setTransactions(txs);

      // parse lat/lngs
      const pos = [];
      txs.forEach((t,i)=>{
        const p = extractLatLngFromTx(t);
        if(p) pos.push(p);
      });

      console.log('[Insights] loaded transactions:', txs);
      console.log('[Insights] parsed positions:', pos);

      setPositions(pos);
    } catch(err){
      console.error('loadTransactions err', err);
      setTransactions([]);
      setPositions([]);
    }
  }

  const labels = summary.map(s=>s.title);
  const data = { labels, datasets: [{ label: 'Donations (INR)', data: summary.map(s=>s.total||0), backgroundColor: 'rgba(59,130,246,0.85)' }] };
  const options = {
    plugins: { legend:{ display:false }, title:{ display:true, text:'Donations per Cause' } },
    onClick: (evt, elements) => { onBarClick(evt, elements); },
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Impact Insights</h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <Bar data={data} options={options} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow" style={{minHeight:360}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h4 className="font-semibold">Donors for: {selectedCause ? selectedCause.title : '— select a bar'}</h4>
            {selectedCause && <button className="px-3 py-1 border rounded" onClick={()=>{
              // export CSV (simple)
              const rows = transactions.map(t => ({
                donor: t.donor_name || t.user_name || t.name || 'Anonymous',
                amount: t.amount,
                message: t.message || '',
                place: t.place || t.location || t.coords || '',
                timestamp: t.timestamp || t.date || t.createdAt || ''
              }));
              if(rows.length === 0) return alert('No data');
              const csv = [Object.keys(rows[0]).join(','),
                ...rows.map(r => Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
              const blob = new Blob([csv], {type:'text/csv'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `${selectedCause.title.replace(/\s+/g,'_')}_donors.csv`; a.click();
              URL.revokeObjectURL(url);
            }}>Export CSV</button>}
          </div>

          {selectedCause ? (
            <div style={{marginTop:12}}>
              {transactions.length === 0 ? <p className="text-gray-500">No transactions recorded for this cause.</p> :
                <ol className="list-decimal pl-5">
                  {transactions.map((t,i)=>(
                    <li key={i} className="mb-2">
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div>
                          <strong>{t.donor_name || t.user_name || t.name || 'Anonymous'}</strong>
                          <div className="text-sm text-gray-600">₹{Math.round(t.amount)} • {new Date(t.timestamp || t.createdAt || t.date).toLocaleString()}</div>
                          {t.message && <div className="mt-1 text-sm">{t.message}</div>}
                          <div className="mt-1 text-xs text-gray-500">Raw place: {t.place || t.location || t.coords || (t.lat && t.lng ? `${t.lat},${t.lng}` : '—')}</div>
                        </div>
                        <div className="text-sm text-gray-500">{t.status || ''}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              }
            </div>
          ) : <p className="text-gray-500">Click any bar in the chart to view all donors for that cause.</p>}
        </div>

        <div className="bg-white p-4 rounded shadow" style={{minHeight:360}}>
          <h4 className="font-semibold mb-2">Map View</h4>
          <div style={{height:300}}>
            <MapContainer center={[20.5937,78.9629]} zoom={5} style={{height:'100%', width:'100%'}} whenCreated={m=>mapRef.current = m}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Fit bounds to positions */}
              <FitBounds positions={positions} />
              {positions.map((p,idx)=>(
                <Marker key={idx} position={[p[0], p[1]]}>
                  <Popup>
                    <div><strong>{transactions[idx]?.donor_name || transactions[idx]?.name || 'Anonymous'}</strong></div>
                    <div>₹{Math.round(transactions[idx]?.amount || 0)}</div>
                    {transactions[idx]?.message && <div style={{fontSize:12}}>{transactions[idx].message}</div>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="mt-2 text-xs text-gray-500">Markers are plotted only when the donation record contains coordinates (e.g., "12.97,77.59" or separate lat/lng fields).</div>
        </div>
      </div>
    </div>
  );
}
