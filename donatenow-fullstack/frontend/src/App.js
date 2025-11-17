// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import './index.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import CauseDetail from './pages/CauseDetail';
import SuccessStories from './pages/SuccessStories';
import CreateCause from './pages/CreateCause';
import Insights from './pages/Insights';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import axios from 'axios';

function App(){
  const [page, setPage] = useState('home'); // home, auth, cause, create, stories, insights, admin
  const [selectedCauseId, setSelectedCauseId] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dn_user')); } catch(e){ return null; }
  });

  useEffect(()=> {
    AOS.init({ duration: 700, once: true, mirror: false });
  }, []);

  useEffect(()=> {
    if(user) localStorage.setItem('dn_user', JSON.stringify(user));
    else localStorage.removeItem('dn_user');
  }, [user]);

  function handleAuthSuccess(u){
    setUser(u);
    setPage('home');
  }

  // top navbar - using Navbar component with proper avatar
  return (
    <div style={{minHeight:'100vh', background: 'linear-gradient(180deg,#f8fafc,#fff)'}}>
      <Navbar user={user} onNavigate={(p)=>setPage(p)} />


      <main className="container mx-auto px-4 py-8">
        {page === 'home' && <Home user={user} onOpenCause={(id)=>{ setSelectedCauseId(id); setPage('cause'); }} />}
        {page === 'auth' && <AuthPage onAuthSuccess={(u)=>{ handleAuthSuccess(u); }} />}
        {page === 'cause' && <CauseDetail causeId={selectedCauseId} onBack={()=>setPage('home')} user={user} />}
        {page === 'create' && <CreateCause user={user} onCreated={()=>setPage('home')} />}
        {page === 'profile' && <Profile user={user} onBack={()=>setPage('home')} />}
        {page === 'stories' && <SuccessStories />}
        {page === 'insights' && <Insights />}
        {page === 'admin' && <AdminPanel user={user} onOpenCause={(id)=>{ setSelectedCauseId(id); setPage('cause'); }} />}
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">© DonateNow — Built with ❤️</footer>

      <script>
        {`if(window && window.AOS) window.AOS && window.AOS.refresh();`}
      </script>
    </div>
  );
}

export default App;
