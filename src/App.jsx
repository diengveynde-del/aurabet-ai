import { useMemo, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  LayoutGrid,
  Menu,
  ShieldCheck,
  User,
  Wallet,
  X,
  Zap,
} from 'lucide-react';

const matchData = {
  competition: 'Championnat National',
  minute: 78,
  homeCode: 'HAF',
  homeTeam: 'Hafia FC',
  awayCode: 'DJO',
  awayTeam: 'Djoliba AC',
  homeScore: 3,
  awayScore: 1,
};

const odds = [
  { label: '1', team: 'Hafia FC', odd: 1.08 },
  { label: 'N', team: 'Match Nul', odd: 5.2 },
  { label: '2', team: 'Djoliba AC', odd: 15.0 },
];

function App() {
  const [balance, setBalance] = useState(15000);
  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState({ team: 'Hafia FC', odd: 1.85 });
  const [stake, setStake] = useState(1000);
  const [toast, setToast] = useState('');

  const potentialGain = useMemo(() => Math.floor((Number(stake) || 0) * selectedBet.odd), [stake, selectedBet]);

  const openBetSlip = (team, odd) => {
    setSelectedBet({ team, odd });
    setBetSlipOpen(true);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2800);
  };

  const confirmBet = () => {
    const amount = Number(stake) || 0;
    if (amount <= 0) {
      showToast('Mise invalide.');
      return;
    }
    if (amount > balance) {
      showToast('Solde insuffisant !');
      return;
    }
    setBalance((b) => b - amount);
    showToast(`Pari de ${amount.toLocaleString('fr-FR')} XOF validé sur ${selectedBet.team} !`);
    setBetSlipOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] pb-24 font-sans text-white selection:bg-cyan-400/20">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#7e22ce]/20 bg-[#020202]/50 p-6 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-2xl font-black uppercase italic tracking-tighter">
            AURA<span className="text-[#7e22ce]">BET</span>
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-cyan-400">AI Supremacy v1.0</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#7e22ce]/50 bg-[#111] px-3 py-1">
            <div className="h-2 w-2 animate-ping rounded-full bg-[#fbbf24]" />
            <span className="text-xs font-bold text-[#fbbf24]">
              {balance.toLocaleString('fr-FR')} <span className="text-[10px] font-medium italic text-white/50">XOF</span>
            </span>
          </div>
          <button className="p-1">
            <Menu className="h-6 w-6 text-white/70" />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl space-y-6 p-4">
        <section className="group relative overflow-hidden rounded-3xl border-l-4 border-l-[#7e22ce] border border-[#7e22ce]/20 bg-[rgba(18,18,18,0.8)] p-6 backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#7e22ce]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-[#fbbf24]/20 p-2">
                <BrainCircuit className="h-5 w-5 text-[#fbbf24]" />
              </div>
              <h2 className="text-xs font-bold uppercase italic tracking-widest text-white/50">Aura Advisor Premium</h2>
            </div>

            <p className="mb-6 text-xl font-bold leading-tight">
              "Analyse en temps réel : <span className="text-[#fbbf24]">Hafia FC</span> vs <span className="text-white/60">Djoliba</span>.
              Probabilité de victoire à domicile estimée à <span className="text-cyan-400">91.4%</span>."
            </p>

            <button
              onClick={() => openBetSlip('Hafia FC', 1.85)}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#7e22ce] py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(126,34,206,0.4)] transition-all active:scale-95 hover:bg-[#9333ea]"
            >
              <Zap className="h-4 w-4 fill-current" /> Suivre la prédiction IA
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-white/40">
              Live <span className="text-[#7e22ce]">Supremacy</span>
            </h3>
            <span className="text-[10px] font-bold text-cyan-400 animate-pulse">● Mise à jour en direct</span>
          </div>

          <div className="space-y-5 rounded-3xl border border-white/5 bg-[#0a0a0a] p-5 animate-pulse-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-white/40">{matchData.competition}</span>
              <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-red-500">
                {matchData.minute}' Chrono
              </span>
            </div>

            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">{matchData.homeCode}</div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-white/30">{matchData.homeTeam}</div>
              </div>
              <div className="bg-gradient-to-r from-[#7e22ce] to-cyan-400 bg-clip-text text-4xl font-black italic tracking-tighter text-transparent">
                {matchData.homeScore} - {matchData.awayScore}
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold">{matchData.awayCode}</div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-white/30">{matchData.awayTeam}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {odds.map((item) => (
                <button
                  key={item.label}
                  onClick={() => openBetSlip(item.team, item.odd)}
                  className="group flex flex-col items-center rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-[#7e22ce]/20"
                >
                  <span className="mb-1 text-[8px] font-bold italic text-white/30">{item.label}</span>
                  <span className="text-sm font-black group-hover:text-cyan-400">{item.odd.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div
        className={`fixed bottom-24 left-4 right-4 z-[60] transition-transform duration-500 ${
          betSlipOpen ? 'translate-y-0' : 'translate-y-[120%]'
        }`}
      >
        <div className="rounded-3xl border-t-2 border-[#7e22ce] border border-[#7e22ce]/20 bg-black p-5 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <h4 className="text-sm font-black uppercase italic tracking-widest">Pari Sélectionné</h4>
            </div>
            <button onClick={() => setBetSlipOpen(false)} className="text-white/20 transition-colors hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
            <div>
              <p className="text-lg font-black uppercase italic tracking-tight">{selectedBet.team}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Victoire Finale</p>
            </div>
            <span className="text-2xl font-black text-[#fbbf24]">{selectedBet.odd.toFixed(2)}</span>
          </div>

          <div className="mb-6 flex gap-3">
            <div className="relative flex-[2] rounded-2xl border border-white/10 bg-black px-4 py-4">
              <span className="absolute left-4 top-2 text-[8px] font-bold uppercase italic tracking-widest text-white/30">Mise (XOF)</span>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value) || 0)}
                className="w-full bg-transparent pt-2 text-xl font-black text-white outline-none"
              />
            </div>
            <div className="flex-[1] rounded-2xl border border-white/5 bg-[#111] px-4 py-4 text-center">
              <span className="text-[8px] font-bold uppercase italic tracking-widest text-[#fbbf24]">Gain Pot.</span>
              <p className="pt-1 text-sm font-black">{potentialGain.toLocaleString('fr-FR')} F</p>
            </div>
          </div>

          <button
            onClick={confirmBet}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7e22ce] py-4 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(126,34,206,0.4)] transition-transform active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" /> Valider le Coupon
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#020202]/95 p-4 pb-8 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-cyan-400">
            <LayoutGrid className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase italic tracking-tighter">Accueil</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/20">
            <Zap className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase italic tracking-tighter">Live</span>
          </button>
          <div className="relative -mt-12">
            <button className="flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-[#020202] bg-gradient-to-tr from-[#7e22ce] to-cyan-400 shadow-xl">
              <ShieldCheck className="h-7 w-7 text-white" />
            </button>
          </div>
          <button className="flex flex-col items-center gap-1 text-white/20">
            <Wallet className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase italic tracking-tighter">Portefeuille</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/20">
            <User className="h-6 w-6" />
            <span className="text-[8px] font-black uppercase italic tracking-tighter">Compte</span>
          </button>
        </div>
      </nav>

      {toast && (
        <div className="fixed left-1/2 top-24 z-[100] -translate-x-1/2 animate-bounce rounded-full bg-[#7e22ce] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
