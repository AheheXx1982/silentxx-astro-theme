import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.PUBLIC_COMPANION_API || '';

interface Msg {
  role: 'user' | 'ai';
  content: string;
}

interface Props {
  context: string;
}

const SUGGESTIONS = ['当前账户状态怎么样？', '今天有什么交易信号？', 'TRON 该不该减仓？', 'NOK 的 11P 怎么处理？'];

const THINKING_STEPS = ['读取持仓数据…', '分析风险指标…', '生成建议…'];

export default function ChatCockpit({ context }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [thinkStep, setThinkStep] = useState(0);
  const [ttsOn, setTtsOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSupported, setRecSupported] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recogRef = useRef<any>(null);
  const recTextRef = useRef('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 思考步骤轮换
  useEffect(() => {
    if (!thinking) return;
    setThinkStep(0);
    const t = setInterval(() => setThinkStep((s) => (s + 1) % THINKING_STEPS.length), 1100);
    return () => clearInterval(t);
  }, [thinking]);

  // 能力检测 + 预热语音
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecSupported(!!SR && !!navigator.mediaDevices?.getUserMedia);
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }, []);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [msgs, thinking, scrollToBottom]);

  const stopAudio = useCallback(() => {
    try {
      audioRef.current?.pause();
    } catch {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // ── 浏览器 TTS 兜底 ──
  const speakBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 800));
    const voices = window.speechSynthesis.getVoices();
    const zh =
      voices.find((v) => /xiaoxiao|yunyang|huihui|kangkang/i.test(v.name)) ||
      voices.find((v) => (v.lang || '').toLowerCase().startsWith('zh'));
    if (zh) u.voice = zh;
    u.rate = 1.0;
    u.pitch = 1.0;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  // ── 语音朗读：优先 Sherpa 自然音，失败降级浏览器 ──
  const speak = useCallback(
    async (text: string) => {
      stopAudio();
      const clean = text.replace(/[*#`>\[\]]/g, '').trim();
      if (!clean) {
        setSpeaking(false);
        return;
      }
      setSpeaking(true);
      try {
        const resp = await fetch(`${API_BASE}/api/tts-sherpa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: clean.slice(0, 600) }),
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            setSpeaking(false);
            URL.revokeObjectURL(url);
          };
          audio.onerror = () => {
            setSpeaking(false);
            URL.revokeObjectURL(url);
            speakBrowser(clean);
          };
          await audio.play();
          return;
        }
      } catch {
        /* 走兜底 */
      }
      speakBrowser(clean);
    },
    [stopAudio, speakBrowser],
  );

  // ── 发送消息 ──
  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    stopAudio();
    const userMsg: Msg = { role: 'user', content: text };
    const aiMsg: Msg = { role: 'ai', content: '' };
    const next = [...msgs, userMsg, aiMsg];
    const aiIdx = next.length - 1;
    setMsgs(next);
    setInput('');
    setBusy(true);
    setThinking(true);
    let full = '';
    try {
      const history = [{ role: 'user', content: '【当前账户状态】\n' + context }];
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, persona: 'silentxx' }),
      });
      if (!resp.ok) throw new Error('API error');
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No response');
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            try {
              const p = JSON.parse(line.slice(6));
              if (p.content) {
                if (thinking) setThinking(false);
                full += p.content;
                setMsgs((m) => m.map((x, i) => (i === aiIdx ? { role: 'ai', content: full } : x)));
              }
            } catch {
              /* 忽略不完整行 */
            }
          }
        }
      }
      setThinking(false);
      if (ttsOn && full.trim()) speak(full);
    } catch {
      setThinking(false);
      setMsgs((m) => m.map((x, i) => (i === aiIdx ? { role: 'ai', content: '⚠️ 连接 AI 服务失败，请稍后重试。' } : x)));
    } finally {
      setBusy(false);
    }
  };

  // ── 语音输入：按住说话 → 录音 + 转写 → 松开发送 ──
  const startRec = useCallback(async () => {
    if (recording || busy) return;
    setRecording(true);
    recTextRef.current = '';
    setInput('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecRef.current = mr;
      mr.start();
      mr.onstop = () => stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* 无麦克风权限也继续（转写可能仍可用） */
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = 'zh-CN';
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (e: any) => {
        let finalText = '',
          interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        recTextRef.current = (finalText + interim).trim();
        setInput(recTextRef.current);
      };
      rec.onerror = () => {
        /* 识别失败保留输入 */
      };
      recogRef.current = rec;
      try {
        rec.start();
      } catch {
        recogRef.current = null;
      }
    }
  }, [recording, busy]);

  const stopRec = useCallback(() => {
    if (!recording) return;
    setRecording(false);
    try {
      mediaRecRef.current?.stop();
    } catch {}
    mediaRecRef.current = null;
    const rec = recogRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {}
      recogRef.current = null;
    }
    const transcript = recTextRef.current;
    if (transcript.trim()) {
      send(transcript);
      setInput('');
    }
    // 无识别结果：保留输入内容让用户确认/补字
  }, [recording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    return content.split('\n\n').map((para, i) => {
      if (!para.trim()) return null;
      const withBold = para.replace(/\*\*(.+?)\*\*/g, '<strong class="cc-strong">$1</strong>');
      const withCode = withBold.replace(/`([^`]+)`/g, '<code class="cc-code">$1</code>');
      const withBr = withCode.replace(/\n/g, '<br/>');
      return <p key={i} className="cc-para" dangerouslySetInnerHTML={{ __html: withBr }} />;
    });
  };

  const ttsLabel = speaking ? '⏹' : ttsOn ? '🔊' : '🔇';

  return (
    <div className="cc-cockpit">
      {/* 头部 */}
      <div className="cc-head">
        <div className="cc-core">
          <span className="cc-core-dot" />
          <span className="cc-core-ring" />
          <span className="cc-core-ring cc-core-ring-2" />
        </div>
        <div className="cc-head-info">
          <div className="cc-title">JARVIS · 指挥官 AI</div>
          <div className="cc-sub">SilentXx 期权情报官 · 已接入账户状态</div>
        </div>
        <div className="cc-head-right">
          <button
            className={`cc-tts-btn ${speaking ? 'cc-tts-speaking' : ''}`}
            onClick={() => {
              if (speaking) {
                stopAudio();
                return;
              }
              setTtsOn((v) => {
                const nv = !v;
                if (!nv) stopAudio();
                return nv;
              });
            }}
            title={speaking ? '停止朗读' : ttsOn ? '关闭语音朗读' : '开启语音朗读'}
          >
            {ttsLabel}
            {speaking && (
              <span className="cc-wave">
                <i />
                <i />
                <i />
              </span>
            )}
          </button>
          <span className="cc-online">
            <span className="cc-online-dot" />
            AI 在线
          </span>
        </div>
      </div>

      {/* 账户状态注入卡 */}
      <div className="cc-context">
        <div className="cc-context-title">
          <span className="cc-live-dot" /> 账户状态已注入（AI 可见）
        </div>
        <div className="cc-context-body">{context}</div>
      </div>

      {/* 消息流 */}
      <div className="cc-msgs">
        {msgs.map((m, i) => (
          <div key={i} className={`cc-msg ${m.role === 'user' ? 'cc-msg-user' : 'cc-msg-ai'}`}>
            {m.role === 'ai' && (
              <div className={`cc-avatar ${speaking && i === msgs.length - 1 ? 'cc-avatar-speaking' : ''}`}>
                ✦{speaking && i === msgs.length - 1 && <span className="cc-avatar-ring" />}
              </div>
            )}
            <div className={`cc-bubble ${m.role === 'user' ? 'cc-bubble-user' : 'cc-bubble-ai'}`}>
              {m.role === 'ai' && i === msgs.length - 1 && thinking ? (
                <div className="cc-thinking">
                  <span className="cc-think-ring" />
                  <span className="cc-think-text">{THINKING_STEPS[thinkStep]}</span>
                </div>
              ) : (
                renderContent(m.content)
              )}
              {m.role === 'ai' && i === msgs.length - 1 && busy && !thinking && <span className="cc-cursor cc-cursor-live" />}
            </div>
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="cc-empty">
            <div className="cc-empty-icon">✦</div>
            <div className="cc-empty-text">
              我是你的贾维斯，已读取账户状态。
              <br />
              打字或按住 🎤 说话，问我关于持仓、策略、市场的问题。
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 快捷提问 */}
      {msgs.length === 0 && (
        <div className="cc-suggest">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="cc-chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 输入栏 */}
      <div className={`cc-inputbar ${recording ? 'cc-inputbar-rec' : ''}`}>
        <button
          className={`cc-mic ${recording ? 'cc-mic-rec' : ''} ${!recSupported ? 'cc-mic-disabled' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            startRec();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stopRec();
          }}
          onMouseLeave={() => {
            if (recording) stopRec();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            startRec();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopRec();
          }}
          title={recSupported ? '按住说话' : '当前浏览器不支持语音输入（推荐 Chrome）'}
        >
          {recording ? (
            <span className="cc-rec-dot" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="cc-mic-icon">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <textarea
          ref={inputRef}
          className="cc-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={recording ? '🎙️ 正在聆听… 松开发送' : '问你的贾维斯…（Enter 发送 · 按住 🎤 说话）'}
          rows={1}
          disabled={recording}
        />
        {recording && (
          <span className="cc-rec-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
        <button className="cc-send" onClick={() => send()} disabled={busy || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
