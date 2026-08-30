import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.PUBLIC_COMPANION_API || '';

// 本地文章搜索索引缓存（首次加载后复用）
interface ArticleEntry {
  title: string;
  url: string;
  summary: string;
  content: string;
  tags: string[];
  categories: string[];
  date: string;
}
let articleIndexCache: ArticleEntry[] | null = null;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SearchResult {
  title: string;
  url: string;
  summary: string;
  tags: string[];
  score: number;
  confidence: string;
  source: 'article' | 'wiki';
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    '嗨~ 我是 **SilentXx AI Companion**，你的期权学习与生活伴侣 💕\n\n我可以：\n📚 解答期权问题\n💬 陪你聊天、听你吐槽\n🎵 讲故事、说笑话\n🌱 陪你一起成长！\n\n今天想聊什么呢？',
};

// 本地文章搜索：标题/标签/分类/正文关键词匹配
function searchArticles(query: string, index: ArticleEntry[]): ArticleEntry[] {
  const q = query.trim().toLowerCase();
  if (!q || index.length === 0) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { a: ArticleEntry; score: number }[] = [];
  for (const a of index) {
    const title = a.title.toLowerCase();
    const tags = a.tags.join(' ').toLowerCase();
    const cats = a.categories.join(' ').toLowerCase();
    const content = a.content.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (cats.includes(t)) score += 6;
      if (tags.includes(t)) score += 4;
      if (content.includes(t)) score += 1;
    }
    if (score > 0) scored.push({ a, score });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, 5).map((s) => s.a);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // 监听浮动工具栏的 AI 助手按钮（FloatingGroup 派发 open-ai-chat 事件）
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('open-ai-chat', openHandler);
    return () => window.removeEventListener('open-ai-chat', openHandler);
  }, []);

  // 预加载本地文章索引（只拉一次）
  const loadArticleIndex = useCallback(async (): Promise<ArticleEntry[]> => {
    if (articleIndexCache) return articleIndexCache;
    try {
      const resp = await fetch('/data/search-index.json');
      if (resp.ok) {
        const data = await resp.json();
        articleIndexCache = data.articles || [];
        return articleIndexCache;
      }
    } catch {}
    return [];
  }, []);

  // ── 发送消息（聊天 + 搜索合一）──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    // 1. 本地文章索引搜索：命中直接显示文章卡片（站内文章，可点进原文）
    const index = await loadArticleIndex();
    const articleHits = searchArticles(text, index);
    if (articleHits.length > 0) {
      setSearchResults(
        articleHits.map((a) => ({
          title: a.title,
          url: a.url,
          summary: a.summary || a.content.slice(0, 120),
          tags: a.tags,
          score: 0,
          confidence: '',
          source: 'article',
        })),
      );
      setSearchQuery(text);
      setInput('');
      return;
    }

    // 2. 后端 Wiki 搜索：命中显示 Wiki 结果卡片
    try {
      const searchResp = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(text)}&top_k=5`);
      if (searchResp.ok) {
        const searchData = await searchResp.json();
        const hits = searchData.results || [];
        if (hits.length > 0) {
          setSearchResults(hits.map((h: any) => ({ ...h, source: 'wiki' as const })));
          setSearchQuery(text);
          setInput('');
          return;
        }
      }
    } catch {
      /* 搜索失败不影响聊天 */
    }
    setSearchResults(null);

    // 3. 都没命中 → 走正常聊天
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError(null);
    setStreaming(true);

    const history = messages
      .filter((m) => m.role !== 'system' && m !== WELCOME_MESSAGE)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;
    let fullReply = '';

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            try {
              const p = JSON.parse(line.slice(6));
              if (p.content) {
                fullReply += p.content;
                setMessages((prev) => {
                  const u = [...prev];
                  u[u.length - 1] = { ...u[u.length - 1], content: fullReply };
                  return u;
                });
              }
              if (p.error) setError(p.error);
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || '连接失败');
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Markdown 渲染 ──
  const renderContent = (content: string) => {
    if (!content) return <span className="animate-pulse">▊</span>;
    return content.split('\n\n').map((para, i) => {
      if (!para.trim()) return null;
      const withBold = para.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
      const withCode = withBold.replace(/`([^`]+)`/g, '<code class="bg-black/5 rounded px-1 text-sm font-mono">$1</code>');
      return <p key={i} className="mb-2 leading-relaxed last:mb-0" dangerouslySetInnerHTML={{ __html: withCode }} />;
    });
  };

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-4 z-[60] flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* 头部 */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: 'linear-gradient(to right, #e891b0, #e8a87c)' }}
          >
            <div className="flex items-center gap-2">
              <img src="/ai-companion-icon.png" alt="AI Companion" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold">SilentXx-期权助手</div>
                <div className="text-xs opacity-80">期权学习与生活伴侣</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 消息区 */}
          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            style={{ background: 'linear-gradient(180deg, #fdfbfb 10%, #ebedee 100%)' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-white' : 'border border-gray-200 bg-white text-gray-700 shadow-sm'
                  }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(to right, #e891b0, #e8a87c)' } : {}}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                ⚠️ {error}{' '}
                <button onClick={() => setError(null)} className="underline">
                  关闭
                </button>
              </div>
            )}

            {/* 搜索结果卡片 */}
            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500">
                    🔍 “{searchQuery}” 的搜索结果（{searchResults.length}）
                  </div>
                  <button onClick={() => setSearchResults(null)} className="text-xs text-gray-400 hover:text-gray-600">
                    ✕ 清除
                  </button>
                </div>
                {searchResults.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target={r.source === 'wiki' ? '_blank' : undefined}
                    rel={r.source === 'wiki' ? 'noopener noreferrer' : undefined}
                    className="block rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-pink-300 hover:shadow"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                          r.source === 'article' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
                        }`}
                      >
                        {r.source === 'article' ? '文章' : '知识库'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{r.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">{r.summary}</div>
                        {r.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {r.tags.slice(0, 4).map((tag, ti) => (
                              <span key={ti} className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] text-pink-500">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-gray-100 bg-white px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索文章或聊天，如：covered call / 今天好累…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors outline-none focus:border-pink-300 focus:bg-white"
                disabled={streaming}
                style={{ maxHeight: '120px' }}
              />
              {streaming ? (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-xl bg-red-100 px-3 py-2.5 text-red-500 hover:bg-red-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="rounded-xl px-3 py-2.5 text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(to right, #e891b0, #e8a87c)' }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1.5 text-center text-[10px] text-gray-400">由 SilentXx 期权知识库驱动 · 内容仅供参考</p>
          </div>
        </div>
      )}
    </>
  );
}
