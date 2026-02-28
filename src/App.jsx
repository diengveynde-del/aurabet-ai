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
  Activity,
  BrainCircuit,
  CircleDollarSign,
  Coins,
  Landmark,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
  Check,
  X,
  LayoutGrid,
  User
} from 'lucide-react';

/**
 * STYLES GLOBAUX
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
  `}</style>
);

// Configuration Firebase
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurabet-ai-v1';

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 700 });
  const [betSlip, setBetSlip] = useState({ active: false, team: '', odd: 1.85, amount: 1000 });
  const [toast, setToast] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Chargement du Widget API-Sports
  useEffect(() => {
    const scriptId = 'api-sports-widget-script';
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

  // Initialisation Authentification
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erreur d'authentification:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Synchronisation des données (Profil)
  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsubscribe = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setDoc(profileRef, { balance: 15000, auraScore: 700 });
      }
    }, (err) => console.error("Erreur Firestore:", err));
    return () => unsubscribe();
  }, [user]);

  const confirmBet = async () => {
    if (!user || betSlip.amount > profile.balance) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    try {
      await setDoc(profileRef, { ...profile, balance: profile.balance - betSlip.amount }, { merge: true });
      setBetSlip({ ...betSlip, active: false });
      setToast('Pari validé !');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Erreur validation pari:", e);
    }
  };

  if (!user) return (
    <div className="bg-black min-h-screen text-[#7e22ce] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[#7e22ce] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-[10px] tracking-widest">CHARGEMENT...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <GlobalStyles />

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] px-6 py-3 rounded-full z-[100] animate-bounce text-[10px] font-bold shadow-lg shadow-purple-500/20">
          {toast}
        </div>
      )}

      {/* En-tête */}
      <header className="p-6 border-b border-[#7e22ce]/20 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50">
        <h1 className="text-2xl font-black italic uppercase">AURA<span className="text-[#7e22ce]">BET</span></h1>
        <div className="bg-[#111] p-2 px-4 rounded-xl border border-[#7e22ce]/40 text-right">
          <p className="text-[8px] uppercase text-[#7e22ce] font-bold">Solde</p>
          <p className="font-bold text-sm">{profile.balance.toLocaleString()} XOF</p>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <section className="bg-gradient-to-br from-[#121212] to-black p-6 rounded-[2rem] border border-[#7e22ce]/20 animate-pulse-border">
          <div className="flex items-center gap-2 mb-4 text-[#fbbf24]">
            <BrainCircuit size={20} />
            <span className="text-[10px] uppercase font-black tracking-widest">Aura Advisor</span>
          </div>
          <p className="text-lg font-bold italic mb-6">"Analyse IA : Probabilité de victoire domicile à 91%"</p>
          <button
            onClick={() => setBetSlip({ active: true, team: 'IA Pick', odd: 1.85, amount: 1000 })}
            className="w-full bg-[#7e22ce] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
          >
            Suivre l'IA
          </button>
        </section>

        {/* Widget API-Sports */}
        <section className="bg-white/5 rounded-[2rem] p-4 min-h-[400px]">
          <div
            id="wg-api-football-livescore"
            data-host="v3.football.api-sports.io"
            data-key="e43f43300b5b692c2829ea3796642c3d"
            data-type="livescore"
            data-theme="dark"
            className="api_sports_widget"
          ></div>
          {!scriptLoaded && (
            <div className="flex items-center justify-center h-48 text-white/20 text-[10px] uppercase font-bold animate-pulse">
              Synchronisation des flux...
            </div>
          )}
        </section>
      </main>

      {/* Navigation Basse */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/5 flex justify-around items-center backdrop-blur-md z-40">
        <LayoutGrid className="text-[#22d3ee]" size={20} />
        <Zap className="text-white/20" size={20} />
        <div className="w-14 h-14 bg-[#7e22ce] rounded-full -mt-10 flex items-center justify-center border-4 border-[#020202] shadow-xl">
          <ShieldCheck size={28} />
        </div>
        <Wallet className="text-white/20" size={20} />
        <User className="text-white/20" size={20} />
      </nav>

      {/* Modal de Pari */}
      {betSlip.active && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] w-full max-w-md p-8 rounded-[2.5rem] border border-[#7e22ce]/30">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-black text-[#22d3ee] uppercase text-xs tracking-widest">Coupon de Pari</h4>
              <button
                onClick={() => setBetSlip({ ...betSlip, active: false })}
                className="p-2 bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <span className="absolute top-2 left-4 text-[8px] text-white/30 font-bold uppercase">Mise (XOF)</span>
                <input
                  type="number"
                  value={betSlip.amount}
                  onChange={(e) => setBetSlip({ ...betSlip, amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xl font-black pt-7 outline-none focus:border-[#7e22ce]/50"
                />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl text-center flex flex-col justify-center min-w-[100px]">
                <p className="text-[8px] text-[#fbbf24] font-bold uppercase">Gains Est.</p>
                <p className="font-black">{(betSlip.amount * betSlip.odd).toFixed(0)} F</p>
              </div>
            </div>
            <button
              onClick={confirmBet}
              className="w-full bg-[#7e22ce] py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-[#9333ea] transition-colors active:scale-95"
            >
              Confirmer le pari
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
