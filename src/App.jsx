import React, { useState, useEffect } from 'react';
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
 * Les variables sont lues depuis l'environnement Vercel.
 * Si elles sont absentes, on utilise des valeurs par défaut sécurisées.
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

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 15000, auraScore: 750 });
  const [betSlip, setBetSlip] = useState({ active: false, amount: 1000 });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth Fail:', err);
      }
    };

    startAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private', 'profile');

    const unsubscribe = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) setProfile(snap.data());
        else setDoc(profileRef, { balance: 15000, auraScore: 750 });
      },
      (err) => console.error('Firestore Error:', err)
    );

    return () => unsubscribe();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const placeBet = async () => {
    if (!user) return;
    if (betSlip.amount > profile.balance) return showToast('Fonds insuffisants');

    const newBalance = profile.balance - betSlip.amount;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private', 'profile');

    try {
      await setDoc(profileRef, { ...profile, balance: newBalance }, { merge: true });
      showToast('Pari enregistré avec succès !');
      setBetSlip({ ...betSlip, active: false });
    } catch {
      showToast('Erreur réseau');
    }
  };

  if (!user)
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-[#7e22ce]">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Connexion sécurisée...</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#7e22ce]/30">
      <header className="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">
          AURA<span className="text-[#7e22ce]">BET</span>
        </h1>
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
          <span className="text-xs font-bold text-[#fbbf24]">{profile.balance.toLocaleString()} XOF</span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Icon name="brain" className="w-20 h-20" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-[#7e22ce] mb-2 italic">Aura Advisor v1</p>
          <p className="text-xl font-bold leading-tight mb-6">
            "Probabilité de victoire <span className="text-[#22d3ee]">Dakar SC</span> : 88%. Le flux Live
            confirme une pression haute."
          </p>
          <button
            onClick={() => setBetSlip({ active: true, amount: 1000 })}
            className="w-full bg-[#7e22ce] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-[0.98] transition-all"
          >
            Suivre la prédiction
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Live Supremacy</span>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <div className="bg-[#080808] border border-white/5 rounded-3xl p-8 text-center">
            <p className="text-xs opacity-20 uppercase font-black italic tracking-widest">
              Chargement du flux Live API-Sports...
            </p>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#7e22ce] px-6 py-2 rounded-full text-[10px] font-black uppercase z-[100] shadow-2xl">
          {toast}
        </div>
      )}

      {betSlip.active && (
        <div className="fixed inset-0 z-50 flex items-end p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBetSlip({ ...betSlip, active: false })}
          />
          <div className="relative w-full max-w-md mx-auto bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#22d3ee]">
                Configuration Pari
              </span>
              <button
                onClick={() => setBetSlip({ ...betSlip, active: false })}
                className="opacity-20 hover:opacity-100"
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="bg-black border border-white/5 rounded-2xl p-6 mb-8">
              <label className="text-[8px] uppercase font-black opacity-30 block mb-2 tracking-widest">
                Mise (XOF)
              </label>
              <input
                type="number"
                value={betSlip.amount}
                onChange={(e) => setBetSlip({ ...betSlip, amount: parseInt(e.target.value, 10) || 0 })}
                className="bg-transparent text-3xl font-black outline-none w-full"
              />
            </div>
            <button
              onClick={placeBet}
              className="w-full bg-[#7e22ce] py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Confirmer le coupon
            </button>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 inset-x-0 bg-[#020202]/90 backdrop-blur-2xl border-t border-white/5 p-4 pb-10 flex justify-around items-center z-40">
        {['grid', 'zap', 'shield', 'wallet', 'user'].map((name, i) => (
          <button key={name} className={`flex flex-col items-center gap-1 ${i === 1 ? 'text-[#7e22ce]' : 'opacity-20'}`}>
            <Icon name={name} className="w-5 h-5" />
            <span className="text-[6px] font-black uppercase italic">{name}</span>
          </button>
        ))}
      </footer>
    </div>
  );
};

export default App;
