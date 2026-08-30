import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { TradeData } from '@lib/trading';
import { isPositivePnl, getStatusClass } from '@lib/trading';
import dayjs from 'dayjs';

interface TradeCardProps {
  trade: TradeData;
  title: string;
  description?: string;
  date: Date;
  slug: string;
  lang?: string;
}

const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  title,
  description,
  date,
  slug,
  lang = 'zh',
}) => {
  const [expanded, setExpanded] = useState(false);
  const isZh = lang === 'zh';
  const profit = isPositivePnl(trade.pnl);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:bg-card w-full max-w-full">
      {/* 顶部状态条 */}
      <div
        className={`h-1 w-full ${profit ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
      />

      <div className="p-5 sm:p-6">
        {/* 头部信息 */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                ${trade.ticker}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(trade.status)}`}
              >
                {trade.status}
              </span>
              {trade.direction && (
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {trade.direction}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold leading-tight tracking-tight">
              <a
                href={`/article/${slug}`}
                className="hover:text-primary transition-colors duration-200"
              >
                {title}
              </a>
            </h3>
            {description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* P&L 盈亏 */}
          <div className="flex shrink-0 flex-col items-end">
            <div
              className={`text-2xl font-bold tabular-nums break-all ${profit ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {trade.pnl}
            </div>
            {trade.pnlPercent && (
              <div
                className={`mt-0.5 text-sm font-medium tabular-nums ${profit ? 'text-emerald-500/80' : 'text-red-500/80'}`}
              >
                {trade.pnlPercent}
              </div>
            )}
          </div>
        </div>

        {/* 关键信息行 */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trade.broker && (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {isZh ? '券商' : 'Broker'}
              </div>
              <div className="mt-0.5 text-sm font-medium">{trade.broker}</div>
            </div>
          )}
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs text-muted-foreground">
              {isZh ? '策略' : 'Strategy'}
            </div>
            <div className="mt-0.5 text-sm font-medium">{trade.strategy}</div>
          </div>
          {trade.entryDate && (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {isZh ? '入场' : 'Entry'}
              </div>
              <div className="mt-0.5 text-sm font-medium">
                {trade.entryDate}
              </div>
            </div>
          )}
          {trade.exitDate ? (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {isZh ? '出场' : 'Exit'}
              </div>
              <div className="mt-0.5 text-sm font-medium">
                {trade.exitDate}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {isZh ? '日期' : 'Date'}
              </div>
              <div className="mt-0.5 text-sm font-medium">
                {dayjs(date).format('YYYY-MM-DD')}
              </div>
            </div>
          )}
        </div>

        {/* 期权持仓表格（可展开） */}
        {trade.options && trade.options.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span>
                {isZh ? '期权持仓明细' : 'Options Detail'} ({trade.options.length}{' '}
                {isZh ? '条' : 'legs'})
              </span>
              <Icon
                icon="ri:arrow-down-s-line"
                className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>

            {expanded && (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">
                        {isZh ? '名称' : 'Name'}
                      </th>
                      <th className="pb-2 pr-3 font-medium">
                        {isZh ? '主题板块' : 'Sector'}
                      </th>
                      <th className="pb-2 pr-3 text-right font-medium">
                        Delta
                      </th>
                      <th className="pb-2 pr-3 text-right font-medium">
                        {isZh ? '成本价' : 'Cost'}
                      </th>
                      <th className="pb-2 text-right font-medium">
                        {isZh ? '数量' : 'Qty'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trade.options.map((opt, idx) => {
                      const isStock = opt.leg === '正股';
                      return (
                        <tr
                          key={idx}
                          className="border-b border-border/30 transition-colors hover:bg-muted/30"
                        >
                          <td className="py-2 pr-3">
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                opt.leg.toLowerCase().includes('short')
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                  : opt.leg.toLowerCase().includes('long')
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}
                            >
                              {opt.name || opt.leg}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-sm">
                            {opt.sector ? (
                              <span className="inline-flex items-center rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                                {opt.sector}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 pr-3 text-right font-mono tabular-nums">
                            {isStock
                              ? '-'
                              : opt.delta != null
                                ? opt.delta > 0
                                  ? `+${opt.delta.toFixed(2)}`
                                  : opt.delta.toFixed(2)
                                : '-'}
                          </td>
                          <td className="py-2 pr-3 text-right font-mono tabular-nums">
                            {opt.cost != null ? `$${opt.cost.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 text-right font-mono tabular-nums">
                            {opt.quantity || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between">
          <time className="text-xs text-muted-foreground">
            {dayjs(date).format('YYYY-MM-DD')}
          </time>
          <a
            href={`/article/${slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {isZh ? '查看详情' : 'Details'}
            <Icon icon="ri:arrow-right-line" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TradeCard;
