# SilentXx SmartToc

> **AI-powered adaptive table of contents for Astro + React sites.**
> Designed & open-sourced by [SilentXx](https://silentxx.com).

[中文文档](./README.zh-CN.md) · [npm](https://www.npmjs.com/package/silentxx-smart-toc)

A "smart" TOC component that adapts to whatever your articles look like — real heading trees, AI-generated semantic chapters, pseudo-headings, paragraph navigation, or nothing at all. **No article rewrites required.**

---

## Why SmartToc?

Most blog content migrated from legacy platforms (WeChat, forums, old CMS) has **no Markdown heading structure** (`##`/`###`). Classic TOC components show "no TOC" for these articles, leaving long-form readers without navigation.

SilentXx SmartToc solves this with a **5-level degradation chain** — it always finds the best possible navigation for the content at hand:

```plain
Headings tree  →  AI semantic chapters  →  Pseudo-heading detection  →  Paragraph navigation  →  "No TOC"
```

## Features

- 🤖 **AI semantic chapters** — for articles without headings, an AI clusters adjacent paragraphs by meaning (paragraphs about the same topic → one chapter) and generates concise titles. Output goes **only to the sidebar TOC — the article content is never modified**.
- 🌲 **Heading tree** — hierarchical indentation + auto numbering (1. / 1.1 / 1.2……), expanded by default, accordion scroll tracking.
- ✨ **Pseudo-heading detection** — automatically recognizes standalone short lines (5–30 chars) that authors used as informal headings (e.g. 「活在当下的真谛」).
- 📄 **Paragraph navigation** — last-resort fallback: one anchor per paragraph, numbered with an 18-char opening preview.
- 🧭 **Scroll tracking** — the active item is highlighted as you read; smooth-scroll on click.
- 🆔 **Stable Chinese-friendly anchors** — headings get real anchor ids like `#为什么剩下` instead of `heading-0`.
- 🧹 **Smart filtering** — image-only paragraphs, blockquotes, lists and tables are excluded from navigation.
- 📦 **Zero content changes** — pure client component; Markdown sources and the render pipeline stay untouched.

## Installation

```bash
npm install silentxx-smart-toc
```

Requires an Astro project with the React integration:

```bash
npx astro add react
```

## Quick Start

Copy the component into your project (e.g. `src/components/layout/SilentXxSmartToc.tsx`), then use it in your sidebar:

```astro
---
import { SilentXxSmartToc } from '@components/layout/SilentXxSmartToc';
---

<SilentXxSmartToc client:load defaultExpanded />
```

The component automatically scans the `<article>` element on the page for headings and paragraphs — wrap your post body in `<article>` and you're done.

## Props

| Prop              | Type      | Default | Description                                                                                           |
| ----------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `defaultExpanded` | `boolean` | `false` | Expand all sub-headings in tree mode by default (recommended `true`)                                  |
| `tocDataUrl`      | `string`  | auto    | URL of the AI TOC data JSON. Defaults to `/toc-data/<slug>.json`, slug extracted from the current URL |

## AI TOC Data (optional but powerful)

For articles without headings, drop a build-time-generated JSON file at `public/toc-data/<slug>.json` and the component will render it as semantic chapters. **The article itself is untouched.**

```json
{
  "slug": "my-article",
  "generated": "2026-08-30",
  "sections": [{ "title": "Chapter title", "anchor": "opening words of the chapter's first paragraph" }]
}
```

- `anchor` is matched against paragraph `textContent` prefixes to locate the chapter's start paragraph.
- If the file is missing, the component degrades automatically: pseudo-heading detection → paragraph navigation.

### Generating AI TOC data

Ship a `generate-toc` step in your build (any LLM with a JSON mode works). Input: article body. Prompt the model to:

1. Cluster adjacent paragraphs by topic — paragraphs about the same thing = one chapter.
2. Produce a concise title (6–20 chars) per chapter.
3. Emit `{ "sections": [{ "title", "anchor" }] }` where `anchor` is 4–12 chars copied verbatim from the chapter's first paragraph.

Validate anchors programmatically (each must prefix-match a real paragraph) before writing the JSON.

## Markdown Normalization Tool (companion)

`scripts/md-normalize.py` — for articles that _do_ have informal headings but not valid Markdown:

- Detects standalone short lines (5–30 chars) that act as headings.
- Converts them to standard `##` headings (fixes `✨ 1.` numbering, soft line breaks, CJK quotes, etc.).
- Excludes false positives: colon-terminated intro lines (`大宝剑是什么：`), sentence/emotion endings, image/quote/list paragraphs.
- Backs up every file before conversion.

Run it once to permanently normalize legacy articles — afterwards the heading tree kicks in directly.

## Architecture

```plain
┌─────────────────────────────────────────────────────────┐
│  SilentXxSmartToc (React, client:load)                  │
│                                                         │
│  1. Scan <article> for h2-h6                            │
│     ├─ ≥2 headings ────────────────► Heading tree mode  │
│     └─ otherwise ─────────────────────────────────┐     │
│  2. fetch /toc-data/<slug>.json                    │     │
│     ├─ valid sections ─────────────► AI chapter    │     │
│     └─ missing/invalid ───────────────────────┐    │     │
│  3. Pseudo-heading detection (5-30 char       │    │     │
│     standalone lines, ≥3)                     │    │     │
│     ├─ found ────────────────► Pseudo mode    │    │     │
│     └─ none ─────────────────────────────┐    │    │     │
│  4. Paragraph navigation (≥5 paragraphs)  │    │    │     │
│     ├─ enough ───────────────► Paragraphs │    │    │     │
│     └─ too short ────────────► "No TOC"   │    │    │     │
│                                        └────┴────┘    │
└─────────────────────────────────────────────────────────┘
```

Scroll tracking targets the active element in every mode; clicks smooth-scroll to the target.

## Styling

The component uses **Tailwind CSS utility classes + CSS variables** (`--primary`, `--muted-foreground`, ……) consistent with the SilentXx theme (light/dark adaptive). In projects without a matching theme, override the classes or provide the CSS variables. A headless (unstyled) variant is planned.

## Compatibility

- Astro 4.x / 5.x / 7.x (`client:load` React component)
- React 18+
- Modern browsers (`querySelectorAll`, `closest`, `scrollIntoView`, `fetch`, optional chaining)

## FAQ

**Q: Does the AI TOC data modify my articles?**
A: No. TOC data lives in separate JSON files. The component renders them in the sidebar only. Articles stay byte-identical.

**Q: I don't want to generate AI data.**
A: Fine — the component falls back to pseudo-heading detection, then paragraph navigation. Both are automatic.

**Q: My site isn't Tailwind.**
A: The classes are still applied but unstyled unless you define the CSS variables. Override `.toc-container` styles or wait for the headless variant.

**Q: Anchors with Chinese characters in the URL?**
A: Intended — they are stable, readable and valid HTML5 ids (e.g. `#为什么剩下`).

## Changelog

- **v1.2** — AI semantic chapters (build-time JSON), `tocDataUrl` prop
- **v1.1** — pseudo-heading detection (standalone 5–30 char lines)
- **v1.0** — heading tree + paragraph navigation, scroll tracking, Chinese anchors

## About the brand

SilentXx (寂静猎手) — options trading & steady cashflow systems; content and tools open-sourced.
Main site: https://silentxx.com · Moments (问心): https://wenxin.silentxx.com

MIT License © 2026 SilentXx
