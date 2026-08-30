# SilentXx Astro 主题

> 为内容创作者打造的 Astro 博客主题：AI 智能目录、中英双语、精美排版。

由 [SilentXx](https://silentxx.com) 开发维护——从生产环境沉淀而来，经过真实使用验证。

## 功能特性

- 📑 **智能目录（SilentXx SmartToc）**：五级降级链——标题树 → AI 语义章节 → 伪标题识别 → 段落导航 → 暂无目录。每一篇文章都有可用导航，无需改写文章。
- 🌍 **中英双语**：一套代码，zh/en 双语言路由。
- 🎨 **Tailwind CSS**：亮色/暗色双主题，精美排版，完全可定制。
- ⚡ **性能优先**：Astro 静态生成，页面秒开。
- 🏷️ **分类与标签**：内容组织开箱即用。
- 🤖 **AI Companion 集成**（可选）：自带聊天组件，接入自己的 API 即可。

## 快速开始

```bash
git clone https://github.com/AheheXx1982/silentxx-astro-theme.git
cd silentxx-astro-theme
npm install
npm run dev
```

打开 `http://localhost:4321`。

## 写作

在 `src/content/blog/` 下创建 Markdown 文件：

```markdown
---
title: '我的第一篇文章'
date: 2026-08-30
tags: ['Astro']
categories: ['新手入门']
lang: 'zh'    # 或 'en' → 文件放 src/content/blog/en/
---

正文内容……
```

主题会自动为每篇文章生成侧边目录。

## 目录结构

```text
src/
├── components/    # UI 组件（含 SilentXxSmartToc）
├── layouts/       # 页面布局
├── lib/           # 工具函数
├── pages/         # 路由（zh + en）
├── styles/        # 全局样式
├── constants/     # 站点配置
└── content/       # 文章（blog/）
```

## 智能目录

内置的 `SilentXxSmartToc` 组件也独立发布在 npm：[`silentxx-smart-toc`](https://www.npmjs.com/package/silentxx-smart-toc)（[GitHub 仓库](https://github.com/AheheXx1982/silentxx-smart-toc)）。

AI 语义章节：构建时生成 `public/toc-data/<slug>.json`（任意支持 JSON 输出的 LLM 均可）。组件自动读取；无数据时自动降级到伪标题识别 → 段落导航。

## 样式

Tailwind CSS + CSS 变量（`--primary`、`--muted-foreground` 等），默认浅/深色自适应。可覆盖类名或变量以匹配你的品牌。

## 兼容性

- Astro 5.x / 7.x
- Node 18+
- 现代浏览器

## 许可证

MIT © 2026 SilentXx

---

[English README](./README.md)
