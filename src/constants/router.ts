export type Router = {
  name?: string;
  path?: string;
  icon?: string;
  children?: Router[];
};

export enum Routes {
  Home = '/',
  // Articles = '/articles',
  IllusionaryThoughts = '/illusionary-thoughts',
  About = '/about',
  Categories = '/categories',
  OptionsCourse = '/categories/options-basics/course',
  TradingJournal = '/trading-journal',
  // Tags = '/tags',
  // Gallery = '/gallery',
  Post = '/article',
  Archives = '/archives',
  // Dashboard = '/dashboard',
}

export const routers: Router[] = [
  { name: '首页', path: Routes.Home, icon: 'fa6-solid:house-chimney' },
  // 移除猎场分类
  // {
  //   name: '猎场',
  //   path: Routes.Articles,
  //   icon: 'ri:quill-pen-ai-fill',
  //   children: [
  //     // { name: '标签', path: Routes.Tags, icon: 'fa6-solid:tags' },
  //     // { name: '分类', path: Routes.Categories, icon: 'ri:grid-fill' },
  //     // { name: '归档', path: Routes.Archives, icon: 'ri:archive-2-fill' },
  //     { name: '课程', path: Routes.OptionsCourse, icon: 'ri:book-read-fill' },
  //     { name: '实盘分享', path: Routes.TradingJournal, icon: 'ri:stock-line' },
  //     { name: '关于', path: Routes.About, icon: 'fa6-regular:circle-user' },
  //   ],
  // },
  // 将课程、实盘分享、关于、幻念集作为同级目录菜单
  { name: '课程', path: Routes.OptionsCourse, icon: 'ri:book-read-fill' },
  { name: '实盘分享', path: Routes.TradingJournal, icon: 'ri:stock-line' },
  { name: '交易洞察', path: '/trading-insights', icon: 'ri:lightbulb-flash-line' },
  { name: '关于', path: Routes.About, icon: 'fa6-regular:circle-user' },
  { name: '幻念集', path: Routes.IllusionaryThoughts, icon: 'ri:stock-line' },
  // { name: '展示柜', path: Routes.Gallery },
  // { name: '仪表盘', path: Routes.Dashboard, needOwner: true },
];
