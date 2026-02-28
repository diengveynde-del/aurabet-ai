import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  X,
  LayoutGrid,
  User,
  Wallet,
  Activity,
  Trophy
} from 'lucide-react';

/**
 * AURABET AI - DESIGN SYSTEM AFROFUTURISTE
 * Cyber-Dakar / Vibranium Theme
 */
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

    .hide-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

// Firebase Initialization
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "", authDomain: "", projectId: "aurabet-ai", storageBucket: "", messagingSenderId: "", appId: "" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurabet-default';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 720, currency: 'XOF' });
  const [activeTab, setActiveTab] = useState('home');
  const [betSlip, setBetSlip] = useState({ active: false, team: '', odd: 1.85, amount: 1000 });
  const [toast, setToast] = useState(null);

  // Auth Lifecycle
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Nexus Auth Error:", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Profile Sync
  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const unsubscribe = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) setProfile(snap.data());
      else setDoc(profileRef, { balance: 15000, auraScore: 720, currency: 'XOF' });
    }, (err) => console.error("Firestore Sync Error:", err));
    return () => unsubscribe();
  }, [user]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePlaceBet = async () => {
    if (betSlip.amount > profile.balance) return triggerToast("Quantum Balance Insuffisant !");
    if (!user) return;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    try {
      await setDoc(profileRef, { 
        ...profile, 
        balance: profile.balance - betSlip.amount,
        auraScore: profile.auraScore + Math.floor(betSlip.amount / 500)
      }, { merge: true });
      
      setBetSlip({ ...betSlip, active: false });
      triggerToast("Pari validé par l'IA Aura");
    } catch (e) {
      triggerToast("Échec de la transaction Nexus");
    }
  };

  if (!user) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <GlobalStyles />
      <div className="w-12 h-12 border-4 border-[#7e22ce] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] uppercase font-black tracking-[0.5em] text-[#7e22ce] animate-pulse">Initialisation du Nexus...</p>
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
                <div className="h-full bg-[#22d3ee]" style={{ width: `${(profile.auraScore/1000)*100}%` }}></div>
              </div>
              <span className="text-[8px] font-bold opacity-40 italic">Niveau Elite</span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-full border-2 border-[#22d3ee]/30 flex items-center justify-center aura-active bg-[#22d3ee]/5">
            <Activity size={24} className="text-[#22d3ee]" />
          </div>
        </section>

        {/* AI ADVISOR PREDICTION */}
        <section className="bg-gradient-to-br from-[#121212] to-black p-8 rounded-[2.5rem] border border-[#7e22ce]/30 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 text-[#7e22ce]/10 group-hover:text-[#7e22ce]/20 transition-all duration-700 rotate-12">
            <BrainCircuit size={180} />
          </div>
          <div className="flex items-center gap-3 mb-6 text-[#fbbf24]">
            <BrainCircuit size={20} className="animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest">Calculateur de Flux Quantique</span>
          </div>
          <p className="text-xl font-bold italic leading-tight mb-8 relative z-10 text-white/90">
            "Nexus détecte une anomalie positive : <span className="text-[#22d3ee]">Dakar SC</span> possède un indice de confiance de <span className="text-[#7e22ce]">92.4%</span> pour la victoire."
          </p>
          <button 
            onClick={() => setBetSlip({ ...betSlip, active: true, team: 'Dakar SC (IA)', odd: 2.15 })}
            className="w-full bg-[#7e22ce] hover:bg-[#9333ea] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-purple-900/40 border border-white/10"
          >
            Suivre l'algorithme Aura
          </button>
        </section>

        {/* LIVE MATCHES */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Flux Live CAF</h3>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="text-[9px] text-red-500 font-black">SYNC EN COURS</span>
            </span>
          </div>
          
          <div className="vibranium-card rounded-[2.5rem] p-6 space-y-6">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-xl font-black italic">DAK</div>
                <div className="text-[8px] uppercase text-white/40 mt-1 font-bold">Dakar SC</div>
              </div>
              <div className="text-4xl font-black italic text-[#7e22ce] neon-text">1 - 0</div>
              <div className="text-center">
                <div className="text-xl font-black italic">CAS</div>
                <div className="text-[8px] uppercase text-white/40 mt-1 font-bold">Casa Sport</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[1.45, 3.20, 6.50].map((odd, i) => (
                <button 
                  key={i}
                  onClick={() => setBetSlip({ active: true, team: i === 0 ? 'Dakar SC' : i === 1 ? 'Nul' : 'Casa Sport', odd, amount: 1000 })}
                  className="bg-white/5 border border-white/5 py-4 rounded-2xl hover:bg-[#7e22ce]/20 transition-all group"
                >
                  <p className="text-[8px] text-white/30 font-black mb-1 uppercase tracking-tighter">{i === 0 ? '1' : i === 1 ? 'N' : '2'}</p>
                  <p className="text-sm font-black group-hover:text-[#22d3ee]">{odd.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] px-8 py-3 rounded-full z-[100] text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce border border-white/20">
          {toast}
        </div>
      )}

      {/* NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 bg-[#020202]/95 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#22d3ee]' : 'text-white/20'}`}>
          <LayoutGrid size={22} /><span className="text-[7px] font-black uppercase italic">Base</span>
        </button>
        <button onClick={() => setActiveTab('live')} className={`flex flex-col items-center gap-1 ${activeTab === 'live' ? 'text-[#22d3ee]' : 'text-white/20'}`}>
          <Zap size={22} /><span className="text-[7px] font-black uppercase italic">Live</span>
        </button>
        <div className="relative -mt-14 scale-110">
          <button className="w-16 h-16 bg-gradient-to-tr from-[#7e22ce] to-[#22d3ee] rounded-full flex items-center justify-center border-[6px] border-[#020202] shadow-2xl active:scale-90 transition-transform">
            <ShieldCheck size={28} className="text-white" />
          </button>
        </div>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 ${activeTab === 'wallet' ? 'text-[#22d3ee]' : 'text-white/20'}`}>
          <Wallet size={22} /><span className="text-[7px] font-black uppercase italic">Wallet</span>
        </button>
        <button onClick={() => setActiveTab('rank')} className={`flex flex-col items-center gap-1 ${activeTab === 'rank' ? 'text-[#22d3ee]' : 'text-white/20'}`}>
          <Trophy size={22} /><span className="text-[7px] font-black uppercase italic">Aura Rank</span>
        </button>
      </nav>

      {/* BET SLIP MODAL */}
      {betSlip.active && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="vibranium-card w-full max-w-md p-8 rounded-[3.5rem] shadow-2xl relative border-t-4 border-t-[#7e22ce]">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#22d3ee] uppercase tracking-[0.4em] mb-1">Confirmation Quantum</span>
                <span className="text-[7px] text-white/30 uppercase font-bold italic tracking-widest">Protocol Version A-11</span>
              </div>
              <button onClick={() => setBetSlip({ ...betSlip, active: false })} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} className="text-white/60" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 p-5 rounded-3xl relative">
                  <span className="absolute top-2 left-5 text-[7px] text-[#7e22ce] font-black uppercase tracking-widest">Mise</span>
                  <input 
                    type="number" 
                    value={betSlip.amount} 
                    onChange={(e) => setBetSlip({...betSlip, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-transparent pt-3 text-2xl font-black outline-none text-white placeholder-white/20"
                  />
                </div>
                <div className="bg-[#7e22ce]/5 border border-[#7e22ce]/20 p-5 rounded-3xl text-center flex flex-col justify-center">
                  <p className="text-[7px] text-[#22d3ee] font-black uppercase tracking-widest mb-1">Gains Estimés</p>
                  <p className="font-black text-xl italic">{(betSlip.amount * betSlip.odd).toFixed(0)} <span className="text-[10px] opacity-40">XOF</span></p>
                </div>
              </div>

              <button 
                onClick={handlePlaceBet}
                className="w-full bg-gradient-to-r from-[#7e22ce] to-[#9333ea] py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:brightness-110 transition-all shadow-xl shadow-purple-900/30 active:scale-95"
              >
                Injecter dans le Nexus
              </button>
              
              <p className="text-[7px] text-center text-white/20 uppercase font-black tracking-widest mt-4">
                Toutes les transactions sont sécurisées par le réseau Aura AI.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}