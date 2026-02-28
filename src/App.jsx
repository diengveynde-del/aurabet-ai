import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const resolveFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return JSON.parse(__firebase_config);
    } catch (error) {
      console.error('Invalid __firebase_config:', error);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};

const firebaseConfig = resolveFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : import.meta.env.VITE_APP_ID || 'aurabet-ai-v1';

const Icon = ({ name, className = 'w-6 h-6' }) => {
  const icons = {
    brain: (
      <>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.74-3.68A2.5 2.5 0 0 1 2.5 12 2.5 2.5 0 0 1 4.3 7.56 2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.74-3.68A2.5 2.5 0 0 0 21.5 12 2.5 2.5 0 0 0 19.7 7.56 2.5 2.5 0 0 0 14.5 2Z" />
      </>
    ),
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    check: <polyline points="20 6 9 17 4 12" />,
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
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
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || null}
    </svg>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 700 });
  const [betSlip, setBetSlip] = useState({ active: false, team: '', odd: 1.85, amount: 1000 });
  const [toast, setToast] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetContainerRef = useRef(null);

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth Error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private', 'profile');
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data());
        } else {
          setDoc(profileRef, { balance: 15000, auraScore: 700 });
        }
      },
      (error) => console.error('Firestore Error:', error),
    );
    return () => unsubscribe();
  }, [user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const confirmBet = async () => {
    if (!user) return;
    if (betSlip.amount > profile.balance) {
      showToast('Solde insuffisant !');
      return;
    }
    const newBalance = profile.balance - betSlip.amount;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private', 'profile');
    try {
      await setDoc(profileRef, { ...profile, balance: newBalance }, { merge: true });
      showToast(`Pari de ${betSlip.amount} XOF validé via Widget API !`);
      setBetSlip((prev) => ({ ...prev, active: false }));
    } catch (_e) {
      showToast('Erreur lors de la validation.');
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#7e22ce] border-t-transparent rounded-full animate-spin" />
        <div className="text-[#7e22ce] font-black uppercase tracking-[0.3em] text-[10px]">Authentification Sécurisée...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans pb-32 overflow-x-hidden">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] text-white px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest z-[100] shadow-[0_0_30px_rgba(126,34,206,0.5)] animate-bounce">
          {toast}
        </div>
      )}

      <nav className="flex justify-between items-center p-6 border-b border-[#7e22ce]/20 bg-[#020202]/80 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter italic uppercase leading-none">
            AURA<span className="text-[#7e22ce]">BET</span>
          </span>
          <span className="text-[7px] uppercase tracking-[0.4em] text-[#22d3ee] font-black mt-1">Widget API-Sports Pro</span>
        </div>

        <div className="bg-[#111] border border-[#7e22ce]/40 rounded-full px-4 py-1.5 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full animate-pulse shadow-[0_0_8px_#fbbf24]" />
          <span className="text-xs font-black text-[#fbbf24] tracking-tight">
            {profile.balance?.toLocaleString()} <span className="text-[9px] text-white/40 italic font-medium">XOF</span>
          </span>
        </div>
      </nav>

      <main className="p-4 space-y-6 max-w-xl mx-auto">
        <section className="bg-gradient-to-br from-[#121212] to-[#050505] border border-[#7e22ce]/20 rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#7e22ce]/5 blur-[100px] rounded-full" />

          <div className="flex items-center gap-3 mb-5">
            <div className="bg-[#fbbf24]/10 p-2.5 rounded-2xl text-[#fbbf24] border border-[#fbbf24]/20">
              <Icon name="brain" className="w-5 h-5" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Prédictions Temps Réel</h2>
          </div>

          <p className="text-lg font-bold leading-[1.2] mb-6 italic tracking-tight text-white/95">
            "Le Widget ci-dessous utilise vos données réelles. Pariez en fonction des flux <span className="text-[#22d3ee]">API-Sports</span>."
          </p>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <button
              onClick={() => setBetSlip((prev) => ({ ...prev, active: true, team: 'Pari en Cours' }))}
              className="w-full bg-[#7e22ce] text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
            >
              <Icon name="zap" className="w-3 h-3 fill-current" /> Activer Coupon Rapide
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
              Live <span className="text-[#7e22ce]">Dashboard</span>
            </h3>
            <span className="text-[9px] text-[#22d3ee] font-black uppercase animate-pulse">● Données réelles</span>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden min-h-[400px]">
            <div ref={widgetContainerRef} className="api-sports-widget-container">
              <div
                id="wg-api-football-leagues"
                data-host="v3.football.api-sports.io"
                data-key="e43f43300b5b692c2829ea3796642c3d"
                data-type="leagues"
                className="api_sports_widget"
              />

              <div
                id="wg-api-football-config"
                data-host="v3.football.api-sports.io"
                data-key="e43f43300b5b692c2829ea3796642c3d"
                data-sport="football"
                data-lang="fr"
                data-theme="dark"
                data-show-errors="true"
                data-favorite="true"
                className="api_sports_widget"
              />
            </div>

            {!scriptLoaded && (
              <div className="flex items-center justify-center h-48 text-white/20 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                Chargement du flux API-Sports...
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden">
          <div
            id="wg-api-football-livescore"
            data-host="v3.football.api-sports.io"
            data-key="e43f43300b5b692c2829ea3796642c3d"
            data-type="livescore"
            data-refresh="60"
            className="api_sports_widget"
          />
        </section>
      </main>

      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[55] transition-opacity duration-300 ${
          betSlip.active ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setBetSlip((prev) => ({ ...prev, active: false }))}
      />

      <div
        className={`fixed bottom-6 left-4 right-4 z-[60] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          betSlip.active ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-6 shadow-2xl border border-[#7e22ce]/30">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] italic text-[#22d3ee]">Ticket de Pari Pro</h4>
            <button onClick={() => setBetSlip((prev) => ({ ...prev, active: false }))} className="bg-white/5 p-2 rounded-full text-white/40">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/5 p-5 rounded-3xl mb-8 border border-white/5">
            <p className="text-xl font-black italic text-white uppercase tracking-tighter">Pari sur Flux Réel</p>
            <p className="text-[10px] text-[#7e22ce] font-black uppercase mt-1">Cote par défaut: {betSlip.odd}</p>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-[2] bg-black border border-white/10 rounded-3xl px-5 py-5 relative">
              <span className="absolute top-2 left-5 text-[8px] text-white/30 font-black uppercase tracking-widest">Mise (XOF)</span>
              <input
                type="number"
                value={betSlip.amount}
                onChange={(e) => setBetSlip((prev) => ({ ...prev, amount: parseInt(e.target.value, 10) || 0 }))}
                className="w-full bg-transparent text-2xl font-black focus:outline-none pt-3 text-white"
              />
            </div>
            <div className="flex-[1] bg-white/5 border border-white/5 rounded-3xl px-4 py-5 text-center">
              <span className="text-[8px] text-[#fbbf24] font-black uppercase tracking-widest">Gain Est.</span>
              <p className="text-sm font-black pt-2 italic">{Math.floor(betSlip.amount * betSlip.odd).toLocaleString()} F</p>
            </div>
          </div>

          <button
            onClick={confirmBet}
            className="w-full py-5 bg-[#7e22ce] text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.3em] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Icon name="check" className="w-4 h-4" /> Valider le Pari
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#020202]/90 backdrop-blur-3xl border-t border-white/5 p-4 pb-10 z-[50]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavBtn icon="grid" active />
          <NavBtn icon="zap" />
          <div className="relative -mt-16">
            <button className="bg-gradient-to-tr from-[#7e22ce] to-[#22d3ee] w-16 h-16 rounded-full flex items-center justify-center border-[6px] border-[#020202] shadow-2xl relative z-10">
              <Icon name="shield" className="w-8 h-8 text-white" />
            </button>
          </div>
          <NavBtn icon="wallet" />
          <NavBtn icon="user" />
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ icon, active = false }) => (
  <button className={`flex flex-col items-center gap-1.5 ${active ? 'text-[#22d3ee]' : 'text-white/20'}`}>
    <Icon name={icon} className="w-5 h-5" />
    <span className="text-[7px] font-black uppercase italic tracking-[0.2em]">{icon}</span>
  </button>
);

export default App;
