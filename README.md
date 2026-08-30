# 🚀 SilentXx Astro Theme

_为内容创作者打造的现代博客主题 · AI 智能目录 · 中英双语 · 精美排版_

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7.x-ff5d01?logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

[🌍 Live Demo](https://www.silentxx.com) • [📖 English Docs](./README_EN.md) •
[🚀 Quick Start](#-安装部署--installation--deployment) • [🏗️ Architecture](#-项目结构--project-structure) • [📑 智能目录](#-智能目录--smart-toc)

---

## 📖 项目简介 / Project Overview

SilentXx Astro Theme 是一个从生产环境沉淀而来的开源博客主题——SilentXx 主站每天在用它发布内容，你拿到的是经过真实世界检验的代码。

**核心理念**：

- **每一篇文章，都值得一个可用的目录**——不管它有没有标题结构（这就是内置 SmartToc 的使命）
- **写作体验优先**——放下 Markdown 文件，剩下的交给主题：目录、搜索、双语、SEO 全自动
- **美是功能的一部分**——亮暗双主题、黑胶音乐播放器、标签关系图谱，细节即诚意

**它能做什么**：中英双语内容自动路由、侧边智能目录、分类标签体系、RSS/Sitemap、音乐播放器、AI 助手接入位——一个内容创作者需要的，都在这里了。

---

## ✨ 核心功能 / Key Features

| 功能                          | 说明                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| 📑 **智能目录（SmartToc）**   | ★ 主题灵魂：五级降级链，无标题文章也能有可用导航（详见下方专章）      |
| 🌐 **中英双语**               | i18n 路由（`/` 中文 + `/en/` 英文），一套代码两个语言版本              |
| 🎨 **Tailwind CSS**           | 亮色/暗色双主题，精美排版，CSS 变量可定制                              |
| 🎵 **音乐播放器**             | 黑胶风格悬浮播放器，最小化卡通脸，拖拽 + 吸附                          |
| 🗺️ **标签图谱**               | Obsidian 风格 SVG 力导向关系图谱（缩放/拖拽/呼吸动效）                 |
| 🎨 **shadcn/ui**              | 现代化组件库，一致的设计语言                                           |
| 📱 **响应式设计**             | 多设备适配，移动端抽屉菜单                                             |
| 🤖 **AI 助手接入位**          | ChatWidget 组件就位，配好 `PUBLIC_COMPANION_API` 即可启用              |
| 🏷️ **分类与标签**             | 内容组织开箱即用，`_config.yml` 一行配置分类映射                       |
| 📰 **RSS + Sitemap**          | 中英双语 RSS Feed + 全站 Sitemap，自动生成                             |

---

## 🏗️ 项目结构 / Project Structure

```plaintext
silentxx-astro-theme/
├── src/
│   ├── components/         # 组件库（SmartToc/播放器/AI助手/图谱/卡片等）
│   ├── constants/          # 常量配置（site-config/i18n/category）
│   ├── content/
│   │   └── blog/           # 博客内容（中文 + en/ 英文）
│   ├── layouts/            # 布局模板
│   ├── lib/                # 核心库（content/cover/i18n/utils）
│   ├── pages/              # 页面路由 + RSS/Sitemap 端点
│   ├── scripts/            # Shoka 配置转换等
│   ├── store/              # 全局状态
│   └── styles/             # 样式文件
├── public/                 # 静态资源
│   ├── assets/             # Neural Core 特效资源
│   └── img/                # 图片资源（统一 1080px webp）
├── _config.yml             # Shoka 分类映射（category_map）
├── astro.config.mjs        # Astro 配置
├── tailwind.config.mjs     # Tailwind CSS 配置
└── package.json            # 项目依赖（pnpm）
```

---

## 📋 环境要求 / Requirements

- Node.js >= 22（本地开发建议 LTS）
- pnpm >= 10.x

---

## 🔧 环境变量 / Environment Variables

| 变量                   | 用途                                          |
| ---------------------- | --------------------------------------------- |
| `PUBLIC_COMPANION_API` | AI 助手后端地址（可选，不配置则聊天组件隐藏） |

---

## 🛠️ 开发命令 / Development Commands

```bash
pnpm dev              # 启动开发服务器（localhost:4321）
pnpm build            # 静态构建（输出到 dist/）
pnpm preview          # 预览构建结果
```

---

## 🔧 安装部署 / Installation & Deployment

```bash
# 1. 克隆项目
git clone https://github.com/AheheXx1982/silentxx-astro-theme.git
cd silentxx-astro-theme

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 构建生产版本
pnpm build

# 5. 预览构建结果
pnpm preview
```

**部署**：直接推 Vercel / Netlify / Cloudflare Pages，零配置。

---

## 📑 智能目录 / Smart TOC

> 这是这个主题的灵魂，值得单独一章。

### 为什么需要它

从公众号、论坛、旧 CMS 迁移过来的文章，大多没有 Markdown 标题结构。传统目录组件只能甩给你一句"暂无目录"——三千字的长文，读者翻到底都不知道自己读到哪里。

### 五级降级链

```
标题树  →  AI 语义章节  →  伪标题识别  →  段落导航  →  "暂无目录"
```

| 级别 | 模式 | 什么时候生效 |
| ---- | ---- | ------------ |
| 1 | **标题树** | 文章有标准 `##`/`###` 标题，层级缩进 + 自动编号 + 滚动高亮 |
| 2 | **AI 语义章节** | 无标题但有 `public/toc-data/<slug>.json` 数据，AI 按语义聚类生成精炼章节 |
| 3 | **伪标题识别** | 作者用普通短句当小标题（如「活在当下的真谛」），自动识别 |
| 4 | **段落导航** | 最终兜底，每段一个锚点，保证长文始终有导航 |
| 5 | **暂无目录** | 短文不强行生成，保持干净 |

**关键承诺：AI 目录只输出到侧边栏，文章内容一字不改。**

组件也独立发布在 npm：[`silentxx-smart-toc`](https://www.npmjs.com/package/silentxx-smart-toc)（[独立仓库](https://github.com/AheheXx1982/silentxx-smart-toc)），任何 Astro 项目都能用。

---

## 🖼️ 图片规范 / Image Guidelines

- **格式统一**：全站图片统一为 `.webp` 格式
- **宽度统一**：封面图 1080px 宽（1080×466 封面比例 2.32:1）
- **封面系统**：`src/lib/cover.ts` 管理分类→图片映射，支持默认封面池 + 分类特定封面 + 文章正文首图提取
- **图片目录**：`public/img/`（站点资源）、`public/images/posts/`（文章配图）

---

## 📈 更新日志 / Changelog

🎯 **当前版本: v1.0.0 (2026-08-30)**

### v1.0.0 — 开源发布 / Open Source Release

- ✅ **主题开源**：从 SilentXx 生产站脱敏沉淀，剥离全部私人内容（个人文章/交易数据/私有页面），保留完整主题能力
- ✅ **智能目录**：内置 SilentXx SmartToc（五级降级链），无需额外配置
- ✅ **双语示例**：中英文 demo 文章 + 双语路由演示
- ✅ **构建验证**：pnpm install + astro build 全流程通过

---

## 🙏 致谢 / Thanks

### 核心灵感 / Inspiration

- [师傅👩🏻余弦の博客](https://space.cosine.ren/)
- [太师傅🧔🏻‍♀️Hexo Shoka](https://github.com/amehime/hexo-theme-shoka)

### 技术支持 / Tech Support

- [Astro](https://astro.build/) • [Vercel](https://vercel.com/) • [shadcn/ui](https://ui.shadcn.com/) • [Tailwind CSS](https://tailwindcss.com/)

让我们一起构建更好的技术社区！ / Let's build a better tech community together!

_Made with ❤️ by SilentXx_
_Copyright © 2020-2026 SilentXx. All rights reserved._
