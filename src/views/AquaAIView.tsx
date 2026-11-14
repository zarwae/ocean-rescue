import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, RotateCcw } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface MessageItem {
  id: string;
  sender: 'user' | 'aqua';
  text: string;
  timestamp: string;
  isDemoFallback?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Mengapa lautan sangat krusial bagi kelangsungan hidup bumi?',
  'Bagaimana sampah plastik dan mikroplastik meracuni satwa laut?',
  'Apa proses ilmiah yang memicu pemutihan karang (coral bleaching)?',
  'Bagaimana pelajar SMA bisa mengambil tindakan nyata melindungi laut?',
];

const LOCAL_EXPERT_KNOWLEDGE: Record<string, string> = {
  'mengapa lautan sangat krusial bagi kelangsungan hidup bumi?': `**Peran Vital Samudra Bagi Biosfer Planet Bumi:**

1. **Pabrik Oksigen Terbesar**: Lebih dari 50% hingga 80% oksigen di atmosfer bumi dihasilkan oleh fitoplankton mikroskopis dan alga fotosintetik di lapisan laut teratas (UNESCO-IOC).
2. **Termostat Pengatur Iklim**: Samudra telah menyerap lebih dari 90% akumulasi panas ekstra akibat emisi gas rumah kaca sejak revolusi industri, mencegah atmosfer daratan terpanggang suhu ekstrem (IPCC).
3. **Penyerap Karbon Alami**: Samudra menyerap sekitar 30% emisi karbon dioksida antropogenik, menyimpannya dalam sedimen dan sirkulasi laut dalam.
4. **Ketahanan Pangan Global**: Lebih dari 3,3 miliar manusia bergantung langsung pada boga bahari sebagai sumber utama protein hewani esensial.`,

  'bagaimana sampah plastik dan mikroplastik meracuni satwa laut?': `**Mekanisme Polusi Plastik & Dampak Patologis Pada Fauna Laut:**

1. **Jebakan Mekanis (Entanglement)**: Jaring hantu dan tali nilon mengikat penyu, anjing laut, dan lumba-lumba, menyebabkan luka infeksi parah hingga tenggelam.
2. **Obstruksi Saluran Pencernaan**: Penyu laut sering salah mengira kantong plastik mengapung sebagai ubur-ubur sehingga menyumbat pencernaan dan memicu kelaparan semu.
3. **Vektor Toksisitas Kimia**: Mikroplastik (<5mm) mengadsorpsi polutan organik persisten dan berpindah naik melalui rantai makanan dari zooplankton hingga predator puncak.`,

  'apa proses ilmiah yang memicu pemutihan karang (coral bleaching)?': `**Proses Ilmiah Pemutihan Karang (Coral Bleaching):**

1. **Simbiosis Asli**: Polip karang hidup bersama alga bersel satu *Zooxanthellae* yang menyumbang hingga 90% energi harian karang lewat fotosintesis.
2. **Stres Termal**: Kenaikan suhu permukaan laut 1–2°C di atas batas ambang merusak sistem fotosintesis alga sehingga muncul senyawa oksigen reaktif beracun.
3. **Pelepasan Alga**: Karang terpaksa mengeluarkan alga tersebut sehingga jaringannya tampak transparan dan menampakkan kerangka kalsium karbonat putih.`,

  'bagaimana pelajar sma bisa mengambil tindakan nyata melindungi laut?': `**Aksi Nyata Konservasi Laut yang Bisa Dilakukan Pelajar:**

1. **Bawa Tumbler & Kotak Makan Sendiri**: Potong konsumsi plastik sekali pakai sejak dari sumbernya.
2. **Pilah Sampah di Rumah & Sekolah**: Salurkan plastik bersih ke bank sampah agar tidak terbawa aliran sungai ke laut.
3. **Konsumsi Boga Bahari Berkelanjutan**: Hindari spesies dilindungi dan pilih ikan tangkapan ramah lingkungan.
4. **Ikut Beach atau River Cleanup**: Bersihkan saluran air terdekat bersama komunitas lokal.`,
};

export const AquaAIView: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'aqua',
      text: 'Halo! Saya **AQUA**, asisten riset biologi laut dan konservasi samudra (SDG 14). Silakan ajukan pertanyaan mengenai ekosistem laut, pemutihan karang, atau solusi polusi plastik.',
      timestamp: 'Baru saja',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasApiKey(Boolean(data.hasGeminiKey)))
      .catch(() => setHasApiKey(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    soundEffects.playBubblePop();

    const userMsg: MessageItem = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/aqua-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            sender: 'aqua',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const normalized = text.toLowerCase().trim();
        const fallbackAnswer =
          LOCAL_EXPERT_KNOWLEDGE[normalized] ||
          Object.entries(LOCAL_EXPERT_KNOWLEDGE).find(([q]) => normalized.includes(q.slice(0, 15)))?.[1] ||
          `Terima kasih atas pertanyaan Anda tentang "${text}".\n\nDalam kerangka SDG 14 (Life Below Water), menjaga kesehatan ekosistem laut memerlukan sinergi antara pemahaman sains, pengendalian emisi karbon, pengurangan limbah plastik di hulu, dan perlindungan habitat kritis.`;

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            sender: 'aqua',
            text: fallbackAnswer,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            isDemoFallback: true,
          },
        ]);
      }
    } catch {
      const normalized = text.toLowerCase().trim();
      const fallbackAnswer =
        LOCAL_EXPERT_KNOWLEDGE[normalized] ||
        `Lautan memiliki peran fundamental dalam mengatur iklim dan menyokong kehidupan bumi. Pertanyaan Anda "${text}" berhubungan erat dengan upaya pelestarian SDG 14.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          sender: 'aqua',
          text: fallbackAnswer,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isDemoFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'aqua',
        text: 'Percakapan telah dibersihkan. Silakan ajukan topik sains kelautan yang ingin Anda diskusikan.',
        timestamp: 'Baru saja',
      },
    ]);
    soundEffects.playBubblePop();
  };

  const hasUserMessages = messages.some((m) => m.sender === 'user');

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Clean Unboxed Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
          <div className="space-y-2">
            <div className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-teal)] uppercase">
              Asisten Riset Kelautan · SDG 14
            </div>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
              Aqua AI Assistant
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {hasApiKey
                ? 'Terhubung dengan server riset Gemini Flash'
                : 'Didukung basis pengetahuan sains NOAA & UNEP terverifikasi'}
            </p>
          </div>

          <button
            onClick={handleClearChat}
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-coral)] inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-end"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Percakapan</span>
          </button>
        </header>

        {/* Open Conversation Thread */}
        <div className="space-y-6 min-h-[380px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'aqua' && (
                <div className="w-7 h-7 rounded-full bg-[var(--accent-teal-bg)] flex items-center justify-center text-[var(--accent-teal)] shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1`}>
                <div
                  className={`px-4 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#367D7B] text-[#EDEBE3] rounded-tr-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>

                <div className="px-1 text-[11px] text-[var(--text-muted)]">
                  {msg.timestamp}
                  {msg.isDemoFallback && ' · Rujukan Sains Lokal'}
                </div>
              </div>
            </div>
          ))}

          {/* Quiet Suggested Starters Shown Only Before First User Message */}
          {!hasUserMessages && (
            <div className="pl-10 space-y-2 pt-2">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Contoh Pertanyaan
              </div>
              <div className="flex flex-col items-start gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-xs sm:text-sm text-[var(--accent-teal)] hover:underline cursor-pointer"
                  >
                    &rarr; {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-teal-bg)] flex items-center justify-center text-[var(--accent-teal)] shrink-0 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                AQUA sedang menyusun jawaban...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Clean Pill Input Bar */}
        <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Ajukan pertanyaan mengenai biologi laut, karang, atau konservasi..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="liquid-glass-pill flex-1 px-5 py-3 rounded-full text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-full bg-[#367D7B] text-[#EDEBE3] hover:bg-[#267472] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            aria-label="Kirim Pesan"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
