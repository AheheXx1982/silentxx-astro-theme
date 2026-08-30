import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 期权腿 Schema
const optionLegSchema = z.object({
  leg: z.string(), // Short Call / Long Put / 正股 等
  name: z.string().optional(), // 期权名称，如 "RGTI SEP 18 '26 25 Call"，正股则为标的代码如 "RGTI"
  sector: z.string().optional(), // 主题板块，如 "量子计算"、"电动车"
  delta: z.number().optional(),
  cost: z.number().optional(), // 成本价，正股为买入均价，期权为权利金均价
  quantity: z.string().optional(), // 数量，正股如 "200股"，期权如 "2张"
});

// 交易实盘 Schema（可选，仅实盘复盘文章使用）
const tradeSchema = z
  .object({
    broker: z.string().optional(), // 券商，如"盈透证券"
    ticker: z.string(), // 标的代码，如 TSLA
    strategy: z.string(), // 策略名称
    direction: z.string().optional(), // 看涨/看跌/中性
    entryDate: z.string().optional(), // 入场日期
    exitDate: z.string().optional(), // 出场日期
    pnl: z.string(), // 盈亏金额，如 "+$320"
    pnlPercent: z.string().optional(), // 盈亏百分比，如 "+8.5%"
    status: z.string(), // 已平仓 / 持仓中
    options: z.array(optionLegSchema).optional(),
  })
  .optional();

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    link: z.string().optional(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // 兼容老 Hexo 博客
    subtitle: z.string().optional(),
    catalog: z.boolean().optional(),
    categories: z
      .array(z.string())
      .or(z.array(z.array(z.string())))
      .optional(),
    // 多语言支持（用 z.string() 而非 z.enum()——Astro 7 拒绝 z.enum() + default() 组合）
    lang: z.string().optional(),
    // 交易实盘数据（可选）
    trade: tradeSchema,
  }),
});

export const collections = {
  blog: blogCollection,
};
