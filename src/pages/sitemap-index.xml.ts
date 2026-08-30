import { getAllPosts } from '@lib/content';
import type { APIContext } from 'astro';
import { getSiteConfig } from '@lib/i18n';

// 转义 XML 特殊字符
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export async function GET(context: APIContext) {
  const { site } = context;

  if (!site) {
    throw new Error('Missing site metadata');
  }

  // 获取所有博客文章（中文和英文）
  const allPosts = await getAllPosts();

  // 确保 posts 存在且为数组
  const validPosts = allPosts && Array.isArray(allPosts) ? allPosts : [];

  // 分离中英文文章
  const zhPosts = validPosts.filter((post) => !post.slug.startsWith('en/'));
  const enPosts = validPosts.filter((post) => post.slug.startsWith('en/'));

  // 生成中文文章URL列表（Astro7 p.slug 非 string，用 id 兜底）
  const zhPostUrls = zhPosts.map((post) => {
    const rawSlug = (post as any).slug || (post as any).id || '';
    const slug =
      typeof rawSlug === 'string'
        ? rawSlug.split('/').pop()
        : String((post as any).id || '')
            .split('/')
            .pop();
    const postUrl = `${site}article/${post.data.link ?? slug}/`;
    const lastMod = post.data.date.toISOString().split('T')[0];
    return {
      loc: postUrl,
      lastmod: lastMod,
      changefreq: 'weekly',
      priority: 0.8,
    };
  });

  // 生成英文文章URL列表
  const enPostUrls = enPosts.map((post) => {
    const rawSlug = (post as any).slug || (post as any).id || '';
    const slug =
      typeof rawSlug === 'string'
        ? rawSlug.replace('en/', '').split('/').pop()
        : String((post as any).id || '')
            .replace('en/', '')
            .split('/')
            .pop();
    const postUrl = `${site}en/article/${post.data.link ?? slug}/`;
    const lastMod = post.data.date.toISOString().split('T')[0];
    return {
      loc: postUrl,
      lastmod: lastMod,
      changefreq: 'weekly',
      priority: 0.8,
    };
  });

  // 主站栏目/功能页（顶级菜单 + 归档 + 标签 + 工具）
  const staticPages = [
    // 首页
    { path: '', priority: 1.0 },
    // 顶级栏目
    { path: 'options-basics', priority: 0.9 },
    { path: 'strategies', priority: 0.9 },
    { path: 'trading-journal', priority: 0.8 },
    { path: 'trading-insights', priority: 0.8 },
    { path: 'cashflow-system', priority: 0.9 },
    { path: 'premium-course', priority: 0.8 },
    { path: 'tools', priority: 0.8 },
    // 分类索引
    { path: 'categories/options-basics', priority: 0.7 },
    { path: 'categories/strategies', priority: 0.7 },
    { path: 'categories/cashflow-system', priority: 0.7 },
    { path: 'categories/tools', priority: 0.7 },
    // 信息页
    { path: 'about', priority: 0.7 },
    { path: 'archives', priority: 0.6 },
    { path: 'categories', priority: 0.6 },
    { path: 'tags', priority: 0.5 },
    // 功能页
    { path: 'greeks-calculator', priority: 0.7 },
    { path: 'investment', priority: 0.6 },
    { path: 'illusionary-thoughts', priority: 0.5 },
    { path: 'personal', priority: 0.4 },
    // RSS
    { path: 'rss.xml', priority: 0.4 },
  ];

  // 中文静态页面URL
  const zhPageUrls = staticPages.map((page) => {
    const pageUrl = page.path ? `${site}${page.path}/` : `${site}`;
    return {
      loc: pageUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.path === '' ? 'daily' : 'weekly',
      priority: page.priority,
    };
  });

  // 英文静态页面URL
  const enStaticPages = staticPages
    .filter((p) => p.path !== '')
    .map((page) => ({
      path: `en/${page.path}`,
      priority: page.priority,
    }));
  enStaticPages.unshift({ path: 'en', priority: 0.9 });

  const enPageUrls = enStaticPages.map((page) => {
    const pageUrl = `${site}${page.path}/`;
    return {
      loc: pageUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: page.priority,
    };
  });

  // 合并所有URL
  const allUrls = [...zhPageUrls, ...enPageUrls, ...zhPostUrls, ...enPostUrls];

  // 生成sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
