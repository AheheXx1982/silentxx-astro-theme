import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// 文章搜索索引：构建时生成全站文章 JSON，供 ChatWidget 前端本地搜索
// URL: /data/search-index.json

function stripMarkdown(md: string): string {
  return (md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenCategories(c: unknown): string[] {
  if (!c) return [];
  const flat: string[] = [];
  const walk = (x: unknown) => {
    if (typeof x === 'string') flat.push(x);
    else if (Array.isArray(x)) x.forEach(walk);
  };
  walk(c);
  return flat;
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const articles = posts
    .filter((p) => p.data.lang !== 'en')
    .map((p) => {
      const rawSlug = (p as any).slug || (p as any).id || '';
      const slug =
        typeof rawSlug === 'string'
          ? rawSlug.split('/').pop()
          : String((p as any).id || '')
              .split('/')
              .pop();
      const body = stripMarkdown(p.body || '');
      return {
        title: p.data.title || '',
        url: `/article/${slug}`,
        summary: p.data.description || body.slice(0, 150),
        content: body.slice(0, 500),
        tags: p.data.tags || [],
        categories: flattenCategories(p.data.categories),
        date: p.data.date ? String(p.data.date).slice(0, 10) : '',
      };
    })
    .sort((a, b) => (b.date < a.date ? -1 : 1));

  return new Response(JSON.stringify({ generated: new Date().toISOString().slice(0, 10), articles }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
