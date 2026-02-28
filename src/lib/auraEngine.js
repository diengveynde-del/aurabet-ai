export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const computeAuraScore = (tick) => {
  const base = 86;
  const wave = Math.sin((tick + 1) / 1.7) * 4.2;
  const drift = ((tick % 9) - 4) * 0.2;
  return Number((base + wave + drift).toFixed(1));
};

export const computeConfidence = ({ auraScore, odds }) => {
  const normalizedOdds = clamp(odds, 1.25, 2.4);
  const oddsFactor = ((2.4 - normalizedOdds) / 1.15) * 10;
  const auraFactor = auraScore - 80;
  return clamp(Math.round(62 + oddsFactor + auraFactor / 1.4), 52, 92);
};

export const mutateLiveFeed = ({ feed, index, tick, leagues }) => {
  const minuteBoost = (tick + index) % 3 === 0 ? 1 : 0;
  const pulse = ((tick + index) % 5) - 2;
  const rawOdds = feed.odds + pulse * 0.03;

  return {
    ...feed,
    minute: Math.min(90, feed.minute + minuteBoost),
    odds: Number(clamp(rawOdds, 1.25, 2.55).toFixed(2)),
    league: leagues[(tick + index) % leagues.length],
  };
};
