export const FX_RATES = {
  XOF_TO_USDT: 1 / 600,
  GNF_TO_USDT: 1 / 8600,
};

export const formatAmount = (value, currency, symbol) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: currency === 'USDT' ? 2 : 0,
    maximumFractionDigits: currency === 'USDT' ? 2 : 0,
  });

  return `${formatter.format(value)} ${symbol}`;
};

export const toUsdtEstimate = (walletItem) => {
  if (walletItem.currency === 'XOF') return walletItem.amount * FX_RATES.XOF_TO_USDT;
  if (walletItem.currency === 'GNF') return walletItem.amount * FX_RATES.GNF_TO_USDT;
  return walletItem.amount;
};

export const totalWalletUsdt = (walletBalances) =>
  walletBalances.reduce((acc, item) => acc + toUsdtEstimate(item), 0);

export const topUpAmountByCurrency = (currency) => (currency === 'USDT' ? 25 : 25000);
