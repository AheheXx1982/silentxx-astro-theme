import { Routes } from '@constants/router';
import type { Language } from '@constants/i18n';
import type { BlogPost } from 'types/blog';

export type RouteParams<T extends Routes> = T extends Routes.Post ? BlogPost | undefined : undefined;

export function routeBuilder<T extends Routes>(route: T, param: RouteParams<typeof route>, lang?: Language) {
  let href: string = route;
  if (!param) return href;
  switch (route) {
    case Routes.Post:
      // 使用自定义链接或slug的最后一部分作为文章标识符
      const articlePath = `/article/${param?.data?.link ?? param?.slug.split('/').pop() ?? param?.slug}`;
      // 如果是英文，添加语言前缀
      href = lang === 'en' ? `/en${articlePath}` : articlePath;
      break;
    default:
      break;
  }
  return href;
}

export const showDirRoutes = [Routes.Post];
