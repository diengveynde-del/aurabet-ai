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
  Wallet
} from 'lucide-react';

/**
 * AURABET - CONFIGURATION & STYLES
 * Design: Afrofuturiste / Cyber-Dakar
 */
const GlobalStyles = () => (
  <style>{`
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
      background: radial-gradient(circle at top, #170321 0%, #020202 55%, #010101 100%);
      color: #f5f5f5;
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .glass {
      background: linear-gradient(130deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
    }

    @keyframes pulse-purple {
      0% { border-color: rgba(126, 34, 206, 0.2); box-shadow: 0 0 0px rgba(126, 34, 206, 0); }
      50% { border-color: rgba(126, 34, 206, 0.8); box-shadow: 0 0 15px rgba(126, 34, 206, 0.3); }
      100% { border-color: rgba(126, 34, 206, 0.2); box-shadow: 0 0 0px rgba(126, 34, 206, 0); }
    }

    .animate-pulse-border {
      animation: pulse-purple 3s infinite;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `}</style>
);

// Firebase Setup
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "", authDomain: "", projectId: "aurabet-ai-v1", storageBucket: "", messagingSenderId: "", appId: "" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurabet-default';

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 750 });
  const [betSlip, setBetSlip] = useState({ active: false, team: 'Dakar SC', odd: 1.85, amount: 1000 });
  const [toast, setToast] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Widget Live Loading
  useEffect(() => {
    const scriptId = 'api-sports-widget';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://widgets.api-sports.io/football/1.1.8/widget.js';
      script.type = 'module';
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Auth Lifecycle
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth Fail:", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const unsubscribe = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) setProfile(snap.data());
      else setDoc(profileRef, { balance: 15000, auraScore: 750 });
    }, (err) => console.error("Sync Error:", err));
    return () => unsubscribe();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const placeBet = async () => {
    if (betSlip.amount > profile.balance) return showToast("Fonds insuffisants !");
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    try {
      await setDoc(profileRef, { ...profile, balance: profile.balance - betSlip.amount }, { merge: true });
      setBetSlip({ ...betSlip, active: false });
      showToast("Pari validé avec succès !");
    } catch (e) { showToast("Erreur de connexion"); }
  };

  if (!user) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-[#7e22ce]">
      <GlobalStyles />
      <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initialisation Quantum...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-32">
      <GlobalStyles />
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
            AURA<span className="text-[#7e22ce]">BET</span>
          </h1>
          <p className="text-[7px] font-bold text-[#22d3ee] uppercase tracking-[0.3em] mt-1">Supremazia AI</p>
        </div>
        <div className="bg-white/5 border border-[#7e22ce]/40 px-5 py-2 rounded-2xl shadow-inner">
          <p className="text-[7px] uppercase font-black text-[#7e22ce] mb-0.5">Disponibilité</p>
          <p className="text-sm font-black text-[#fbbf24]">{profile.balance.toLocaleString()} <span className="text-[8px] opacity-50">XOF</span></p>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-8 mt-4">
        {/* IA PICK CARD */}
        <section className="bg-gradient-to-br from-[#121212] to-black p-8 rounded-[2.5rem] border border-[#7e22ce]/20 animate-pulse-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={140} />
          </div>
          <div className="flex items-center gap-3 mb-6 text-[#fbbf24]">
            <BrainCircuit size={20} />
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Aura Advisor v1.0</span>
          </div>
          <p className="text-xl font-bold italic mb-8 leading-snug">
            "Le flux indique une domination de <span className="text-[#22d3ee]">Hafia FC</span>. Indice de confiance <span className="text-[#7e22ce]">92%</span>."
          </p>
          <button 
            onClick={() => setBetSlip({ ...betSlip, active: true, team: 'Hafia FC' })}
            className="w-full bg-[#7e22ce] py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-purple-900/20"
          >
            Suivre le signal
          </button>
        </section>

        {/* LIVE SCORES */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
            <span>Flux Direct</span>
            <span className="flex items-center gap-2 text-red-500 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> LIVE
            </span>
          </div>
          <div className="bg-white/5 rounded-[2.5rem] p-4 min-h-[400px] border border-white/5 relative">
            <div 
              id="wg-api-football-livescore" 
              data-host="v3.football.api-sports.io" 
              data-key="e43f43300b5b692c2829ea3796642c3d" 
              data-type="livescore" 
              data-theme="dark" 
              className="api_sports_widget"
            ></div>
            {!scriptLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                <Zap size={40} className="animate-bounce" />
                <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-4">Connexion API...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] px-8 py-4 rounded-full z-[100] text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 bg-[#020202]/90 border-t border-white/5 flex justify-around items-center backdrop-blur-2xl z-40">
        <button className="flex flex-col items-center gap-1 text-[#22d3ee]">
          <LayoutGrid size={22} /><span className="text-[6px] font-black uppercase italic">Flux</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-20">
          <Zap size={22} /><span className="text-[6px] font-black uppercase italic">Scores</span>
        </button>
        <div className="relative -mt-14 scale-110">
          <button className="w-16 h-16 bg-gradient-to-tr from-[#7e22ce] to-[#22d3ee] rounded-full flex items-center justify-center border-[6px] border-[#020202] shadow-2xl transition-transform active:scale-90">
            <ShieldCheck size={28} className="text-white" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 opacity-20">
          <Wallet size={22} /><span className="text-[6px] font-black uppercase italic">Banque</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-20">
          <User size={22} /><span className="text-[6px] font-black uppercase italic">Moi</span>
        </button>
      </nav>

      {/* BET MODAL */}
      {betSlip.active && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f0f0f] w-full max-w-md p-8 rounded-[3rem] border border-[#7e22ce]/30 shadow-2xl relative animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-8">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22d3ee]">Validation Coupon</div>
              <button onClick={() => setBetSlip({ ...betSlip, active: false })} className="text-white/20 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-6">
              <p className="text-[8px] text-[#7e22ce] font-black uppercase tracking-widest mb-1">Sélection</p>
              <p className="text-xl font-black italic">{betSlip.team}</p>
              <p className="text-xs font-bold text-[#fbbf24] mt-1">Cote : {betSlip.odd}</p>
            </div>

            <div className="flex gap-3 mb-8">
              <div className="flex-1 bg-black border border-white/10 p-5 rounded-3xl relative">
                <span className="absolute top-2 left-5 text-[7px] text-white/30 font-black uppercase">Mise XOF</span>
                <input 
                  type="number" 
                  value={betSlip.amount} 
                  onChange={(e) => setBetSlip({...betSlip, amount: parseInt(e.target.value) || 0})}
                  className="bg-transparent w-full pt-4 text-2xl font-black outline-none"
                />
              </div>
              <div className="bg-[#7e22ce]/10 border border-[#7e22ce]/20 p-5 rounded-3xl min-w-[120px] text-center">
                <p className="text-[7px] text-[#fbbf24] font-black uppercase mb-1">Retour</p>
                <p className="font-black text-lg">{(betSlip.amount * betSlip.odd).toFixed(0)}</p>
              </div>
            </div>

            <button 
              onClick={placeBet}
              className="w-full bg-[#7e22ce] py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Exécuter la transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;