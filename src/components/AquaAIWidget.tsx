import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import {
  AppPageId,
  PAGE_CONTEXT_MAP,
  findMarineFallbackResponse,
} from '../data/aquaContextData';
import { AquaChatMarkdown } from './AquaChatMarkdown';

interface GroundingSource {
  title: string;
  uri: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'aqua';
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
  isFallback?: boolean;
}

interface AquaAIWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeTab: AppPageId;
}

const WELCOME_MESSAGE: MessageItem = {
  id: 'welcome',
  sender: 'aqua',
  text: 'Halo! Saya **AQUA**, asisten riset kelautan Ocean Rescue. Ajukan pertanyaan apa saja seputar biologi laut, terumbu karang, oseanografi, polusi plastik, atau data di halaman yang sedang Anda buka.',
  timestamp: 'Siap membantu',
};

export const AquaAIWidget: React.FC<AquaAIWidgetProps> = ({
  isOpen,
  onOpen,
  onClose,
  activeTab,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; retryText: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pageContext = PAGE_CONTEXT_MAP[activeTab] ?? PAGE_CONTEXT_MAP.home;

  // Scroll to bottom on new messages or opening
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen, isExpanded]);

  // Focus input when opened & close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sendMessage = async (textToSend?: string, skipUserAppend = false) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    soundEffects.playBubblePop();
    setErrorState(null);

    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const historySnapshot = messages.filter((m) => m.id !== 'welcome');

    if (!skipUserAppend) {
      const userMsg: MessageItem = {
        id: `${Date.now()}-u`,
        sender: 'user',
        text,
        timestamp,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/aqua-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historySnapshot,
          activeContext: {
            tab: pageContext.id,
            title: pageContext.title,
            description: pageContext.description,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && typeof data.reply === 'string') {
        const replyTimestamp = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            sender: 'aqua',
            text: data.reply,
            timestamp: replyTimestamp,
            sources: Array.isArray(data.sources) ? data.sources : [],
          },
        ]);
      } else if (data?.error === 'NO_API_KEY') {
        const fallbackTimestamp = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            sender: 'aqua',
            text: findMarineFallbackResponse(text),
            timestamp: fallbackTimestamp,
            isFallback: true,
          },
        ]);
      } else {
        setErrorState({
          message:
            typeof data?.message === 'string' && data.message
              ? data.message
              : 'Gagal memperoleh jawaban dari Aqua AI. Silakan coba lagi.',
          retryText: text,
        });
      }
    } catch {
      setErrorState({
        message: 'Koneksi ke server Aqua AI terputus. Periksa jaringan Anda lalu coba lagi.',
        retryText: text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: 'welcome',
        timestamp: 'Baru saja',
      },
    ]);
    setErrorState(null);
    soundEffects.playBubblePop();
  };

  const hasUserMessages = messages.some((m) => m.sender === 'user');

  // Sleek Liquid Glass Floating Launcher Button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-16 right-5 z-50">
        <button
          type="button"
          onClick={() => {
            soundEffects.playBubblePop();
            onOpen();
          }}
          aria-label="Buka Aqua AI Riset Kelautan"
          className="liquid-glass-pill group relative inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#367D7B] to-[#1D6664] text-[#EDEBE3] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.42),0_4px_12px_rgba(29,102,100,0.35)] shrink-0">
            <Bot className="w-4 h-4" />
          </span>
          <span className="text-xs sm:text-[13px] font-medium tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0">
            Tanya Aqua
          </span>
        </button>
      </div>
    );
  }

  // Sleek Liquid Glass Pop-up Chat Card (Compact or Expanded)
  return (
    <aside
      aria-label="Aqua AI Riset Kelautan"
      role="dialog"
      aria-modal="false"
      className={`fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-3xl liquid-glass ring-1 ring-inset ring-white/30 dark:ring-white/10 transition-[transform,opacity] duration-200 animate-in fade-in slide-in-from-bottom-4 ${
        isExpanded
          ? 'w-[calc(100vw-2rem)] sm:w-[min(680px,calc(100vw-2rem))] h-[min(86dvh,740px)]'
          : 'w-[calc(100vw-2rem)] sm:w-[400px] h-[min(78dvh,560px)]'
      }`}
    >
      {/* Sleek Frosted Glass Header */}
      <header className="px-4 py-3.5 border-b border-[var(--border-hairline)] bg-white/30 dark:bg-white/[0.03] backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#367D7B] to-[#1D6664] text-[#EDEBE3] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-medium text-base text-[var(--text-primary)] leading-none">
                Aqua AI
              </h2>
              <Sparkles className="w-3 h-3 text-[var(--accent-teal)] shrink-0" aria-hidden="true" />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1">
              Konteks: {pageContext.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Perkecil jendela chat' : 'Perbesar jendela chat'}
            aria-label={isExpanded ? 'Perkecil jendela chat' : 'Perbesar jendela chat'}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            title="Reset percakapan"
            aria-label="Reset percakapan"
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-coral)] hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playBubblePop();
              onClose();
            }}
            title="Tutup Aqua AI"
            aria-label="Tutup Aqua AI"
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'aqua' && (
              <div className="w-6 h-6 rounded-full bg-[#367D7B]/18 border border-[#367D7B]/25 flex items-center justify-center text-[var(--accent-teal)] shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[86%] space-y-1.5`}>
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-[#367D7B] to-[#267472] text-[#EDEBE3] rounded-tr-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_6px_16px_-6px_rgba(29,102,100,0.45)]'
                    : 'bg-white/62 dark:bg-[#0D2531]/68 backdrop-blur-md border border-[var(--border-hairline)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-[var(--text-primary)] rounded-tl-sm'
                }`}
              >
                {msg.sender === 'aqua' ? (
                  <AquaChatMarkdown text={msg.text} />
                ) : (
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                )}

                {/* Grounding Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-hairline)] space-y-1.5">
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">
                      Sumber Riset Terkini
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <a
                          key={`${src.uri}-${idx}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/55 dark:bg-white/[0.06] border border-[var(--border-hairline)] text-[11px] text-[var(--accent-teal)] hover:underline max-w-[220px]"
                          title={src.title}
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-75" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-1 text-[10px] tabular-nums text-[var(--text-muted)]">
                {msg.timestamp}
                {msg.isFallback && ' · Rujukan Sains Lokal'}
              </div>
            </div>
          </div>
        ))}

        {/* Contextual Suggested Prompts Before First Message */}
        {!hasUserMessages && (
          <div className="pl-8 space-y-2 pt-1">
            <div className="text-[11px] font-medium text-[var(--text-muted)]">
              Saran topik untuk {pageContext.title}
            </div>
            <div className="flex flex-col gap-1.5">
              {pageContext.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs text-[var(--text-primary)] px-3 py-2 rounded-xl bg-white/45 dark:bg-white/[0.05] hover:bg-white/75 dark:hover:bg-white/[0.11] border border-[var(--border-hairline)] transition-colors cursor-pointer leading-snug"
                >
                  &rarr; {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clean Loading State */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-6 h-6 rounded-full bg-[#367D7B]/18 border border-[#367D7B]/25 flex items-center justify-center text-[var(--accent-teal)] shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm bg-white/50 dark:bg-[#0D2531]/60 border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
              AQUA sedang menelusuri riset kelautan...
            </div>
          </div>
        )}

        {/* Inline Error Recovery Banner */}
        {errorState && (
          <div
            role="alert"
            className="flex items-start justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[var(--accent-coral)]/12 border border-[var(--accent-coral)]/30 text-xs text-[var(--text-primary)]"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--accent-coral)] shrink-0 mt-0.5" />
              <span>{errorState.message}</span>
            </div>
            <button
              type="button"
              onClick={() => sendMessage(errorState.retryText, true)}
              className="text-[11px] font-semibold text-[var(--accent-teal)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sleek Liquid Glass Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="px-3.5 py-3 border-t border-[var(--border-hairline)] bg-white/25 dark:bg-black/15 backdrop-blur-md flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Tanyakan apa saja tentang kelautan..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="liquid-glass-pill flex-1 px-4 py-2.5 rounded-full text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)]/50"
        />

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Kirim Pesan ke Aqua AI"
          className="p-2.5 rounded-full bg-gradient-to-br from-[#367D7B] to-[#267472] text-[#EDEBE3] hover:brightness-110 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
