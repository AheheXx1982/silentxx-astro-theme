type SiteConfig = {
  title: string; // 网站标题名称（banner 上）
  alternate?: string; // 网站英文短名
  subtitle?: string; // 副标题
  name: string; // 作者名称
  description?: string; // 站点简介（一段话）
  avatar?: string; // 站点头像 logo.png or url
  showLogo?: boolean; // 是否显示 logo，否则用 alternate 当·logo
  author?: string; // 文章作者
  // theme
  enableJSGridCover?: boolean; // 是否启用 color4bg 的背景 (写了不舍得扔)
  site: string; // 站点线上域名 用于 RSS 生成等

  featuredCategories?: {
    link: string;
    image: string;
    label?: string;
    description?: string;
  }[];

  navLinks?: {
    name: string;
    href: string;
  }[];
};

// 社交媒体配置类型
type SocialPlatform = {
  url: string;
  icon: string;
  color: string; // default bg-primary/20
};

type SocialConfig = {
  github?: SocialPlatform;
  google?: SocialPlatform;
  twitter?: SocialPlatform;
  X?: SocialPlatform;
  zhihu?: SocialPlatform;
  music?: SocialPlatform;
  weibo?: SocialPlatform;
  about?: SocialPlatform;
  email?: SocialPlatform;
  facebook?: SocialPlatform;
  stackoverflow?: SocialPlatform;
  youtube?: SocialPlatform;
  instagram?: SocialPlatform;
  skype?: SocialPlatform;
  douban?: SocialPlatform;
  bilibili?: SocialPlatform;
  rss?: SocialPlatform;
  Tiger?: SocialPlatform;
  wenxin?: SocialPlatform;
};

// TODO: change to backend

// https://shoka.lostyu.me/computer-science/note/theme-shoka-doc/config/
export const siteConfig: SiteConfig = {
  title: '寂静猎手', // 网站名称
  alternate: 'SilentXx', // 网站名称
  subtitle: '美股期权实战 · 现金流系统与复利实验室', // 副标题
  name: 'SilentXx',
  description: '聚焦美股期权交易，分享真实、低风险、可复制的现金流投资策略，带你走进理性与纪律构建的投资世界。', // 站点简介（一段话）
  avatar: '/img/SilentXx.webp', // 站点头像 logo.png or url
  showLogo: true, // 是否显示 logo 否则用 title
  author: 'SilentXx', // 作者名称

  enableJSGridCover: false, // 是否启用 color4bg 的背景
  site: 'https://www.silentxx.com',

  // 添加 navLinks 配置
  navLinks: [
    { name: '首页', href: '/' },
    { name: '新手入门', href: '/options-basics' },
    { name: '策略进阶', href: '/strategies' },
    { name: '实盘分享', href: '/trading-journal' },
    { name: '交易洞察', href: '/trading-insights' },
    { name: '现金流系统', href: '/cashflow-system' },
    { name: '期权精品课', href: '/premium-course' },
    { name: '工具与资源', href: '/tools' },
  ],

  // featuredCategories 已废弃：真实渲染源是 i18n.ts 的 featuredCategories
  // （CategoryCards.astro 通过 getSiteConfig() 读取 i18n 配置）
  // 旧配置曾引用不存在的 /img/options/2.webp、/img/options/3.webp、/img/cashflow-utopia/4.webp → 已清理
  featuredCategories: [],
};

// 社交媒体配置
// https://icon-sets.iconify.design/ri/
export const socialConfig: SocialConfig = {
  wenxin: {
    url: 'https://wenxin.silentxx.com',
    icon: '/wenxin-favicon.svg', // 问心站标识（朱红「问」字印章）
    color: '#B0342A',
  },
  X: {
    url: '#',
    icon: 'ri:twitter-x-fill',
    color: '#000000',
  },
  music: {
    url: '#',
    icon: '/soda-music.png', // 汽水音乐官方图标
    color: '#1EA9FE',
  },
  // #google: https://plus.google.com/yourname || google
  // # about: https://about.me/amehime || address-card || "#3b5998"
  // #facebook: https://www.facebook.com/yourname || facebook
  // #stackoverflow: https://stackoverflow.com/yourname || stack-overflow
  // #youtube: https://youtube.com/yourname || youtube
  // #instagram: https://instagram.com/yourname || instagram
  // #skype: skype:yourname?call|chat || skype
  // #douban: https://www.douban.com/people/yourname/ || douban
  // # weibo: https://weibo.com/amehime || weibo || "#ea716e"
};

const { title, alternate, subtitle } = siteConfig;
export const seoConfig = {
  title: `${alternate ? alternate + '｜' : ''}${title}${subtitle ? ' · ' + subtitle : ''}`,
  description: '聚焦美股期权交易，分享真实、低风险、可复制的现金流投资策略，带你走进理性与纪律构建的投资世界。',
  keywords: 'SilentXx, 寂静猎手, 期权交易, 现金流投资, 美股期权, 投资策略, 金融博客',
  url: 'https://www.silentxx.com/',
};

// 注意：此列表作为默认的随机图片列表使用
// 对于特定分类的文章，系统会根据分类路径从对应的图片目录获取随机图片
// 图片获取优先级：子目录 -> 一级目录 -> articles目录
// 一级目录的图片正在更新中，以确保与各主题的相关性并避免与其他目录重复
// 请参见 src/lib/cover.ts 中的 getDefaultCoversForPath 和 getRandomCoverForPath 函数
export const defaultCoverList = [
  '/img/articles/1.webp',
  '/img/articles/2.webp',
  '/img/articles/3.webp',
  '/img/articles/4.webp',
  '/img/articles/5.webp',
  '/img/articles/6.webp',
  '/img/articles/7.webp',
  '/img/articles/8.webp',
  '/img/articles/9.webp',
  '/img/articles/10.webp',
  '/img/articles/11.webp',
];
