import { type Language, DEFAULT_LANGUAGE, i18nSiteConfig, i18nSeoConfig, i18nUI } from '../constants/i18n';

// 获取当前语言的站点配置
export function getSiteConfig(lang: Language = DEFAULT_LANGUAGE) {
  return i18nSiteConfig[lang];
}

// 获取当前语言的SEO配置
export function getSeoConfig(lang: Language = DEFAULT_LANGUAGE) {
  return i18nSeoConfig[lang];
}

// 获取当前语言的UI文本
export function getUIText(lang: Language = DEFAULT_LANGUAGE) {
  return i18nUI[lang];
}

// 获取本地化的URL
export function getLocalizedUrl(path: string, lang: Language): string {
  // 移除开头的斜杠
  const cleanPath = path.replace(/^\//, '');

  if (lang === DEFAULT_LANGUAGE) {
    return `/${cleanPath}`;
  }

  return `/${lang}/${cleanPath}`;
}

// 获取所有语言版本的URL（用于生成hreflang）
export function getAllLocalizedUrls(path: string) {
  const urls: Record<Language, string> = {} as Record<Language, string>;

  Object.keys(i18nSiteConfig).forEach((lang) => {
    urls[lang as Language] = getLocalizedUrl(path, lang as Language);
  });

  return urls;
}

// 从Astro URL对象中提取语言
export function getLanguageFromAstroUrl(url: URL): Language {
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && Object.keys(i18nSiteConfig).includes(firstSegment)) {
    return firstSegment as Language;
  }

  return DEFAULT_LANGUAGE;
}

// 从路径中移除语言前缀
export function removeLanguageFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && Object.keys(i18nSiteConfig).includes(firstSegment)) {
    return '/' + segments.slice(1).join('/');
  }

  return path;
}

// 根据语言获取分类路径
export function getCategoryPath(categoryPath: string, lang: Language): string {
  if (lang === DEFAULT_LANGUAGE) {
    return `/categories/${categoryPath}`;
  }
  return `/${lang}/categories/${categoryPath}`;
}

// 根据语言获取文章路径
export function getArticlePath(articleSlug: string, lang: Language): string {
  if (lang === DEFAULT_LANGUAGE) {
    return `/article/${articleSlug}`;
  }
  return `/${lang}/article/${articleSlug}`;
}

// 检查路径是否是默认语言
export function isDefaultLanguage(lang: Language): boolean {
  return lang === DEFAULT_LANGUAGE;
}

// 获取语言显示名称
export function getLanguageDisplayName(lang: Language): string {
  const displayNames = {
    zh: '简体中文',
    en: 'English',
  };

  return displayNames[lang] || displayNames[DEFAULT_LANGUAGE];
}
