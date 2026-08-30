import { defaultCoverList } from '@constants/site-config';
import type { CoverImageMap } from '../types/cover';

// 定义分类到图片目录的映射
const categoryImageMap: CoverImageMap = {
  // 一级分类映射
  'options-basics': 'options-basics',
  strategies: 'strategies',
  'cashflow-system': 'cashflow-system',
  tools: 'tools',
  options: 'options',

  // 子分类映射
  mindset: 'options-basics',
  metrics: 'options-basics',
  pitfalls: 'options-basics',
  selling: 'strategies',
  hedging: 'strategies',
  'trade-review': 'strategies',
  philosophy: 'cashflow-system',
  tactics: 'cashflow-system',
  rotation: 'cashflow-system',
  framework: 'cashflow-system',
  allocation: 'cashflow-system',
  'risk-control': 'cashflow-system',
  platforms: 'tools',
  screeners: 'tools',
  templates: 'tools',
};

// 根据分类路径获取该分类下的图片列表，按照新的优先级顺序：子目录 -> articles目录（仅无分类文章）
export function getDefaultCoversForPath(path: string): string[] {
  // 移除可能的前缀（如/categories/）
  const cleanPath = path.replace(/^\/?categories\//, '');

  // 特殊处理：将中文分类名转换为英文路径
  const pathMapping: Record<string, string> = {
    期权基础认知: 'mindset',
    期权核心参数: 'metrics',
    新手避坑与认知升级: 'pitfalls',
    // 添加缺失的一级分类映射
    期权入门与基础: 'options-basics',
    期权策略与实战: 'strategies',
    卖方核心策略: 'selling',
    买方与对冲策略: 'hedging',
    实盘拆解与复盘: 'trade-review',
    稳定现金流系统: 'cashflow-system',
    现金流系统构建: 'framework',
    策略组合与轮动: 'allocation',
    风险管理与回撤控制: 'risk-control',
    期权工具箱: 'tools',
    交易平台与模拟器: 'platforms',
    行情筛选与数据: 'screeners',
    模板与效率清单: 'templates',
  };

  // 如果路径包含中文分类名，进行转换
  let mappedPath = cleanPath;
  Object.keys(pathMapping).forEach((chinese) => {
    mappedPath = mappedPath.replace(chinese, pathMapping[chinese]);
  });

  // 特殊处理：如果分类是数组格式 ['期权入门与基础', '实盘分享']，提取具体的子分类
  if (mappedPath.includes('期权入门与基础') && mappedPath.includes('实盘分享')) {
    mappedPath = '实盘分享';
  }

  // 特殊处理：如果分类是数组格式 ['现金流乌托邦', '期权卖方策略']，提取具体的子分类
  if (mappedPath.includes('现金流乌托邦') && mappedPath.includes('期权卖方策略')) {
    mappedPath = '期权卖方策略';
  }

  // 对于文章列表，只从子目录获取图片
  const subDirImageDir = categoryImageMap[mappedPath];
  if (subDirImageDir) {
    const subDirImages = getImagesForDirectory(subDirImageDir);
    if (subDirImages.length > 0) {
      // 去除重复项，保持顺序
      const uniqueImages = [...new Set(subDirImages)];
      return uniqueImages;
    }
  }

  // 如果没有找到子目录图片，则回退到默认图片列表（用于无分类文章）
  // 去除重复项，保持顺序
  const uniqueImages = [...new Set(defaultCoverList)];
  return uniqueImages;
}

// 为精选分类获取图片列表，按照优先级顺序：子目录 -> 一级目录 -> articles目录
export function getFeaturedCoversForPath(path: string): string[] {
  // 移除可能的前缀（如/categories/）
  const cleanPath = path.replace(/^\/?categories\//, '');

  // 特殊处理：将中文分类名转换为英文路径
  const pathMapping: Record<string, string> = {
    期权基础认知: 'mindset',
    期权核心参数: 'metrics',
    新手避坑与认知升级: 'pitfalls',
    实盘分享: 'trading-journal', // 添加实盘分享映射
    // 添加缺失的一级分类映射
    期权入门与基础: 'options-basics',
    期权策略与实战: 'strategies',
    卖方核心策略: 'seller-strategies',
    买方与对冲策略: 'hedging-strategies',
    实盘拆解与复盘: 'trade-review',
    稳定现金流系统: 'cashflow-system',
    现金流系统构建: 'framework',
    策略组合与轮动: 'allocation',
    风险管理与回撤控制: 'risk-control',
    期权工具箱: 'tools',
    交易平台与模拟器: 'platforms',
    行情筛选与数据: 'screeners',
    模板与效率清单: 'templates',
  };

  // 如果路径包含中文分类名，进行转换
  let mappedPath = cleanPath;
  Object.keys(pathMapping).forEach((chinese) => {
    mappedPath = mappedPath.replace(chinese, pathMapping[chinese]);
  });

  // 特殊处理：如果分类是数组格式 ['期权入门与基础', '实盘分享']，提取具体的子分类
  if (mappedPath.includes('期权入门与基础') && mappedPath.includes('实盘分享')) {
    mappedPath = '实盘分享';
  }

  // 特殊处理：如果分类是数组格式 ['现金流乌托邦', '期权卖方策略']，提取具体的子分类
  if (mappedPath.includes('现金流乌托邦') && mappedPath.includes('期权卖方策略')) {
    mappedPath = '期权卖方策略';
  }

  // 获取所有可能的图片列表，按照优先级顺序
  const imageLists: string[][] = [];

  // 1. 首先尝试获取子目录的图片
  const subDirImageDir = categoryImageMap[mappedPath];
  if (subDirImageDir) {
    const subDirImages = getImagesForDirectory(subDirImageDir);
    if (subDirImages.length > 0) {
      imageLists.push(subDirImages);
    }
  }

  // 2. 然后尝试获取一级目录的图片
  // 提取一级目录路径
  const firstLevelPath = mappedPath.split('/')[0];
  const firstLevelImageDir = categoryImageMap[firstLevelPath];
  if (firstLevelImageDir && firstLevelImageDir !== subDirImageDir) {
    const firstLevelImages = getImagesForDirectory(firstLevelImageDir);
    if (firstLevelImages.length > 0) {
      imageLists.push(firstLevelImages);
    }
  }

  // 3. 最后回退到默认图片列表
  imageLists.push(defaultCoverList);

  // 合并所有图片列表，保持优先级顺序
  const allImages: string[] = [];
  imageLists.forEach((list) => {
    allImages.push(...list);
  });

  // 去除重复项，保持顺序
  const uniqueImages = [...new Set(allImages)];
  return uniqueImages;
}

// 根据目录名称获取该目录下的图片列表
function getImagesForDirectory(dir: string): string[] {
  switch (dir) {
    case 'Option-Basics/course':
      return [
        '/img/options/course/1.webp',
        '/img/options/course/2.webp',
        '/img/options/course/3.webp',
        '/img/options/course/4.webp',
        '/img/options/course/5.webp',
        '/img/options/course/6.webp',
        '/img/options/course/7.webp',
      ];
    case 'options/strategy':
      return [
        '/img/options/strategy/1.webp',
        '/img/options/strategy/2.webp',
        '/img/options/strategy/3.webp',
        '/img/options/strategy/4.webp',
        '/img/options/strategy/5.webp',
        '/img/options/strategy/6.webp',
        '/img/options/strategy/7.webp',
        '/img/options/strategy/8.webp',
        '/img/options/strategy/9.webp',
        '/img/options/strategy/10.webp',
      ];
    case 'options/trading-journal':
      return [
        '/img/options/trading-journal/1.webp',
        '/img/options/trading-journal/2.webp',
        '/img/options/trading-journal/3.webp',
        '/img/options/trading-journal/4.webp',
        '/img/options/trading-journal/5.webp',
        '/img/options/trading-journal/6.webp',
        '/img/options/trading-journal/7.webp',
      ];
    case 'options/option-selling':
      return [
        '/img/options/option-selling/1.webp',
        '/img/options/option-selling/2.webp',
        '/img/options/option-selling/3.webp',
        '/img/options/option-selling/4.webp',
        '/img/options/option-selling/5.webp',
        '/img/options/option-selling/6.webp',
        '/img/options/option-selling/7.webp',
        '/img/options/option-selling/8.webp',
      ];
    case 'cashflow-utopia/drip':
      return [
        '/img/cashflow-utopia/drip/1.webp',
        '/img/cashflow-utopia/drip/2.webp',
        '/img/cashflow-utopia/drip/3.webp',
        '/img/cashflow-utopia/drip/4.webp',
        '/img/cashflow-utopia/drip/5.webp',
        '/img/cashflow-utopia/drip/6.webp',
        '/img/cashflow-utopia/drip/7.webp',
        '/img/cashflow-utopia/drip/8.webp',
        '/img/cashflow-utopia/drip/9.webp',
      ];
    case 'cashflow-utopia/asset-allocation':
      return [
        '/img/cashflow-utopia/asset-allocation/1.webp',
        '/img/cashflow-utopia/asset-allocation/2.webp',
        '/img/cashflow-utopia/asset-allocation/3.webp',
        '/img/cashflow-utopia/asset-allocation/4.webp',
        '/img/cashflow-utopia/asset-allocation/5.webp',
        '/img/cashflow-utopia/asset-allocation/6.webp',
        '/img/cashflow-utopia/asset-allocation/7.webp',
      ];
    case 'cashflow-utopia':
      return [
        '/img/cashflow-utopia/1.webp',
        '/img/cashflow-utopia/2.webp',
        '/img/cashflow-utopia/3.webp',
        '/img/cashflow-utopia/4.webp',
      ];
    case 'options':
      return [
        '/img/options/course/Gambler-vs-House.webp',
        '/img/options/course/Traders-Armory.webp',
        '/img/options/course/monthly-cash-flow-wheel.webp',
      ];
    case 'options-basics':
      return ['/img/options/options-basics/1.webp', '/img/options/options-basics/2.webp', '/img/options/options-basics/3.webp'];
    case 'strategies':
      return ['/img/strategies/1.webp', '/img/strategies/2.webp', '/img/strategies/3.webp'];
    case 'cashflow-system':
      return [
        '/img/cashflow-system/1.webp',
        '/img/cashflow-system/2.webp',
        '/img/cashflow-system/3.webp',
        '/img/cashflow-system/4.webp',
      ];
    case 'tools':
      return ['/img/tools/1.webp', '/img/tools/2.webp', '/img/tools/3.webp'];
    case 'stock':
    default:
      // 如果找不到特定目录的图片，返回空数组
      return [];
  }
}

// 根据分类路径获取随机图片（用于文章列表）
export function getRandomCoverForPath(path: string): string {
  const covers = getDefaultCoversForPath(path);
  const randomIndex = Math.floor(Math.random() * covers.length);
  const cover = covers[randomIndex];
  return cover;
}

// 根据分类路径获取随机图片（用于精选分类）
export function getRandomFeaturedCoverForPath(path: string): string {
  const covers = getFeaturedCoversForPath(path);
  const randomIndex = Math.floor(Math.random() * covers.length);
  const cover = covers[randomIndex];
  return cover;
}

// 根据分类路径和文章slug获取固定图片（避免刷新时图片变化）
export function getFixedCoverForPath(path: string, slug: string): string {
  const covers = getDefaultCoversForPath(path);

  // 基于slug生成一个固定的索引
  let hash = 0;
  const slugStr = typeof slug === 'string' ? slug : String(slug);
  for (let i = 0; i < slugStr.length; i++) {
    const char = slugStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }

  // 确保索引为非负数
  const fixedIndex = Math.abs(hash) % covers.length;
  const cover = covers[fixedIndex];
  return cover;
}
