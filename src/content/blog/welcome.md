---
title: '欢迎使用 SilentXx Astro 主题'
slug: 'welcome'
description: '一个为内容创作者设计的 Astro 主题——智能目录、双语支持、精美排版，开箱即用。'
date: 2026-08-30
updated: 2026-08-30
tags: ['Astro', '主题', '入门']
categories: ['新手入门']
lang: 'zh'
cover: '/img/cover.webp'
---

欢迎使用 **SilentXx Astro 主题**——一个为内容创作者和独立开发者设计的现代化博客主题。

## 为什么选择这个主题

这个主题从 SilentXx 主站沉淀而来，经过真实生产环境验证：

- 🎨 **精美排版**：Tailwind CSS + 暗色/亮色双主题，阅读体验舒适
- 🌍 **双语支持**：中英文内容自动切换，一套代码两个语言版本
- 📑 **智能目录**：内置 SilentXx SmartToc 组件，自动为文章生成目录
- ⚡ **性能优先**：Astro 静态生成，页面秒开

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/AheheXx1982/silentxx-astro-theme.git

# 安装依赖
npm install

# 本地开发
npm run dev
```

## 目录结构

```text
src/
├── components/    # UI 组件库
├── layouts/       # 页面布局
├── lib/           # 工具函数
├── pages/         # 页面路由
├── styles/        # 全局样式
└── content/       # 文章内容
```

## 文章写作

在 `src/content/blog/` 下新建 Markdown 文件即可：

```markdown
---
title: '我的第一篇文章'
date: 2026-08-30
tags: ['Astro']
categories: ['新手入门']
lang: 'zh'
---

这里是正文内容……
```

## 下一步

- 查看[文章列表](/blog)浏览更多示例
- 切换右上角语言，体验双语效果
- 打开任意长文，体验左侧智能目录

祝你写作愉快！✍️
