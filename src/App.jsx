import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const resolveFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.error('Invalid __firebase_config payload', e);
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
  const [betSlip, setBetSlip] = useState({ active: false, team: '', odd: 0, amount: 1000 });
  const [toast, setToast] = useState(null);

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

  const openBetSlip = (team, odd) => {
    setBetSlip((prev) => ({ ...prev, active: true, team, odd: parseFloat(odd) }));
  };

  const closeBetSlip = () => setBetSlip((prev) => ({ ...prev, active: false }));

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
      showToast(`Pari de ${betSlip.amount} XOF validé sur ${betSlip.team} !`);
      closeBetSlip();
    } catch (_e) {
      showToast('Erreur lors de la validation.');
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#7e22ce] font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Synchronisation Aura...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans pb-24 overflow-x-hidden selection:bg-[#7e22ce]/30">
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
          <span className="text-[7px] uppercase tracking-[0.4em] text-[#22d3ee] font-black mt-1">Firebase Cloud Sync</span>
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
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Aura Advisor</h2>
              <span className="text-[8px] text-[#22d3ee] font-bold uppercase mt-1">Précision 98.2%</span>
            </div>
          </div>

          <p className="text-xl font-bold leading-[1.2] mb-8 italic tracking-tight text-white/95">
            "Flux détecté : <span className="text-[#fbbf24]">Hafia FC</span> domine les transitions. Recommandation : Victoire Directe
            (Odd 1.85)."
          </p>

          <button
            onClick={() => openBetSlip('Hafia FC', 1.85)}
            className="w-full bg-[#7e22ce] hover:bg-[#9333ea] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(126,34,206,0.3)] flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 border border-white/10"
          >
            <Icon name="zap" className="w-4 h-4 fill-current" /> Activer le pari IA
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
              Direct <span className="text-[#7e22ce]">Supremacy</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Live Now</span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Guinée • Ligue 1</span>
              <span className="bg-red-500/10 text-red-500 text-[10px] px-3 py-1 rounded-full font-black tracking-tighter border border-red-500/20">
                78:42
              </span>
            </div>

            <div className="flex justify-around items-center gap-4">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 bg-white/5 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl border border-white/5 shadow-xl">
                  🇬🇳
                </div>
                <div className="text-xs font-black uppercase tracking-tighter text-white/60">Hafia FC</div>
              </div>
              <div className="text-5xl font-black italic bg-gradient-to-r from-[#7e22ce] to-[#22d3ee] bg-clip-text text-transparent tracking-tighter">
                3 - 1
              </div>
              <div className="flex-1 text-center">
                <div className="w-14 h-14 bg-white/5 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl border border-white/5 shadow-xl">
                  🇲🇱
                </div>
                <div className="text-xs font-black uppercase tracking-tighter text-white/60">Djoliba</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { l: '1', o: '1.08', t: 'Hafia FC' },
                { l: 'N', o: '5.20', t: 'Match Nul' },
                { l: '2', o: '15.0', t: 'Djoliba AC' },
              ].map((odd) => (
                <button
                  key={odd.l}
                  onClick={() => openBetSlip(odd.t, odd.o)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center hover:bg-[#7e22ce]/20 hover:border-[#7e22ce]/50 transition-all active:scale-90"
                >
                  <span className="text-[9px] text-white/30 font-black mb-1 italic uppercase">{odd.l}</span>
                  <span className="text-sm font-black text-[#22d3ee] tracking-tight">{odd.o}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300 ${
          betSlip.active ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeBetSlip}
      />

      <div
        className={`fixed bottom-6 left-4 right-4 z-[60] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          betSlip.active ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border border-[#7e22ce]/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7e22ce] to-transparent" />

          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-[#22d3ee] rounded-full shadow-[0_0_12px_#22d3ee]" />
              <h4 className="font-black text-xs uppercase tracking-[0.2em] italic">Confirmation du pari</h4>
            </div>
            <button onClick={closeBetSlip} className="bg-white/5 p-2 rounded-full text-white/40 hover:text-white transition-colors">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/5 p-5 rounded-3xl mb-8 border border-white/5 flex justify-between items-center group shadow-inner">
            <div>
              <p className="text-xl font-black italic tracking-tight text-white uppercase group-hover:text-[#7e22ce] transition-colors">{betSlip.team}</p>
              <p className="text-[10px] text-[#22d3ee] font-black uppercase tracking-[0.2em] mt-1">Vainqueur du match</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-[#fbbf24] tracking-tighter">{Number(betSlip.odd || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-[2] bg-black/40 border border-white/10 rounded-3xl px-5 py-5 relative focus-within:border-[#7e22ce] transition-colors shadow-inner">
              <span className="absolute top-2 left-5 text-[8px] text-white/30 font-black uppercase italic tracking-[0.2em]">Mise Totale (XOF)</span>
              <input
                type="number"
                value={betSlip.amount}
                onChange={(e) => setBetSlip((prev) => ({ ...prev, amount: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                className="w-full bg-transparent text-2xl font-black focus:outline-none pt-3 text-white tracking-tight"
              />
            </div>
            <div className="flex-[1] bg-gradient-to-b from-white/5 to-transparent border border-white/5 rounded-3xl px-4 py-5 text-center flex flex-col justify-center shadow-lg">
              <span className="text-[8px] text-[#fbbf24] font-black uppercase italic tracking-[0.2em]">Gain Potentiel</span>
              <p className="text-sm font-black pt-2 text-white italic">{Math.floor(betSlip.amount * betSlip.odd).toLocaleString()} F</p>
            </div>
          </div>

          <button
            onClick={confirmBet}
            className="w-full py-5 bg-[#7e22ce] text-white font-black rounded-3xl uppercase text-[11px] tracking-[0.3em] shadow-[0_15px_35px_rgba(126,34,206,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10"
          >
            <Icon name="check" className="w-4 h-4" /> Valider le Coupon
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#020202]/90 backdrop-blur-3xl border-t border-white/5 p-4 pb-10 z-[50]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavBtn icon="grid" active />
          <NavBtn icon="zap" />
          <div className="relative -mt-16">
            <div className="absolute inset-0 bg-[#7e22ce] blur-2xl opacity-20 rounded-full" />
            <button className="bg-gradient-to-tr from-[#7e22ce] to-[#22d3ee] w-16 h-16 rounded-full flex items-center justify-center border-[6px] border-[#020202] shadow-2xl relative z-10 active:scale-90 transition-transform">
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
  <button className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-[#22d3ee] scale-110' : 'text-white/20 hover:text-white/40'}`}>
    <Icon name={icon} className="w-5 h-5" />
    <span className="text-[7px] font-black uppercase italic tracking-[0.2em]">{icon === 'grid' ? 'Home' : icon === 'wallet' ? 'Wallet' : icon === 'user' ? 'Account' : 'Live'}</span>
  </button>
);

export default App;
