# SilentXx Astro Theme

> A modern blog theme for content creators — smart TOC (AI-powered), i18n, beautiful typography.
> 为内容创作者打造的 Astro 博客主题：AI 智能目录、中英双语、精美排版。

Built & maintained by [SilentXx](https://silentxx.com) — extracted from the production site, proven in real-world use.

## Features

- 📑 **Smart TOC (SilentXx SmartToc)** — 5-level fallback chain: heading tree → AI semantic chapters → pseudo-heading detection → paragraph navigation → "No TOC". Every article gets usable navigation, no rewrites needed.
- 🌍 **i18n** — Chinese & English content in one codebase (zh/en routes).
- 🎨 **Tailwind CSS** — light/dark themes, beautiful typography, fully customizable.
- ⚡ **Performance** — Astro static generation, instant page loads.
- 🏷️ **Categories & tags** — content organization out of the box.
- 🤖 **AI Companion integration** — optional chat widget (bring your own API).

## Quick Start

```bash
git clone https://github.com/AheheXx1982/silentxx-astro-theme.git
cd silentxx-astro-theme
npm install
npm run dev
```

Open `http://localhost:4321`.

## Write articles

Create Markdown files under `src/content/blog/`:

```markdown
---
title: 'My First Post'
date: 2026-08-30
tags: ['Astro']
categories: ['新手入门']
lang: 'zh'    # or 'en' → put file under src/content/blog/en/
---

Content goes here...
```

The theme automatically generates a sidebar TOC for every article.

## Structure

```text
src/
├── components/    # UI components (incl. SilentXxSmartToc)
├── layouts/       # Page layouts
├── lib/           # Utilities
├── pages/         # Routes (zh + en)
├── styles/        # Global styles
├── constants/     # Site configuration
└── content/       # Articles (blog/)
```

## Smart TOC

The built-in `SilentXxSmartToc` component is also available standalone on npm as [`silentxx-smart-toc`](https://www.npmjs.com/package/silentxx-smart-toc) — with its own [GitHub repo](https://github.com/AheheXx1982/silentxx-smart-toc), docs, and version history.

For AI semantic chapters, generate `public/toc-data/<slug>.json` at build time (any LLM with JSON output works). The component reads it automatically; without it, it degrades to pseudo-heading detection → paragraph navigation.

## Styling

Tailwind CSS + CSS variables (`--primary`, `--muted-foreground`, …). Light/dark adaptive by default. Override classes or variables to match your brand.

## Compatibility

- Astro 5.x / 7.x
- Node 18+
- Modern browsers

## License

MIT © 2026 SilentXx

---

[中文文档](./README.zh-CN.md)
