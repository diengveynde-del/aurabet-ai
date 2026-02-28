import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * AURABET - CONFIGURATION DE DÉPLOIEMENT
 * Les variables sont lues depuis l'environnement de l'application.
 */
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: '',
        authDomain: '',
        projectId: 'aurabet-ai-v1',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurabet-default';

// --- ICONS SYSTEM (Inline SVG for speed and reliability) ---
const Icon = React.memo(({ name, className = 'w-6 h-6' }) => {
  const icons = {
    brain: (
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.74-3.68A2.5 2.5 0 0 1 2.5 12 2.5 2.5 0 0 1 4.3 7.56 2.5 2.5 0 0 1 9.5 2Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.74-3.68A2.5 2.5 0 0 0 21.5 12 2.5 2.5 0 0 0 19.7 7.56 2.5 2.5 0 0 0 14.5 2Z" />
    ),
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    wallet: (
      <>
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    activity: (
      <>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </>
    )
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
    </svg>
  );
});

const GlobalStyles = () => (
  <style>{`
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
      background: radial-gradient(circle at top, #1a0525 0%, #020202 60%, #000000 100%);
      color: #f8fafc;
      margin: 0;
      min-height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
      overflow-x: hidden;
    }

    .vibranium-card {
      background: linear-gradient(145deg, rgba(30, 10, 50, 0.4), rgba(10, 10, 10, 0.6));
      border: 1px solid rgba(126, 34, 206, 0.2);
      backdrop-filter: blur(20px);
    }

    @keyframes pulse-aura {
      0% { box-shadow: 0 0 0 0 rgba(126, 34, 206, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(126, 34, 206, 0); }
      100% { box-shadow: 0 0 0 0 rgba(126, 34, 206, 0); }
    }

    .aura-active {
      animation: pulse-aura 2s infinite;
    }

    .neon-text {
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    }
  `}</style>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 720, currency: 'XOF' });
  const [betSlip, setBetSlip] = useState({ active: false, team: 'Dakar SC', odd: 1.85, amount: 1000 });
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // --- Auth Lifecycle ---
  useEffect(() => {
    const startAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Nexus Auth Fail:', err);
      }
    };

    startAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- Profile Sync (Real-time Firestore) ---
  useEffect(() => {
    if (!user) return undefined;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');

    const unsubscribe = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) setProfile(snap.data());
        else setDoc(profileRef, { balance: 15000, auraScore: 720, currency: 'XOF' });
      },
      (err) => console.error('Firestore Sync Error:', err)
    );

    return () => unsubscribe();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePlaceBet = async () => {
    if (!user) return;
    if (betSlip.amount > profile.balance) return showToast('Quantum Balance Insuffisant !');

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');

    try {
      await setDoc(profileRef, { 
        ...profile, 
        balance: profile.balance - betSlip.amount,
        auraScore: profile.auraScore + Math.floor(betSlip.amount / 500)
      }, { merge: true });
      
      showToast("Pari validé par l'IA Aura");
      setBetSlip({ ...betSlip, active: false });
    } catch (e) {
      showToast("Échec de la transaction Nexus");
    }
  };

  if (!user)
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-[#7e22ce]">
        <GlobalStyles />
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Initialisation du Nexus...</span>
      </div>
    );

  return (
    <div className="min-h-screen pb-32">
      <GlobalStyles />
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-[#7e22ce]/20 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
            AURA<span className="text-[#7e22ce]">BET</span>
          </h1>
          <span className="text-[7px] text-[#22d3ee] font-bold uppercase tracking-[0.4em] mt-1">AI Prediction Nexus</span>
        </div>
        <div className="vibranium-card px-5 py-2 rounded-2xl flex flex-col items-end border border-[#fbbf24]/20">
          <span className="text-[7px] uppercase font-black text-[#fbbf24] mb-1">Balance</span>
          <span className="text-sm font-black text-white">{profile.balance.toLocaleString()} <span className="text-[9px] opacity-60 text-[#fbbf24]">{profile.currency}</span></span>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {/* DASHBOARD STATUS */}
        <section className="vibranium-card p-6 rounded-[2rem] flex items-center justify-between border-l-4 border-[#22d3ee]">
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Aura Score Personnel</p>
            <h2 className="text-3xl font-black italic neon-text text-[#22d3ee]">{profile.auraScore}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#22d3ee]" style={{ width: `${Math.min((profile.auraScore/1000)*100, 100)}%` }}></div>
              </div>
              <span className="text-[8px] font-bold opacity-40 italic">Niveau Elite</span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-full border-2 border-[#22d3ee]/30 flex items-center justify-center aura-active bg-[#22d3ee]/5">
            <Icon name="activity" className="text-[#22d3ee]" />
          </div>
        </section>

        {/* AI ADVISOR PREDICTION */}
        <section className="bg-gradient-to-br from-[#121212] to-black p-8 rounded-[2.5rem] border border-[#7e22ce]/30 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 text-[#7e22ce]/10 group-hover:text-[#7e22ce]/20 transition-all duration-700 rotate-12">
            <Icon name="brain" className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-6 text-[#fbbf24]">
            <Icon name="zap" className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest">Calculateur de Flux Quantique</span>
          </div>
          <p className="text-xl font-bold italic leading-tight mb-8 relative z-10 text-white/90">
            "Nexus détecte une anomalie positive : <span className="text-[#22d3ee]">Dakar SC</span> possède un indice de confiance de <span className="text-[#7e22ce]">92.4%</span>."
          </p>
          <button 
            onClick={() => setBetSlip({ ...betSlip, active: true, team: 'Dakar SC (IA)', odd: 2.15 })}
            className="w-full bg-[#7e22ce] hover:bg-[#9333ea] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-purple-900/40 border border-white/10"
          >
            Suivre l'algorithme Aura
          </button>
        </section>

        {/* LIVE FEED PLACEHOLDER */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Flux Live CAF</h3>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="text-[9px] text-red-500 font-black">SYNC EN COURS</span>
            </span>
          </div>
          <div className="vibranium-card rounded-[2.5rem] p-10 text-center border border-dashed border-white/10">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-20 italic">Initialisation des flux API-Sports...</p>
          </div>
        </div>
      </main>

      {/* TOAST MESSAGE */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] px-8 py-3 rounded-full z-[100] text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce border border-white/20">
          {toast}
        </div>
      )}

      {/* NAVIGATION BAR */}
      <footer className="fixed bottom-0 inset-x-0 bg-[#020202]/90 backdrop-blur-2xl border-t border-white/5 p-4 pb-10 flex justify-around items-center z-40">
        {[
          {id: 'home', icon: 'grid'}, 
          {id: 'live', icon: 'zap'}, 
          {id: 'shield', icon: 'shield'}, 
          {id: 'wallet', icon: 'wallet'}, 
          {id: 'profile', icon: 'user'}
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-[#7e22ce] scale-110' : 'opacity-20 hover:opacity-50'}`}
          >
            <Icon name={item.icon} className="w-5 h-5" />
            <span className="text-[6px] font-black uppercase italic">{item.id}</span>
          </button>
        ))}
      </footer>

      {/* BET SLIP MODAL */}
      {betSlip.active && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="vibranium-card w-full max-w-md p-8 rounded-[3.5rem] shadow-2xl relative border-t-4 border-t-[#7e22ce] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#22d3ee] uppercase tracking-[0.4em] mb-1">Confirmation Quantum</span>
                <span className="text-[7px] text-white/30 uppercase font-bold italic tracking-widest">Protocol Version A-11</span>
              </div>
              <button onClick={() => setBetSlip({ ...betSlip, active: false })} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <Icon name="x" className="text-white/60 w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[8px] text-[#7e22ce] font-black uppercase tracking-widest mb-1 italic">Sélection</p>
                  <p className="text-2xl font-black italic uppercase text-white tracking-tighter">{betSlip.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-[#fbbf24] font-black uppercase tracking-widest mb-1">Cote Nexus</p>
                  <p className="text-2xl font-black text-[#fbbf24] italic">{betSlip.odd.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 p-5 rounded-3xl relative">
                <span className="absolute top-2 left-5 text-[7px] text-[#7e22ce] font-black uppercase tracking-widest">Mise (XOF)</span>
                <input 
                  type="number" 
                  value={betSlip.amount} 
                  onChange={(e) => setBetSlip({...betSlip, amount: Math.max(0, parseInt(e.target.value) || 0)})}
                  className="w-full bg-transparent pt-3 text-2xl font-black outline-none text-white"
                />
              </div>

              <button 
                onClick={handlePlaceBet}
                className="w-full bg-gradient-to-r from-[#7e22ce] to-[#9333ea] py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-purple-900/30"
              >
                Injecter dans le Nexus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;