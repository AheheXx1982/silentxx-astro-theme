import React, { useState, useCallback, useMemo } from 'react';

// Black-Scholes Greeks approximation
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

interface GreeksResult {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  price: number;
}

function calculateGreeks(
  S: number, K: number, T: number, r: number, sigma: number, isCall: boolean
): GreeksResult {
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const nd1 = normalPDF(d1);
  const Nd1 = normalCDF(isCall ? d1 : -d1);
  const Nd2 = normalCDF(isCall ? d2 : -d2);

  const delta = isCall ? normalCDF(d1) : normalCDF(d1) - 1;
  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const theta = (-S * nd1 * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (isCall ? normalCDF(d2) : normalCDF(-d2))) / 365;
  const vega = (S * nd1 * Math.sqrt(T)) / 100;
  const rho = (K * T * Math.exp(-r * T) * (isCall ? normalCDF(d2) : -normalCDF(-d2))) / 100;

  // Option price
  const price = isCall
    ? S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
    : K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);

  return { delta, gamma, theta, vega, rho, price };
}

const GreeksCalculator: React.FC = () => {
  const [stockPrice, setStockPrice] = useState('100');
  const [strike, setStrike] = useState('105');
  const [days, setDays] = useState('30');
  const [iv, setIv] = useState('30');
  const [rate, setRate] = useState('5');
  const [isCall, setIsCall] = useState(true);

  const result = useMemo(() => {
    const S = parseFloat(stockPrice) || 100;
    const K = parseFloat(strike) || 105;
    const T = (parseFloat(days) || 30) / 365;
    const sigma = (parseFloat(iv) || 30) / 100;
    const r = (parseFloat(rate) || 5) / 100;

    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) return null;
    return calculateGreeks(S, K, T, r, sigma, isCall);
  }, [stockPrice, strike, days, iv, rate, isCall]);

  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">标的价格 ($)</label>
          <input
            type="number"
            value={stockPrice}
            onChange={e => setStockPrice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">行权价 ($)</label>
          <input
            type="number"
            value={strike}
            onChange={e => setStrike(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">剩余天数</label>
          <input
            type="number"
            value={days}
            onChange={e => setDays(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">隐含波动率 (%)</label>
          <input
            type="number"
            value={iv}
            onChange={e => setIv(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">无风险利率 (%)</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
            step="0.1"
          />
        </div>
      </div>

      {/* Call/Put Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsCall(true)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isCall
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Call 看涨
        </button>
        <button
          onClick={() => setIsCall(false)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !isCall
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Put 看跌
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">期权价格</div>
            <div className="mt-1 text-xl font-bold tabular-nums">
              ${result.price.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">Delta Δ</div>
            <div className={`mt-1 text-xl font-bold tabular-nums ${result.delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {result.delta.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              方向敏感度
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">Gamma Γ</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-amber-500">
              {result.gamma.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Delta 变化率
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">Theta Θ</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-blue-500">
              {result.theta.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              每日时间衰减
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">Vega ν</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-purple-500">
              {result.vega.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              IV 敏感度
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-xs text-muted-foreground">Rho ρ</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-orange-500">
              {result.rho.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              利率敏感度
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <h3 className="font-semibold mb-3">📖 Greeks 速查表</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="font-mono font-bold text-emerald-500">Delta (Δ)</span>
            <p className="text-sm text-muted-foreground mt-1">
              标的价格变动 $1 时期权价格的变动。Call: 0~1，Put: -1~0。
            </p>
          </div>
          <div>
            <span className="font-mono font-bold text-amber-500">Gamma (Γ)</span>
            <p className="text-sm text-muted-foreground mt-1">
              标的价格变动 $1 时 Delta 的变动。ATM 近到期时 Gamma 最大。
            </p>
          </div>
          <div>
            <span className="font-mono font-bold text-blue-500">Theta (Θ)</span>
            <p className="text-sm text-muted-foreground mt-1">
              每过一天期权的时间价值衰减。卖方赚 Theta，买方亏 Theta。
            </p>
          </div>
          <div>
            <span className="font-mono font-bold text-purple-500">Vega (ν)</span>
            <p className="text-sm text-muted-foreground mt-1">
              隐含波动率变动 1% 时期权价格的变动。高 IV 环境下 Vega 影响更大。
            </p>
          </div>
          <div>
            <span className="font-mono font-bold text-orange-500">Rho (ρ)</span>
            <p className="text-sm text-muted-foreground mt-1">
              无风险利率变动 1% 时期权价格的变动。短期期权 Rho 很小。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreeksCalculator;
