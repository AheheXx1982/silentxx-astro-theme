---
layout: ../layouts/AboutLayout.astro
title: '幻念集'
date: 2025-09-05
description: 'SilentXx｜寂静猎手 - 幻念集'
---

<!-- 标题和描述现在由 IllusionaryThoughtsContent 组件处理 -->

<!-- 引入瀑布流组件 -->
<div class="waterfall-wrapper">
  <!-- 
    注意：由于这是Markdown文件，我们需要在AboutLayout中动态引入WaterfallFlow组件
    这里只是一个占位符，实际的瀑布流内容会在布局中渲染
  -->
</div>

<!-- 隐藏的数据内容，供组件使用 -->
<div id="waterfall-data" style="display: none;">
  <!-- 内容将在JavaScript中处理 -->
</div>

<script>
  // 页面加载完成后不需要主动触发更新，让组件自己处理
  console.log('Illusionary Thoughts page loaded');
</script>