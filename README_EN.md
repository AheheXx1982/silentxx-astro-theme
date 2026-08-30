# 🚀 SilentXx Astro Theme

_A modern blog theme for content creators · AI-powered Smart TOC · Bilingual · Beautiful typography_

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7.x-ff5d01?logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

[🌍 Live Demo](https://www.silentxx.com) • [📖 中文文档](./README.md) •
[🚀 Quick Start](#-installation--deployment) • [🏗️ Architecture](#-project-structure) • [📑 Smart TOC](#-smart-toc)

---

## 📖 Project Overview

SilentXx Astro Theme is an open-source blog theme extracted from production — the SilentXx main site publishes content with it every day. What you get is battle-tested code.

**Core Philosophy**:

- **Every article deserves usable navigation** — whether or not it has heading structure (that's the mission of the built-in SmartToc)
- **Writing experience first** — drop in a Markdown file, let the theme handle TOC, search, i18n and SEO
- **Beauty is a feature** — light/dark themes, vinyl music player, tag relationship graph, details show the care

**What it does**: bilingual routing, smart sidebar TOC, categories & tags, RSS/Sitemap, music player, AI assistant integration point — everything a content creator needs, in one place.

---

## ✨ Key Features

| Feature                        | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| 📑 **Smart TOC (SmartToc)**    | ★ The soul of the theme: 5-level fallback chain, usable navigation even without headings |
| 🌐 **Bilingual (ZH/EN)**       | i18n routing (`/` Chinese + `/en/` English), one codebase                             |
| 🎨 **Tailwind CSS**            | Light/dark themes, beautiful typography, CSS-variable customizable                    |
| 🎵 **Music Player**            | Vinyl-style floating player, minimized cartoon face, drag & dock                      |
| 🗺️ **Tag Graph**               | Obsidian-style SVG force-directed relationship graph (zoom/drag/breathing)            |
| 🎨 **shadcn/ui**               | Modern component library, consistent design language                                  |
| 📱 **Responsive Design**       | Multi-device support, mobile drawer menu                                              |
| 🤖 **AI Assistant slot**       | ChatWidget component included — set `PUBLIC_COMPANION_API` to enable                  |
| 🏷️ **Categories & Tags**       | Content organization out of the box, `_config.yml` for category mapping               |
| 📰 **RSS + Sitemap**           | Bilingual RSS Feeds + full-site Sitemap, auto-generated                               |

---

## 🏗️ Project Structure

```plaintext
silentxx-astro-theme/
├── src/
│   ├── components/         # Component library (SmartToc/player/AI/graph/cards)
│   ├── constants/          # Config constants (site-config/i18n/category)
│   ├── content/
│   │   └── blog/           # Blog content (Chinese + en/ English)
│   ├── layouts/            # Layout templates
│   ├── lib/                # Core library (content/cover/i18n/utils)
│   ├── pages/              # Routes + RSS/Sitemap endpoints
│   ├── scripts/            # Shoka config transform
│   ├── store/              # Global state
│   └── styles/             # Styles
├── public/                 # Static assets
│   ├── assets/             # Neural Core effects
│   └── img/                # Images (1080px webp)
├── _config.yml             # Shoka category mapping
├── astro.config.mjs        # Astro config
├── tailwind.config.mjs     # Tailwind CSS config
└── package.json            # Dependencies (pnpm)
```

---

## 📋 Requirements

- Node.js >= 22 (LTS recommended)
- pnpm >= 10.x

---

## 🔧 Environment Variables

| Variable              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `PUBLIC_COMPANION_API` | AI assistant backend URL (optional; hides the chat widget if unset) |

---

## 🛠️ Development Commands

```bash
pnpm dev              # Start dev server (localhost:4321)
pnpm build            # Static build (output to dist/)
pnpm preview          # Preview the build
```

---

## 🔧 Installation & Deployment

```bash
# 1. Clone
git clone https://github.com/AheheXx1982/silentxx-astro-theme.git
cd silentxx-astro-theme

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev

# 4. Build for production
pnpm build

# 5. Preview
pnpm preview
```

**Deploy**: push to Vercel / Netlify / Cloudflare Pages — zero config.

---

## 📑 Smart TOC

> This is the soul of the theme — it deserves its own chapter.

### Why

Articles migrated from legacy platforms (WeChat, forums, old CMS) usually lack Markdown heading structure. Classic TOC components show "No TOC", leaving readers lost in long posts.

### The 5-level fallback chain

```
Heading tree  →  AI semantic chapters  →  Pseudo-heading detection  →  Paragraph navigation  →  "No TOC"
```

| Level | Mode                    | When it kicks in                                                                       |
| ----- | ----------------------- | -------------------------------------------------------------------------------------- |
| 1     | **Heading tree**        | Standard `##`/`###` headings — hierarchy, auto-numbering, scroll highlight             |
| 2     | **AI semantic chapters**| No headings but `public/toc-data/<slug>.json` exists — AI clusters paragraphs by meaning |
| 3     | **Pseudo-heading detection** | Author used plain short lines as headings (e.g. 「活在当下的真谛」) — auto-detected    |
| 4     | **Paragraph navigation**| Last-resort — one anchor per paragraph, long posts always navigable                    |
| 5     | **No TOC**              | Short posts stay clean                                                                 |

**Key promise: AI TOC renders only in the sidebar — the article content is never modified.**

The component is also published standalone on npm: [`silentxx-smart-toc`](https://www.npmjs.com/package/silentxx-smart-toc) ([repo](https://github.com/AheheXx1982/silentxx-smart-toc)) — usable in any Astro project.

---

## 🖼️ Image Guidelines

- **Format**: all images `.webp`
- **Width**: cover images 1080px wide (1080×466, ratio 2.32:1)
- **Cover system**: `src/lib/cover.ts` manages category→image mapping, with default cover pool + category covers + first-image extraction
- **Directories**: `public/img/` (site assets), `public/images/posts/` (post images)

---

## 📈 Changelog

🎯 **Current version: v1.0.0 (2026-08-30)**

### v1.0.0 — Open Source Release

- ✅ **Theme open-sourced**: extracted from the SilentXx production site, private content stripped (personal posts / trading data / private pages), full theme capability retained
- ✅ **Smart TOC**: built-in SilentXx SmartToc (5-level fallback chain), zero config
- ✅ **Bilingual demos**: Chinese & English sample articles with route demos
- ✅ **Build verified**: pnpm install + astro build end-to-end

---

## 🙏 Thanks

### Inspiration

- [师傅👩🏻余弦の博客](https://space.cosine.ren/)
- [太师傅🧔🏻‍♀️Hexo Shoka](https://github.com/amehime/hexo-theme-shoka)

### Tech Support

- [Astro](https://astro.build/) • [Vercel](https://vercel.com/) • [shadcn/ui](https://ui.shadcn.com/) • [Tailwind CSS](https://tailwindcss.com/)

Let's build a better tech community together!

_Made with ❤️ by SilentXx_
_Copyright © 2020-2026 SilentXx. All rights reserved._
