import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';

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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aurabet-ai-v1';

const Icon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    activity: (
      <>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </>
    ),
    trending: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />,
    wallet: (
      <>
        <path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <circle cx="18" cy="14" r="1" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
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
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
};

const QuantumPredictorEngine = {
  calculateAuraScore: (matchStats) => {
    const {
      possession1 = 45,
      shotsOnTarget1 = 3,
      shotsOnTarget2 = 5,
      momentum1 = 60,
      historicalWinRate1 = 0.55,
    } = matchStats;

    const possessionFactor = (possession1 / 100) * 0.15;
    const shotsFactor = (shotsOnTarget1 / (shotsOnTarget1 + shotsOnTarget2 || 1)) * 0.25;
    const momentumFactor = (momentum1 / 100) * 0.3;
    const historicalFactor = historicalWinRate1 * 0.3;
    const rawScore = (possessionFactor + shotsFactor + momentumFactor + historicalFactor) * 100;

    return Math.min(Math.max(rawScore, 20), 99);
  },

  calculateSuggestedOdds: (auraScore, baseOdds) => {
    const confidence = auraScore / 100;
    const adjustedOdds = baseOdds * (0.95 + confidence * 0.15);
    return Number(adjustedOdds.toFixed(2));
  },

  generateTacticalInsight: (team1, team2, possession1, momentum1, stats) => {
    const { shotsOnTarget1, shotsOnTarget2 } = stats;
    const insights = [
      `${team1} domine la possession (${possession1}%) et peut contrôler la transition offensive.`,
      `${team2} mise sur la contre-attaque avec ${shotsOnTarget2} tirs cadrés en transition rapide.`,
      `Momentum en faveur de ${momentum1 > 50 ? team1 : team2}: ${Math.abs(momentum1 - 50) * 2}% d'avantage tactique.`,
      `${team1} crée un surnombre côté droit avec ${shotsOnTarget1} occasions franches.`,
      `Le rythme est ${momentum1 > 60 ? `accéléré pour ${team1}` : 'équilibré'} avec une bataille au milieu.`,
    ];

    return insights[(possession1 + momentum1 + shotsOnTarget1) % insights.length];
  },
};

const initialMatches = [
  {
    id: 'match_1',
    t1: 'Dakar SC',
    t2: 'ASC Linguère',
    s1: 1,
    s2: 0,
    time: 38,
    liveCotes: [1.38, 3.4, 6.5],
    baseOdds: [1.35, 3.5, 6.0],
    possession1: 62,
    possession2: 38,
    shotsOnTarget1: 5,
    shotsOnTarget2: 2,
    momentum1: 72,
    historicalWinRate1: 0.58,
    historicalWinRate2: 0.32,
  },
  {
    id: 'match_2',
    t1: 'Stade de Mbour',
    t2: 'Pikine',
    s1: 1,
    s2: 1,
    time: 67,
    liveCotes: [2.15, 2.05, 4.2],
    baseOdds: [2.1, 2.1, 4.0],
    possession1: 48,
    possession2: 52,
    shotsOnTarget1: 4,
    shotsOnTarget2: 6,
    momentum1: 45,
    historicalWinRate1: 0.48,
    historicalWinRate2: 0.52,
  },
];

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 45000, auraScore: 912 });
  const [matches, setMatches] = useState(initialMatches);
  const [selectedBets, setSelectedBets] = useState({});
  const [betSlip, setBetSlip] = useState([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [totalStake, setTotalStake] = useState(100);
  const [betPlacing, setBetPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const startAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    startAuth();
    return onAuthStateChanged(auth, (authUser) => setUser(authUser));
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const unsubscribe = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setDoc(profileRef, { balance: 45000, auraScore: 912 });
        }
      },
      (error) => console.error('Firestore profile sync failed:', error)
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prev) =>
        prev.map((match) => {
          const nextTime = Math.min(match.time + 1, 90);
          const momentumShift = Math.random() > 0.5 ? 2 : -2;
          const nextMomentum = Math.max(25, Math.min(85, match.momentum1 + momentumShift));
          return { ...match, time: nextTime, momentum1: nextMomentum, possession1: Math.max(35, Math.min(70, match.possession1 + (momentumShift > 0 ? 1 : -1))) };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const insights = useMemo(
    () =>
      matches.reduce((acc, match) => {
        const auraScore = QuantumPredictorEngine.calculateAuraScore(match);
        const suggestedOdds = match.baseOdds.map((odd) => QuantumPredictorEngine.calculateSuggestedOdds(auraScore, odd));
        const insight = QuantumPredictorEngine.generateTacticalInsight(
          match.t1,
          match.t2,
          match.possession1,
          match.momentum1,
          match
        );

        acc[match.id] = { auraScore, suggestedOdds, insight };
        return acc;
      }, {}),
    [matches]
  );

  const totalOdds = useMemo(() => {
    if (betSlip.length === 0) return '1.00';
    return betSlip.reduce((acc, bet) => acc * bet.cote, 1).toFixed(2);
  }, [betSlip]);

  const potentialWin = useMemo(() => (totalStake * Number(totalOdds)).toFixed(0), [totalOdds, totalStake]);

  const showNotification = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSelectBet = useCallback(
    (matchId, coteIndex, cote) => {
      const match = matches.find((item) => item.id === matchId);
      if (!match) return;

      const betKey = `${matchId}-${coteIndex}`;
      const betLabel = coteIndex === 0 ? match.t1 : coteIndex === 1 ? 'Nul' : match.t2;

      setSelectedBets((prev) => {
        const next = { ...prev };
        if (next[betKey]) {
          delete next[betKey];
          setBetSlip((bets) => bets.filter((bet) => bet.key !== betKey));
        } else {
          next[betKey] = true;
          setBetSlip((bets) => [...bets, { key: betKey, matchId, coteIndex, cote, label: betLabel, match }]);
          setShowBetSlip(true);
        }
        return next;
      });
    },
    [matches]
  );

  const handlePlaceBet = useCallback(async () => {
    if (!user || betSlip.length === 0) return;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    const betsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'bets');

    if (totalStake > profile.balance) {
      showNotification('Solde insuffisant');
      return;
    }

    setBetPlacing(true);
    try {
      const newBet = {
        timestamp: new Date().toISOString(),
        bets: betSlip.map((bet) => ({ matchId: bet.matchId, team: bet.label, cote: bet.cote })),
        totalOdds: parseFloat(totalOdds),
        stake: totalStake,
        potentialWin: parseFloat(potentialWin),
        status: 'pending',
      };

      await setDoc(betsRef, newBet);
      await setDoc(profileRef, { ...profile, balance: profile.balance - totalStake }, { merge: true });

      setSelectedBets({});
      setBetSlip([]);
      setShowBetSlip(false);
      showNotification('✓ Pari placé avec succès !');
    } catch (error) {
      console.error('Bet placement failed:', error);
      showNotification('✗ Erreur lors du placement du pari');
    } finally {
      setBetPlacing(false);
    }
  }, [betSlip, potentialWin, profile, showNotification, totalOdds, totalStake, user]);

  if (!user) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-[#7e22ce]">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Connexion sécurisée...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40">
      <header className="px-4 py-5 sticky top-0 z-50 stagger-1">
        <div className="glass-card p-5 rounded-3xl max-w-lg mx-auto">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="shield" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black neon-text">AURABET</h1>
                <p className="text-[7px] font-bold tracking-[0.3em] uppercase text-white/60">IA Quantum Predictor</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-right">
              <div className="glass-card px-3 py-2 rounded-xl">
                <div className="text-[6px] font-black text-white/40 uppercase">Aura</div>
                <div className="text-base font-black neon-text">{Math.round(profile.auraScore)}</div>
              </div>
              <div className="glass-card px-3 py-2 rounded-xl">
                <div className="text-[6px] font-black text-white/40 uppercase">Solde</div>
                <div className="text-base font-black text-white">{profile.balance.toLocaleString()} XOF</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4 max-w-lg mx-auto">
        {matches.map((match, index) => (
          <section key={match.id} className={`glass-card p-6 rounded-3xl match-card group stagger-${Math.min(index + 2, 5)}`}>
            <div className="flex justify-between items-start gap-4 mb-5">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/80">{match.t1}</span>
                  <span className="text-2xl font-black neon-text">{match.s1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/80">{match.t2}</span>
                  <span className="text-2xl font-black neon-text">{match.s2}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 border-l border-purple-600/20 pl-4">
                <span className="text-[11px] font-black italic neon-text animate-live">{match.time}'</span>
                <div className="text-[6px] font-black text-white/30 uppercase">Momentum</div>
                <div className="momentum-bar w-16">
                  <div className="momentum-fill" style={{ width: `${match.momentum1}%` }} />
                </div>
                <span className="text-[7px] text-white/60">{match.momentum1}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-[7px]">
              <div className="glass-card p-3 rounded-lg border-purple-600/20">
                <p className="text-white/50 uppercase font-bold mb-1">Possession</p>
                <p className="text-white font-black">{match.possession1}%</p>
                <div className="stat-bar-bg mt-2">
                  <div className="stat-bar-fill" style={{ width: `${match.possession1}%` }} />
                </div>
              </div>
              <div className="glass-card p-3 rounded-lg border-purple-600/20">
                <p className="text-white/50 uppercase font-bold mb-1">Tirs Cadrés</p>
                <p className="text-white font-black">
                  {match.shotsOnTarget1}/{match.shotsOnTarget2}
                </p>
                <div className="stat-bar-bg mt-2">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${(match.shotsOnTarget1 / (match.shotsOnTarget1 + match.shotsOnTarget2)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-lg mb-5 border-purple-600/30">
              <p className="text-[7px] text-white/80 leading-tight">
                <span className="text-purple-400 font-bold">IA:</span> {insights[match.id].insight}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="confidence-badge high">{insights[match.id].auraScore.toFixed(1)}% Confiance</span>
                <span className="text-[9px] font-bold text-[#00ff88]">Cote IA 1: {insights[match.id].suggestedOdds[0]}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {match.liveCotes.map((cote, i) => {
                const betKey = `${match.id}-${i}`;
                const isSelected = Boolean(selectedBets[betKey]);
                return (
                  <button
                    key={betKey}
                    onClick={() => handleSelectBet(match.id, i, cote)}
                    className={`cote-btn relative ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="text-[6px] uppercase opacity-70 block mb-1">{i === 0 ? '1' : i === 1 ? 'X' : '2'}</span>
                    <span className="text-lg font-black">{cote.toFixed(2)}</span>
                    {isSelected && <Icon name="check" className="w-3 h-3 absolute top-1 right-1" />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {showBetSlip && (
        <aside className="fixed left-0 right-0 bottom-24 px-4 z-50">
          <div className="glass-card rounded-3xl max-w-lg mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/80">Carnet de paris</h2>
              <span className="text-[10px] text-white/60">{betSlip.length} sélection(s)</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-auto pr-1">
              {betSlip.map((bet) => (
                <div key={bet.key} className="flex items-center justify-between text-[10px] bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                  <span className="font-semibold text-white/90">{bet.label}</span>
                  <span className="font-black text-[#00d2ff]">{bet.cote.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 items-end">
              <label className="col-span-1 text-[9px] font-black uppercase text-white/50">
                Mise
                <input
                  type="number"
                  min="100"
                  value={totalStake}
                  onChange={(event) => setTotalStake(parseInt(event.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-2 py-2 text-sm font-black text-white"
                />
              </label>
              <div className="col-span-2 text-right">
                <div className="text-[9px] uppercase text-white/50">Cote totale: {totalOdds}</div>
                <div className="text-xl font-black text-[#00ff88]">Gain potentiel: {potentialWin} XOF</div>
              </div>
            </div>

            <button className="btn-quantum mt-3" onClick={handlePlaceBet} disabled={betPlacing || betSlip.length === 0}>
              {betPlacing ? 'Placement en cours...' : 'Placer le Pari'}
            </button>
          </div>
        </aside>
      )}

      <nav className="fixed bottom-0 inset-x-0 glass-card p-6 flex justify-around items-end border-t border-purple-600/10 z-50 rounded-t-3xl max-w-lg mx-auto">
        <button className="flex flex-col items-center gap-2 group">
          <Icon name="activity" className="text-purple-500 w-6 h-6 group-hover:animate-live" />
          <span className="text-[6px] font-black uppercase text-purple-500">Live</span>
        </button>

        <button className="flex flex-col items-center gap-2 group opacity-50 hover:opacity-100">
          <Icon name="trending" className="w-6 h-6 group-hover:neon-text" />
          <span className="text-[6px] font-black uppercase">Paris</span>
        </button>

        <div className="relative -mt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-600 blur-2xl opacity-40 animate-pulse" />
          <button
            onClick={() => setShowBetSlip((prev) => !prev)}
            className="relative z-10 w-16 h-16 btn-quantum rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <Icon name="shield" className="text-white w-8 h-8" />
            {betSlip.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {betSlip.length}
              </span>
            )}
          </button>
        </div>

        <button className="flex flex-col items-center gap-2 group opacity-50 hover:opacity-100">
          <Icon name="wallet" className="w-6 h-6" />
          <span className="text-[6px] font-black uppercase">Bourse</span>
        </button>

        <button className="flex flex-col items-center gap-2 group opacity-50 hover:opacity-100">
          <Icon name="bell" className="w-6 h-6" />
          <span className="text-[6px] font-black uppercase">Aura</span>
        </button>
      </nav>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7e22ce] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase z-[100] shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
