// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ConfettiSmall(){
  return (
    <div className="confetti-wrap" aria-hidden>
      <div className="confetti" role="presentation">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}

export default function Home({ user, onOpenCause }) {
  const [causes, setCauses] = useState([]);
  const [quotes] = useState([
    "A small gift can transform a life.",
    "Generosity is the heart of humanity.",
    "Give hope. Build futures.",
    "You make change possible."
  ]);

  // Quote slider (colorful, animated)
  function QuoteSlider({ items }){
    const [idx, setIdx] = useState(0);
    useEffect(()=>{
      const t = setInterval(()=> setIdx(i=> (i+1)%items.length), 3600);
      return ()=> clearInterval(t);
    },[items.length]);
    const colors = ['#ff7c7c','#ffd36e','#7ce6c5','#9ad0ff','#d8b4fe'];
    return (
      <div className="my-6" data-aos="fade-up">
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,borderRadius:12,background:'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',backdropFilter:'blur(6px)'}}>
          <div style={{width:14,height:14, borderRadius:999, background: colors[idx % colors.length], marginRight:12}} />
          <div style={{fontSize:20, fontWeight:700, color:'#0f172a', textAlign:'center'}}>{items[idx]}</div>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12}}>
          {items.map((q,i)=> (
            <div key={i} onClick={()=>setIdx(i)} style={{width:10,height:10,borderRadius:999, background: i===idx? '#0ea5a4':'#e2e8f0', cursor:'pointer'}} />
          ))}
        </div>
      </div>
    );
  }

  useEffect(()=> { fetchCauses(); }, []);

  async function fetchCauses(){
    try {
      const res = await axios.get('http://localhost:4000/api/causes');
      setCauses(res.data || []);
    } catch (err) {
      console.error('Fetch causes error', err);
      setCauses([]);
    }
  }

  function short(txt, n=110){ return txt ? (txt.length>n? txt.slice(0,n)+'...': txt) : ''; }

  const active = (causes || []).filter(c => c.active === 1 || c.active === true);
  const completed = (causes || []).filter(c => !(c.active === 1 || c.active === true));

  async function handleDelete(e, id){
    e.stopPropagation();
    if(!confirm('Delete this cause?')) return;
    const token = localStorage.getItem('dn_token');
    try{
      await axios.delete(`http://localhost:4000/api/causes/${id}`, { headers: { Authorization: 'Bearer '+token }});
      fetchCauses();
      alert('Deleted');
    }catch(err){ alert(err?.response?.data?.error || 'Delete failed'); }
  }

  async function toggleLike(e, id){
    e.stopPropagation();
    const token = localStorage.getItem('dn_token');
    if(!token) return alert('Login to like');
    try {
      await axios.post(`http://localhost:4000/api/causes/${id}/like`, {}, { headers:{ Authorization: 'Bearer '+token }});
      fetchCauses();
    } catch (err) {
      console.error(err);
    }
  }

  function placeholderBg(id){ const colors=['#f97316','#06b6d4','#60a5fa','#34d399','#fb7185']; return colors[id % colors.length]; }

  return (
    <div>
      {/* Main Hero Section with Animated Gradient Background */}
      <section
        aria-label="Homepage hero section with animated background"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: '600px',
          height: '100vh',
          maxHeight: '700px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          position: 'relative'
        }}
      >
        {/* Animated particles/blobs */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '10%',
          left: '10%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          bottom: '15%',
          right: '10%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          top: '50%',
          right: '5%',
          animation: 'float 7s ease-in-out infinite'
        }} />

        {/* Dark overlay for better text visibility */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white',
          textShadow: '3px 3px 20px rgba(0,0,0,0.6)',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 800,
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            Make a Real Difference
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            fontWeight: 400,
            margin: 0,
            maxWidth: '800px',
            lineHeight: 1.6
          }}>
            Every donation creates meaningful change in people's lives
          </p>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-30px);
            }
          }
        `}</style>
      </section>

      {/* Lottie Animation with Rotating Quotes */}
      <div className="container mx-auto px-4 py-20 flex flex-col items-center relative overflow-hidden">
        {/* Lottie animation overlay */}
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest"></script>
        <lottie-player 
          src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json" 
          background="transparent" 
          speed="0.5" 
          style={{width: '300px', height: '300px', position: 'absolute', top: '40px', right: '40px', opacity: '0.2', pointerEvents: 'none'}} 
          loop="" 
          autoPlay={true}
        />

        {/* Rotating Quotes */}
        <div id="hero-quotes" style={{
          maxWidth: '56rem',
          textAlign: 'center',
          fontSize: 'clamp(1.875rem, 2.5vw, 2.25rem)',
          fontWeight: 600,
          letterSpacing: '-0.025em',
          filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.04))',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Quotes will rotate here */}
        </div>
      </div>

      <div className="rounded-xl p-6 mb-8" style={{background:'linear-gradient(90deg,#7c3aed,#06b6d4)', color:'white'}}>
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Inspire action. Donate today.</h1>
            <p className="mt-2 hero-quote">Small acts build hopeful tomorrows — be the spark.</p>
            <div className="mt-4 text-lg italic" id="hero-rotator">{quotes[0]}</div>
          </div>
          <div style={{width:220}}>
            <ConfettiSmall />
          </div>
        </div>
      </div>

  {/* Animated quotations slider */}
  <QuoteSlider items={["Inspire • Act • Transform","Be the spark of change","Together we turn hope into impact"]} />

  <h2 className="text-2xl font-semibold mb-4">Active Causes</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {active.map(c => (
          <div 
            key={c.id} 
            className="bg-white p-4 rounded-xl card-animate cursor-pointer" 
            data-aos="fade-up" 
            onClick={()=>onOpenCause && onOpenCause(c.id)}
            style={{
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
            }}
          >
            <div style={{height:160, borderRadius:10, overflow:'hidden', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {c.photo ? <img src={'http://localhost:4000'+c.photo} className="w-full h-full" alt="" style={{objectFit:'cover'}} /> :
                <div className="color-placeholder" style={{background: placeholderBg(c.id)}}>No Image</div>}
            </div>
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{short(c.description,120)}</p>

            <div className="mt-3 flex items-center justify-between">
              <div style={{flex:1, marginRight:8}}>
                <div className="progress-grad">
                  <div style={{
                    width: `${Math.min(100, Math.round((c.raised_amount/(c.goal_amount||1))*100))}%`,
                    background:'linear-gradient(90deg,#34d399,#06b6d4)',
                    transition:'width 1.6s',
                  }}>{Math.min(100, Math.round((c.raised_amount/(c.goal_amount||1))*100))}%</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">₹{Math.round(c.raised_amount)} raised • Goal ₹{Math.round(c.goal_amount)}</div>
              </div>

              <div style={{display:'flex',flexDirection:'column', gap:8}}>
                <div className="flex gap-2">
                  <button aria-label="like" onClick={(e)=>toggleLike(e,c.id)} className="heart">♥</button>
                  {(user && (user.role==='admin' || user.id === c.creator_id)) && <button onClick={(e)=>handleDelete(e,c.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>}
                </div>
                <div className="text-xs text-gray-400">Supporters: {c.donation_count || 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Completed Causes</h2>
      {completed.length === 0 ? <p className="text-gray-500">No completed causes yet.</p> : (
        <div className="grid md:grid-cols-3 gap-6">
          {completed.map(c => (
            <div 
              key={c.id} 
              className="p-4 rounded-xl shadow-lg cursor-pointer" 
              data-aos="zoom-in-up" 
              style={{
                background:'#8a755fff',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(249, 115, 22, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{height:140, overflow:'hidden', borderRadius:8}}>
                {c.photo ? <img src={'http://localhost:4000'+c.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} /> :
                  <div className="color-placeholder" style={{background:placeholderBg(c.id)}}>No Media</div>}
              </div>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="text-sm text-gray-700">{short(c.description,120)}</p>
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm text-green-700 font-semibold">Goal reached ₹{Math.round(c.raised_amount)}</div>
                {(user && (user.role==='admin' || user.id===c.creator_id)) ? (
                  <button onClick={()=>onOpenCause && onOpenCause(c.id)} className="px-3 py-1 bg-green-600 text-white rounded">Create Story</button>
                ) : <div className="badge" style={{background:'#f1f5f9'}}>Completed</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <script dangerouslySetInnerHTML={{__html: `
        (function(){
          const quotes = ${JSON.stringify(quotes)};
          const lotties = [
            "Why we donate?",
            "Transform lives today",
            "Be the change",
            "Make an impact now"
          ];
          let idx = 0;
          const el = document.getElementById('hero-rotator');
          const lottieQuotes = document.getElementById('hero-quotes');
          
          if(el) {
            setInterval(()=>{ 
              idx=(idx+1)%quotes.length; 
              el.style.opacity=0; 
              setTimeout(()=>{ 
                el.innerText=quotes[idx]; 
                el.style.opacity=1; 
              }, 200); 
            }, 3500);
          }

          if(lottieQuotes) {
            let lottieIdx = 0;
            lottieQuotes.innerText = lotties[0];
            lottieQuotes.style.transition = 'opacity 0.4s ease-in-out';
            setInterval(()=>{ 
              lottieIdx=(lottieIdx+1)%lotties.length; 
              lottieQuotes.style.opacity=0; 
              setTimeout(()=>{ 
                lottieQuotes.innerText=lotties[lottieIdx]; 
                lottieQuotes.style.opacity=1; 
              }, 200); 
            }, 4000);
          }
        })();
      `}} />
    </div>
  );
}
