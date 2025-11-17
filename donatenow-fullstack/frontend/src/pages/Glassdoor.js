import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Glassdoor(){
  const [data,setData]=useState(null);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){
    const r = await axios.get('http://localhost:4000/api/analytics/summary');
    setData(r.data);
  }
  if(!data) return <div>Loading...</div>;
  const labels = data.map(d=>d.title);
  const totals = data.map(d=>d.total || 0);
  const chart = { labels, datasets: [{ label: 'Donations (INR)', data: totals }] };
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-4">Glassdoor — Analytics</h3>
      <Bar data={chart} />
    </div>
  );
}
