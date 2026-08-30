---
title: 'Theme Features: How Smart TOC Works'
slug: 'theme-features-smart-toc'
description: 'How the built-in Smart TOC component works — a 5-level fallback chain that gives every article usable navigation.'
date: 2026-08-30
tags: ['Astro', 'Theme', 'SmartToc']
categories: ['策略进阶']
lang: 'en'
cover: '/img/cover.webp'
---

This article explains how the Smart TOC component built into the SilentXx Astro theme works.

## Why smart TOC

Articles migrated from legacy platforms often lack Markdown heading structure. Traditional TOC components show "No TOC", leaving readers lost in long posts.

SmartToc solves this with a 5-level fallback chain.

## The 5-level fallback chain

### Heading tree

Standard `##` / `###` headings render as a hierarchical tree with auto-numbering and scroll tracking.

### AI semantic chapters

For articles without headings, build-time AI data can cluster paragraphs into semantic chapters.

### Pseudo-heading detection

Automatically recognizes standalone short lines used as informal headings.

### Paragraph navigation

Last-resort fallback — one anchor per paragraph.

## Usage

```astro
<SilentXxSmartToc client:load defaultExpanded />
```

## Conclusion

Good navigation is half the reading experience. This component gives every article usable navigation — regardless of age or format.
