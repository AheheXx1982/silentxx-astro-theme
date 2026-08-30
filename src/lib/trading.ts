export interface OptionLeg {
  leg: string;
  name?: string;    // 期权名称如 "RGTI SEP 18 '26 25 Call"，正股为标的代码
  sector?: string;  // 主题板块，如 "量子计算"、"电动车"
  delta?: number;
  cost?: number;    // 成本价（正股买入均价 / 期权权利金均价）
  quantity?: string; // 数量（"200股" 或 "2张"）
}

export interface TradeData {
  broker?: string;
  ticker: string;
  strategy: string;
  direction?: string;
  entryDate?: string;
  exitDate?: string;
  pnl: string;
  pnlPercent?: string;
  status: string;
  options?: OptionLeg[];
}

// P&L 是否为正
export function isPositivePnl(pnl: string): boolean {
  return pnl.startsWith('+');
}

// 获取状态颜色类名
export function getStatusClass(status: string): string {
  if (status === '已平仓' || status === 'Closed') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
}
