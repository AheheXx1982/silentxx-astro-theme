import rss from '@astrojs/rss';
import { getSortedPosts } from '@lib/content';
import { getSanitizeHtml } from '@lib/utils';
import { getSiteConfig } from '@lib/i18n';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import type { BlogPost } from 'types/blog';

// 转义 XML 特殊字符
const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
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
};

// 用于生成纯文本摘要的函数
const generateTextSummary = (html?: string, length: number = 150): string => {
  // 将HTML转换为纯文本（去除所有标签）
  const text = sanitizeHtml(html ?? '', {
    allowedTags: [], // 不允许任何标签
    allowedAttributes: {},
    textFilter: (text) => text.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm, ''),
  });
  // 截取指定长度，并确保不会截断词语
  if (text.length <= length) return text;
  return text.substring(0, length).replace(/\s+\S*$/, '');
};

export async function GET(context: APIContext) {
  // 获取中文版文章（默认语言）
  const posts = await getSortedPosts('zh', true);
  const { site } = context;

  if (!site) {
    throw new Error('Missing site metadata');
  }

  // 确保 posts 存在且为数组
  const validPosts = posts && Array.isArray(posts) ? posts : [];

  // 获取中文站点配置
  const siteConfig = getSiteConfig('zh');

  return rss({
    title: escapeXml(siteConfig.title),
    description: escapeXml(siteConfig.subtitle || 'No description'),
    site,
    trailingSlash: false,
    stylesheet: '/rss/cos-feed.xsl',
    items: validPosts
      .map((post: BlogPost) => {
        // 确保 post 和 post.data 存在
        if (!post || !post.data) {
          return null;
        }

        try {
          // 生成描述信息，确保有回退方案
          let description = '';
          if (post.data?.description) {
            description = post.data.description;
          } else if (post.rendered?.html) {
            description = generateTextSummary(post.rendered.html);
          } else {
            description = 'No description available';
          }

          // 对标题和描述进行XML转义
          const title = escapeXml(post.data.title || 'Untitled');

          // 验证日期
          const pubDate = post.data.date && !isNaN(new Date(post.data.date).getTime()) ? post.data.date : new Date();

          // 生成链接，确保不会出现 undefined（Astro7 p.slug 非 string，用 id 兜底）
          const rawSlug = (post as any).slug || (post as any).id || '';
          const slug =
            typeof rawSlug === 'string'
              ? rawSlug.split('/').pop()
              : String((post as any).id || '')
                  .split('/')
                  .pop();
          const postLink = post.data.link ? `/article/${post.data.link}` : `/article/${slug ?? 'post'}`;

          return {
            title: title,
            pubDate: pubDate,
            description: escapeXml(description),
            link: postLink,
            content: getSanitizeHtml(post.rendered?.html ?? ''),
          };
        } catch (error) {
          console.error(`Error processing post ${post.slug}:`, error);
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 20),
  });
}
