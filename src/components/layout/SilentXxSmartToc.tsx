import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
  children: Heading[];
  parent?: Heading;
}

interface ParaItem {
  id: string;
  text: string;
}

interface TocSection {
  title: string;
  anchor?: string;
}

interface SilentXxSmartTocProps {
  defaultExpanded?: boolean; // Configuration option for default expand/collapse state
  tocDataUrl?: string; // AI 目录数据 JSON 地址（默认 /toc-data/<slug>.json，slug 从 URL 提取）
}

type TocMode = 'headings' | 'ai' | 'pseudo' | 'paragraphs' | 'none';

// 段落目录阈值：正文有效段落数 >= 5 才生成段落导航
const PARAGRAPH_MIN_COUNT = 5;
// 段落最短字数（太短的无意义段落不参与目录）
const PARAGRAPH_MIN_CHARS = 12;
// 目录项预览字数
const PARAGRAPH_PREVIEW_CHARS = 18;
// 伪标题识别：独立成段的短句（作者当小标题用的普通段落）
// 长度范围 [PSEUDO_MIN_CHARS, PSEUDO_MAX_CHARS]，数量 >= PSEUDO_MIN_COUNT 才启用伪标题目录
const PSEUDO_MIN_CHARS = 5;
const PSEUDO_MAX_CHARS = 30;
const PSEUDO_MIN_COUNT = 3;

// 生成保留中文的锚点 id（原兜底规则会删掉中文导致 heading-0/heading-1 弱 id）
function makeAnchorId(text: string, index: number, prefix: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留汉字/字母/数字/空格/连字符
    .replace(/\s+/g, '-')
    .trim()
    .slice(0, 60);
  return slug || `${prefix}-${index}`;
}

// Calculate hierarchical numbering for headings
function calculateHeadingNumbers(headings: Heading[]): void {
  const counters: number[] = [0, 0, 0, 0, 0, 0]; // counters for h1-h6

  function processHeading(heading: Heading) {
    const level = heading.level;

    // Increment current level counter
    counters[level - 1]++;

    // Reset all deeper level counters
    for (let i = level; i < 6; i++) {
      counters[i] = 0;
    }

    // Generate number string (e.g., "1.2.3.")
    const numberParts = [];
    for (let i = 0; i < level; i++) {
      if (counters[i] > 0) {
        numberParts.push(counters[i]);
      }
    }
    const numberStr = numberParts.join('.') + '. ';

    heading.text = numberStr + heading.text;

    // Process children
    heading.children.forEach(processHeading);
  }

  headings.forEach(processHeading);
}

// Build hierarchical structure from flat heading list
function buildHeadingTree(flatHeadings: Array<{ id: string; text: string; level: number }>): Heading[] {
  const tree: Heading[] = [];
  const stack: Heading[] = [];

  flatHeadings.forEach((heading) => {
    const newHeading: Heading = {
      ...heading,
      children: [],
    };

    // Find the appropriate parent
    while (stack.length > 0 && stack[stack.length - 1].level >= newHeading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // This is a root level heading
      tree.push(newHeading);
    } else {
      // This is a child of the last item in stack
      const parent = stack[stack.length - 1];
      parent.children.push(newHeading);
      newHeading.parent = parent;
    }

    stack.push(newHeading);
  });

  return tree;
}

// 从 URL 提取文章 slug（/article/<slug>/ → <slug>）
function extractSlug(): string {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : '';
}

export function SilentXxSmartToc({ defaultExpanded = false, tocDataUrl }: SilentXxSmartTocProps = {}) {
  const [mode, setMode] = useState<TocMode>('none');
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [paragraphs, setParagraphs] = useState<ParaItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Find a heading by ID in the tree structure
  const findHeadingById = (headings: Heading[], id: string): Heading | null => {
    for (const heading of headings) {
      if (heading.id === id) {
        return heading;
      }
      const found = findHeadingById(heading.children, id);
      if (found) {
        return found;
      }
    }
    return null;
  };

  // Get all parent IDs for a given heading
  const getParentIds = (heading: Heading): string[] => {
    const parentIds: string[] = [];
    let current = heading.parent;
    while (current) {
      parentIds.push(current.id);
      current = current.parent;
    }
    return parentIds;
  };

  // Get all siblings of a heading (headings at the same level with the same parent)
  const getSiblingIds = (targetHeading: Heading): string[] => {
    const siblings: string[] = [];

    if (!targetHeading.parent) {
      // This is a root level heading, get all root level headings
      headings.forEach((heading) => {
        if (heading.id !== targetHeading.id && heading.children.length > 0) {
          siblings.push(heading.id);
        }
      });
    } else {
      // This has a parent, get all children of the parent
      targetHeading.parent.children.forEach((heading) => {
        if (heading.id !== targetHeading.id && heading.children.length > 0) {
          siblings.push(heading.id);
        }
      });
    }

    return siblings;
  };

  // Auto-expand parents when activeId changes
  useEffect(() => {
    if (mode !== 'headings' || !activeId || headings.length === 0) {
      return;
    }
    const activeHeading = findHeadingById(headings, activeId);
    if (!activeHeading) {
      return;
    }
    const parentIds = getParentIds(activeHeading);

    // Include the active heading itself if it has children
    const allHeadingsToProcess = [...parentIds];
    if (activeHeading.children.length > 0) {
      allHeadingsToProcess.unshift(activeId);
    }

    if (allHeadingsToProcess.length > 0) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);

        // For each parent level, apply accordion effect
        const parentsByLevel: { [level: number]: string[] } = {};

        // Group parents by level
        allHeadingsToProcess.forEach((parentId) => {
          const parentHeading = findHeadingById(headings, parentId);
          if (parentHeading) {
            if (!parentsByLevel[parentHeading.level]) {
              parentsByLevel[parentHeading.level] = [];
            }
            parentsByLevel[parentHeading.level].push(parentId);
          }
        });

        // For each level, close siblings and open the required parent
        Object.keys(parentsByLevel).forEach((levelStr) => {
          const level = parseInt(levelStr);
          const parentsAtLevel = parentsByLevel[level];

          parentsAtLevel.forEach((parentId) => {
            const parentHeading = findHeadingById(headings, parentId);
            if (parentHeading) {
              // Close siblings at this level
              const siblingIds = getSiblingIds(parentHeading);
              siblingIds.forEach((siblingId) => newSet.delete(siblingId));

              // Open this parent
              newSet.add(parentId);
            }
          });
        });

        return newSet;
      });
    }
  }, [activeId, headings, mode]);

  useEffect(() => {
    let cancelled = false;
    const articleContent = document.querySelector('article');
    if (!articleContent) return;

    // ---- 1. 收集标题 (h2-h6，h1 是文章标题在 article 外) ----
    const headingElements = articleContent.querySelectorAll('h2, h3, h4, h5, h6');

    // 给无 id 的标题生成稳定锚点（保留中文）
    headingElements.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = makeAnchorId(heading.textContent || '', index, 'h');
      }
    });

    if (headingElements.length >= 2) {
      // ---- 标题目录模式 ----
      const flatHeadings: Array<{ id: string; text: string; level: number }> = Array.from(headingElements).map((heading) => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1)), // Get heading level (2-6)
      }));

      const headingTree = buildHeadingTree(flatHeadings);
      calculateHeadingNumbers(headingTree);
      setHeadings(headingTree);
      setParagraphs([]);
      setMode('headings');

      // Set initial expanded state based on configuration
      if (defaultExpanded) {
        const allIds = new Set<string>();
        function collectIds(headings: Heading[]) {
          headings.forEach((heading) => {
            if (heading.children.length > 0) {
              allIds.add(heading.id);
            }
            collectIds(heading.children);
          });
        }
        collectIds(headingTree);
        setExpandedIds(allIds);
      }
    } else {
      // ---- 无标题/单标题：1) AI 目录 2) 伪标题 3) 段落导航 4) 暂无 ----
      // 1) 优先加载构建时生成的 AI 目录数据（toc-data/<slug>.json）
      const loadAiToc = async (): Promise<ParaItem[] | null> => {
        const slug = extractSlug();
        const url = tocDataUrl ?? (slug ? `/toc-data/${slug}.json` : '');
        if (!url) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const data = (await res.json()) as { sections?: TocSection[] };
          if (!data?.sections || data.sections.length < 2) return null;
          const paras = Array.from(articleContent.querySelectorAll('p'));
          const items: ParaItem[] = [];
          for (const s of data.sections) {
            const t = (s.anchor || '').trim();
            if (!t) continue;
            const el = paras.find((p) => (p.textContent || '').trim().startsWith(t));
            if (!el) continue;
            const id = `ai-${makeAnchorId(s.title, items.length, 'sec')}`;
            el.id = id;
            items.push({ id, text: s.title });
          }
          return items.length >= 2 ? items : null;
        } catch {
          return null;
        }
      };

      loadAiToc().then((aiItems) => {
        if (cancelled) return;
        if (aiItems) {
          setParagraphs(aiItems);
          setHeadings([]);
          setMode('ai');
          return;
        }
        // 2) 伪标题识别：独立成段的短句（5-30 字），数量 >= 3 时视为文章小标题
        const allParas = Array.from(articleContent.querySelectorAll('p')).filter((p) => {
          const t = (p.textContent || '').trim();
          if (p.querySelector('img')) return false; // 纯图片段落
          if (p.closest('blockquote')) return false; // 引用块内的
          if (p.closest('li')) return false; // 列表项内的
          if (p.closest('table')) return false; // 表格内的
          if (t.length < 2) return false; // 空段落
          return true;
        });

        const pseudoCandidates = allParas.filter((p) => {
          const t = (p.textContent || '').trim();
          return t.length >= PSEUDO_MIN_CHARS && t.length <= PSEUDO_MAX_CHARS;
        });

        if (pseudoCandidates.length >= PSEUDO_MIN_COUNT) {
          const items: ParaItem[] = pseudoCandidates.map((p, i) => {
            const t = (p.textContent || '').trim();
            p.id = `toc-${makeAnchorId(t, i, 'pseudo')}`;
            return { id: p.id, text: t };
          });
          setParagraphs(items);
          setHeadings([]);
          setMode('pseudo');
          return;
        }
        // 3) 段落目录模式
        if (allParas.length >= PARAGRAPH_MIN_COUNT) {
          const paras = allParas.filter((p) => {
            const t = (p.textContent || '').trim();
            return t.length >= PARAGRAPH_MIN_CHARS;
          });
          if (paras.length >= PARAGRAPH_MIN_COUNT) {
            const items: ParaItem[] = paras.map((p, i) => {
              if (!p.id) {
                p.id = `para-${i + 1}`;
              }
              const t = (p.textContent || '').trim();
              const preview = t.length > PARAGRAPH_PREVIEW_CHARS ? `${t.slice(0, PARAGRAPH_PREVIEW_CHARS)}…` : t;
              return { id: p.id, text: preview };
            });
            setParagraphs(items);
            setHeadings([]);
            setMode('paragraphs');
            return;
          }
        }
        // 4) 暂无目录
        setMode('none');
        setHeadings([]);
        setParagraphs([]);
      });
    }

    // ---- 滚动监听：高亮当前阅读位置 ----
    const getTargets = (): HTMLElement[] => {
      if (mode === 'headings') {
        return Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'));
      }
      if (mode === 'ai') {
        return Array.from(document.querySelectorAll('p[id^="ai-"]'));
      }
      if (mode === 'pseudo' || mode === 'paragraphs') {
        return Array.from(document.querySelectorAll('p[id^="toc-"], p[id^="para-"]'));
      }
      return [];
    };

    const handleScroll = () => {
      const targets = getTargets();
      if (targets.length === 0) return;

      let current = '';
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        // Check if target is in viewport or above it (with some offset for header)
        if (rect.top <= 120) {
          current = target.id;
        } else {
          break;
        }
      }

      if (current && current !== activeId) {
        setActiveId(current);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);

      // Immediately trigger the expand logic for this heading
      if (mode === 'headings') {
        const clickedHeading = findHeadingById(headings, id);
        if (clickedHeading) {
          const parentIds = getParentIds(clickedHeading);
          // Include the clicked heading itself if it has children
          if (clickedHeading.children.length > 0) {
            parentIds.unshift(id);
          }

          if (parentIds.length > 0) {
            setExpandedIds((prev) => {
              const newSet = new Set(prev);

              // For each parent level, apply accordion effect
              const parentsByLevel: { [level: number]: string[] } = {};

              // Group parents by level
              parentIds.forEach((parentId) => {
                const parentHeading = findHeadingById(headings, parentId);
                if (parentHeading) {
                  if (!parentsByLevel[parentHeading.level]) {
                    parentsByLevel[parentHeading.level] = [];
                  }
                  parentsByLevel[parentHeading.level].push(parentId);
                }
              });

              // For each level, close siblings and open the required parent
              Object.keys(parentsByLevel).forEach((levelStr) => {
                const level = parseInt(levelStr);
                const parentsAtLevel = parentsByLevel[level];

                parentsAtLevel.forEach((parentId) => {
                  const parentHeading = findHeadingById(headings, parentId);
                  if (parentHeading) {
                    // Close siblings at this level
                    const siblingIds = getSiblingIds(parentHeading);
                    siblingIds.forEach((siblingId) => newSet.delete(siblingId));

                    // Open this parent
                    newSet.add(parentId);
                  }
                });
              });

              return newSet;
            });
          }
        }
      }
    }
  };

  const renderHeadings = (headings: Heading[], depth = 0): React.ReactElement[] => {
    return headings.flatMap((heading) => {
      const isActive = activeId === heading.id;
      const isExpanded = expandedIds.has(heading.id);
      const hasChildren = heading.children.length > 0;

      const elements: React.ReactElement[] = [
        <div key={heading.id} className="relative">
          <a
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(heading.id);
            }}
            className={`group hover:bg-muted/60 hover:text-foreground relative flex items-center rounded-md py-2 text-sm transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary border-l-primary hover:text-primary hover:bg-primary/10 border-l-2 font-medium'
                : 'text-muted-foreground hover:border-l-primary/40 hover:border-l-2'
            } `}
            style={{
              paddingLeft: `${0.75 + depth * 1}rem`,
              paddingRight: hasChildren ? '0.5rem' : '0.75rem',
            }}
            aria-label={heading.text}
          >
            {/* 标题文本 */}
            <span className="block flex-1 truncate leading-relaxed">{heading.text}</span>
            {/* 活跃状态指示器 */}
            {isActive && <span className="text-primary ml-2 text-xs">•</span>}
          </a>
        </div>,
      ];

      // Add children if expanded
      if (hasChildren && isExpanded) {
        elements.push(...renderHeadings(heading.children, depth + 1));
      }

      return elements;
    });
  };

  const renderParagraphs = (): React.ReactElement[] => {
    return paragraphs.map((para, index) => {
      const isActive = activeId === para.id;
      return (
        <div key={para.id} className="relative">
          <a
            href={`#${para.id}`}
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(para.id);
            }}
            className={`group hover:bg-muted/60 hover:text-foreground relative flex items-center rounded-md py-1.5 text-xs transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary border-l-primary hover:text-primary hover:bg-primary/10 border-l-2 font-medium'
                : 'text-muted-foreground hover:border-l-primary/40 hover:border-l-2'
            } `}
            style={{ paddingLeft: '0.75rem', paddingRight: '0.5rem' }}
            aria-label={para.text}
          >
            <span className="text-muted-foreground/70 mr-1.5 shrink-0">{index + 1}.</span>
            <span
              className={`block flex-1 truncate leading-relaxed ${mode === 'pseudo' || mode === 'ai' ? 'font-medium' : ''}`}
            >
              {para.text}
            </span>
            {isActive && <span className="text-primary ml-2 text-xs">•</span>}
          </a>
        </div>
      );
    });
  };

  if (
    mode === 'none' ||
    (mode === 'headings' && headings.length === 0) ||
    ((mode === 'ai' || mode === 'pseudo' || mode === 'paragraphs') && paragraphs.length === 0)
  ) {
    return (
      <div className="text-muted-foreground py-6 text-center">
        <div className="text-sm">暂无目录</div>
      </div>
    );
  }

  return (
    <nav className="toc-container max-h-[calc(100vh-8rem)] overflow-auto" aria-label="文章目录">
      <div className="space-y-1 pr-2">{mode === 'headings' ? renderHeadings(headings) : renderParagraphs()}</div>
    </nav>
  );
}
