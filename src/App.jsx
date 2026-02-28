import { useEffect, useMemo, useState } from 'react';
import { computeAuraScore, computeConfidence, mutateLiveFeed } from './lib/auraEngine';
import { formatAmount, topUpAmountByCurrency, totalWalletUsdt } from './lib/walletEngine';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
  Coins,
  Landmark,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Wallet,
  Waves,
} from 'lucide-react';

const leagues = ['CAF', 'EPL'];

const initialLiveFeeds = [
  { id: 1, league: 'CAF', match: 'Al Ahly vs Wydad', minute: 67, market: 'Over 2.5', odds: 1.96 },
  { id: 2, league: 'EPL', match: 'Arsenal vs Chelsea', minute: 44, market: 'BTTS', odds: 1.68 },
  { id: 3, league: 'CAF', match: 'ASEC vs Esperance', minute: 81, market: '1X', odds: 1.41 },
  { id: 4, league: 'EPL', match: 'Liverpool vs Spurs', minute: 13, market: 'Liverpool Win', odds: 1.88 },
];

const walletSeed = [
  { currency: 'XOF', amount: 920000, symbol: 'FCFA', icon: Landmark },
  { currency: 'GNF', amount: 7100000, symbol: 'FG', icon: Coins },
  { currency: 'USDT', amount: 2430.9, symbol: 'USDT', icon: CircleDollarSign },
];

const transactionsSeed = [
  { id: 'tx-1', type: 'deposit', provider: 'Orange Money', currency: 'XOF', amount: 85000, time: '17:11' },
  { id: 'tx-2', type: 'withdraw', provider: 'Wave', currency: 'XOF', amount: 40000, time: '16:48' },
  { id: 'tx-3', type: 'deposit', provider: 'On-chain', currency: 'USDT', amount: 120, time: '16:03' },
];

function App() {
  const [tick, setTick] = useState(0);
  const [liveFeeds, setLiveFeeds] = useState(initialLiveFeeds);
  const [walletBalances, setWalletBalances] = useState(walletSeed);
  const [selectedCurrency, setSelectedCurrency] = useState('XOF');
  const [transactions, setTransactions] = useState(transactionsSeed);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLiveFeeds((prev) =>
      prev.map((feed, index) => mutateLiveFeed({ feed, index, tick, leagues })),
    );
  }, [tick]);

  const auraScore = useMemo(() => computeAuraScore(tick), [tick]);

  const advisorPredictions = useMemo(
    () =>
      liveFeeds.slice(0, 3).map((feed) => ({
        event: `${feed.match} • ${feed.market}`,
        confidence: computeConfidence({ auraScore, odds: feed.odds }),
        trend: feed.odds < 1.8 ? '+Stable' : '+Momentum',
      })),
    [auraScore, liveFeeds],
  );

  const totalWallet = useMemo(() => totalWalletUsdt(walletBalances), [walletBalances]);

  const handleTopUp = (provider) => {
    setWalletBalances((prev) =>
      prev.map((item) =>
        item.currency === selectedCurrency
          ? {
              ...item,
              amount: item.amount + topUpAmountByCurrency(item.currency),
            }
          : item,
      ),
    );

    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        provider,
        currency: selectedCurrency,
        amount: topUpAmountByCurrency(selectedCurrency),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 text-white md:p-10">
      <header className="glass mb-8 rounded-3xl p-6 shadow-glass md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-vibranium/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-solar">
              <Sparkles size={14} /> Afrofuturist Betting AI
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">AURABET</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-200 md:text-base">
              Prédictions live et intelligence contextuelle sur les flux CAF + EPL, propulsées par votre Aura.
            </p>
          </div>

          <div className="rounded-2xl bg-vibranium p-5 text-right text-abyss">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Aura Score</p>
            <p className="text-4xl font-black">{auraScore}</p>
            <p className="text-sm font-medium">Moteur dynamique basé live odds + signaux forme</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
            <Trophy className="text-solar" size={20} /> Grille de paris Live
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {liveFeeds.map((feed) => (
              <div key={feed.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-vibranium">
                  <Activity size={14} /> {feed.league} • {feed.minute}'
                </p>
                <p className="text-lg font-semibold">{feed.match}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{feed.market}</span>
                  <span className="rounded-full bg-vibranium px-3 py-1 text-sm font-bold text-white">x{feed.odds}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass rounded-3xl p-6">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
            <BrainCircuit className="text-solar" size={20} /> Aura Advisor
          </h2>

          <div className="mb-4 rounded-2xl border border-vibranium/40 bg-vibranium/10 p-3 text-xs text-zinc-200">
            <p className="inline-flex items-center gap-2 font-semibold text-solar">
              <ShieldCheck size={14} /> Agent prédictif IA
            </p>
            <p className="mt-1">Recalcule la confiance en continu selon l'Aura, la volatilité des cotes et l'intensité live.</p>
          </div>

          <div className="space-y-3">
            {advisorPredictions.map((prediction) => (
              <div key={prediction.event} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-semibold">{prediction.event}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-solar">{prediction.confidence}% confiance</span>
                  <span className="text-vibranium">{prediction.trend}</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-vibranium" style={{ width: `${prediction.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <article className="glass rounded-3xl p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Wallet className="text-solar" size={20} /> Wallet multi-devises
            </h2>
            <span className="rounded-full bg-vibranium px-3 py-1 text-xs font-semibold text-white">
              Total estimé: {formatAmount(totalWallet, 'USDT', 'USDT')}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {walletBalances.map(({ currency, amount, symbol, icon: Icon }) => (
              <button
                key={currency}
                type="button"
                onClick={() => setSelectedCurrency(currency)}
                className={`rounded-2xl p-4 text-left transition ${
                  selectedCurrency === currency
                    ? 'bg-vibranium text-abyss ring-2 ring-solar/80'
                    : 'bg-black/30 text-white ring-1 ring-white/10 hover:ring-vibranium/70'
                }`}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon size={16} /> {currency}
                </p>
                <p className="mt-2 text-2xl font-black">{formatAmount(amount, currency, symbol)}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-xl font-bold">Canaux paiement</h2>
          <div className="space-y-3 text-sm">
            <button
              type="button"
              onClick={() => handleTopUp('Orange Money')}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-vibranium/70"
            >
              <p className="flex items-center gap-2 font-semibold text-solar">
                <Smartphone size={14} /> Orange Money
              </p>
              <p className="mt-1 text-zinc-300">Top up instantané • Frais 1.2%</p>
            </button>

            <button
              type="button"
              onClick={() => handleTopUp('Wave')}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition hover:border-vibranium/70"
            >
              <p className="flex items-center gap-2 font-semibold text-solar">
                <Waves size={14} /> Wave
              </p>
              <p className="mt-1 text-zinc-300">Retrait rapide • Seuil min 1 000 XOF</p>
            </button>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <article className="glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold">Flux transactions</h2>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-3">
                <div>
                  <p className="text-sm font-semibold">{tx.provider}</p>
                  <p className="text-xs text-zinc-300">
                    {tx.currency} • {tx.time}
                  </p>
                </div>
                <p className={`inline-flex items-center gap-1 text-sm font-semibold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'deposit' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  {tx.type === 'deposit' ? '+' : '-'}
                  {formatAmount(tx.amount, tx.currency, tx.currency === 'USDT' ? 'USDT' : tx.currency)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass rounded-3xl bg-vibranium/10 p-6 text-xs text-zinc-300">
          <p>
            Firebase prêt: Auth Google/Phone + Firestore profile path
            <code className="ml-1 rounded bg-black/40 px-2 py-1">/artifacts/{'{appId}'}/users/{'{userId}'}/private/profile</code>
          </p>
        </article>
      </section>

      <div id="recaptcha-container" />
    </main>
  );
}

export default App;
