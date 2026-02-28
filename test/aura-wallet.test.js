import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp,
  computeAuraScore,
  computeConfidence,
  mutateLiveFeed,
} from '../src/lib/auraEngine.js';
import {
  formatAmount,
  topUpAmountByCurrency,
  totalWalletUsdt,
} from '../src/lib/walletEngine.js';

test('clamp keeps values in range', () => {
  assert.equal(clamp(10, 1, 5), 5);
  assert.equal(clamp(-2, 1, 5), 1);
  assert.equal(clamp(4, 1, 5), 4);
});

test('computeAuraScore remains in expected operational band', () => {
  const values = Array.from({ length: 20 }, (_, i) => computeAuraScore(i));
  values.forEach((v) => {
    assert.ok(v >= 80 && v <= 92, `unexpected aura score ${v}`);
  });
});

test('computeConfidence respects confidence boundaries', () => {
  assert.equal(computeConfidence({ auraScore: 60, odds: 3.5 }), 52);
  assert.equal(computeConfidence({ auraScore: 120, odds: 1.1 }), 92);
});

test('mutateLiveFeed increments minute and rotates leagues', () => {
  const feed = { id: 1, league: 'CAF', minute: 89, odds: 2.5 };
  const out = mutateLiveFeed({ feed, index: 0, tick: 3, leagues: ['CAF', 'EPL'] });
  assert.equal(out.minute, 90);
  assert.equal(out.league, 'EPL');
  assert.ok(out.odds >= 1.25 && out.odds <= 2.55);
});

test('wallet total converts all currencies to USDT estimate', () => {
  const total = totalWalletUsdt([
    { currency: 'XOF', amount: 600 },
    { currency: 'GNF', amount: 8600 },
    { currency: 'USDT', amount: 10 },
  ]);
  assert.equal(total, 12);
});

test('format and topup helpers are deterministic', () => {
  assert.equal(topUpAmountByCurrency('USDT'), 25);
  assert.equal(topUpAmountByCurrency('XOF'), 25000);
  assert.equal(formatAmount(2430.9, 'USDT', 'USDT'), '2 430,90 USDT');
});
