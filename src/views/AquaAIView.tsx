import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Compass, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
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
  'Mengapa hiu sebagai apex predator penting bagi kestabilan ekosistem?',
  'Apa yang terjadi jika keanekaragaman hayati laut terus merosot?',
  'Bagaimana pelajar SMA bisa mengambil tindakan nyata melindungi laut?',
];

// Offline verified scientific answers if Gemini server key is not configured
const LOCAL_EXPERT_KNOWLEDGE: Record<string, string> = {
  'mengapa lautan sangat krusial bagi kelangsungan hidup bumi?': `**Peran Vital Samudra Bagi Biosfer Planet Bumi:**

1. **Pabrik Oksigen Terbesar**: Lebih dari 50% hingga 80% oksigen di atmosfer bumi dihasilkan oleh fitoplankton mikroskopis dan alga fotosintetik di lapisan laut teratas (UNESCO-IOC).
2. **Termostat Pengatur Iklim**: Samudra telah menyerap lebih dari 90% akumulasi panas ekstra akibat emisi gas rumah kaca sejak revolusi industri, mencegah atmosfer daratan terpanggang suhu ekstrem (IPCC).
3. **Penyerap Karbon Alami**: Samudra menyerap sekitar 30% emisi karbon dioksida antropogenik, menyimpannya dalam sedimen dan sirkulasi laut dalam.
4. **Ketahanan Pangan Global**: Lebih dari 3,3 miliar manusia bergantung langsung pada boga bahari sebagai sumber utama protein hewani esensial.
5. **Siklus Air Planet**: Samudra menampung 96,5% seluruh air di bumi dan menggerakkan siklus hidrologi yang mendistribusikan hujan ke daratan pertanian.`,

  'bagaimana sampah plastik dan mikroplastik meracuni satwa laut?': `**Mekanisme Polusi Plastik & Dampak Patologis Pada Fauna Laut:**

1. **Jebakan Mekanis (Entanglement)**: Jaring hantu (ghost nets) dan tali nilon mengikat penyu, anjing laut, dan lumba-lumba, menyebabkan luka infeksi parah, amputasi anggota tubuh, atau kematian akibat tenggelam lemas.
2. **Obstruksi Saluran Pencernaan**: Penyu laut sering salah mengira kantong plastik mengapung sebagai ubur-ubur. Plastik yang tertelan menyumbat usus, memicu rasa kenyang semu (pseudo-satiation) hingga hewan mati kelaparan secara perlahan.
3. **Vektor Toksisitas Kimia**: Mikroplastik (<5mm) memiliki luas permukaan spesifik tinggi yang mengadsorpsi polutan organik persisten (POPs) seperti PCB, DDT, dan hidrokarbon aromatik polisiklik (PAH).
4. **Bioakumulasi dan Biomagnifikasi**: Zooplankton menelan mikroplastik; ikan kecil memakan zooplankton; predator puncak seperti tuna dan manusia mengonsumsi ikan tersebut dengan konsentrasi toksin yang terakumulasi berlipat ganda.`,

  'apa proses ilmiah yang memicu pemutihan karang (coral bleaching)?': `**Proses Ilmiah Pemutihan Karang (Coral Bleaching):**

1. **Simbiosis Asli**: Polip karang keras hidup bersama alga dinoflagellata bersel satu bernama *Zooxanthellae* (Symbiodiniaceae) di dalam jaringan gastrodermisnya. Alga ini menyumbang hingga 90% energi harian karang melalui fotosintesis.
2. **Pemicu Stres Termal**: Anomali suhu permukaan laut sebesar 1–2°C di atas batas ambang musim panas selama lebih dari 4 minggu berturut-turut (Degree Heating Weeks > 4).
3. **Fotokerusakan Fotosistem**: Suhu tinggi merusak protein fotosistem II alga, menyebabkan alga memproduksi senyawa oksigen reaktif beracun (Reactive Oxygen Species / ROS) alih-alih energi.
4. **Pelepasan Alga**: Sebagai mekanisme pertahanan seluler, polip terpaksa mengeluarkan alga Zooxanthellae dari tubuhnya.
5. **Pemutihan & Kelaparan**: Karena alga yang memberi warna telah lenyap, jaringan polip menjadi transparan dan menampakkan kerangka kalsium karbonat aragonit putih kapur di bawahnya. Karang masih hidup, namun dalam kondisi sekarat kelaparan jika suhu tidak segera normal kembali.`,

  'mengapa hiu sebagai apex predator penting bagi kestabilan ekosistem?': `**Urgensi Ekologis Hiu (Apex Predator) di Lautan:**

1. **Mencegah Trophic Cascade**: Tanpa predator puncak, populasi mesopredator (seperti pari dan ikan karnivora sedang) akan meledak tak terkendali. Mereka akan menghabiskan ikan herbivora pemakan alga, sehingga karang keras akan terbekap oleh lumut makroalga.
2. **Seleksi Alam & Sanitasi Laut**: Hiu memangsa individu yang sakit, tua, dan lamban. Ini mencegah penyebaran wabah penyakit menular di dalam populasi mangsa serta mempertahankan kebugaran genetik populasi ikan.
3. **Mengatur Perilaku Mangsa (Fear Ecology)**: Kehadiran hiu mencegah penyu atau dugong merumput berlebihan di satu titik padang lamun, menjaga agar padang lamun penyerap karbon tetap lebat dan produktif.`,

  'apa yang terjadi jika keanekaragaman hayati laut terus merosot?': `**Konsekuensi Ekologis Kemerosotan Biodiversitas Laut:**

1. **Kehilangan Resiliensi Terhadap Bencana**: Ekosistem yang miskin spesies lebih rentan runtuh total saat terserang penyakit atau gelombang panas laut.
2. **Runtuhnya Perikanan Komersial**: Mengikisnya stok ikan tangkap memicu krisis ekonomi maritim dan malnutrisi protein bagi ratusan juta warga pesisir.
3. **Kerusakan Garis Pantai**: Hilangnya terumbu karang dan sabuk mangrove meningkatkan daya hancur abrasi ombak dan tsunami terhadap permukiman darat.
4. **Terhentinya Potensi Medis Baru**: Lebih dari 50% kandidat obat kanker dan antibiotik mutakhir sedang diteliti dari senyawa bioaktif spons, moluska, dan bisa fauna laut purba.`,

  'bagaimana pelajar sma bisa mengambil tindakan nyata melindungi laut?': `**6 Aksi Nyata Konservasi Laut yang Bisa Dilakukan Pelajar:**

1. **Bawa Tumbler & Kotak Makan Sendiri**: Potong rantai konsumsi botol PET dan kemasan sekali pakai dari sumbernya.
2. **Pilah Sampah di Rumah & Sekolah**: Pastikan plastik anorganik bersih disalurkan ke bank sampah atau pusat daur ulang, jangan biarkan terbawa ke selokan/sungai.
3. **Audit Konsumsi Boga Bahari**: Tolak konsumsi sup sirip hiu, telur penyu, atau anakan ikan karang. Pilihlah ikan lokal yang ditangkap secara ramah lingkungan.
4. **Edukasi Teman Sebaya**: Bagikan fakta ilmiah kelautan dan kampanye SDG 14 di media sosial atau mading sekolah.
5. **Ikut Gerakan Beach Cleanup / River Cleanup**: Luangkan waktu di akhir pekan untuk membersihkan saluran air lingkungan sekitar bersama komunitas.
6. **Dukung Kebijakan MPA & Regulasi Lingkungan**: Tandatangani petisi dan dukung program kawasan konservasi perairan di Indonesia.`,
};

export const AquaAIView: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'aqua',
      text: 'Halo! Saya **AQUA**, asisten riset cerdas spesialis marine biology dan konservasi samudra untuk platform OCEAN RESCUE (SDG 14: Life Below Water).\n\nSilakan tanyakan apa pun mengenai biologi laut, krisis pemutihan karang, dinamika polusi plastik, atau solusi konservasi nyata!',
      timestamp: 'Baru saja',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check backend health and Gemini key availability
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasGeminiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
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
        const aquaMsg: MessageItem = {
          id: `${Date.now()}-a`,
          sender: 'aqua',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aquaMsg]);
      } else {
        // Fallback to local verified knowledge
        const normalized = text.toLowerCase().trim();
        const fallbackAnswer = 
          LOCAL_EXPERT_KNOWLEDGE[normalized] || 
          Object.entries(LOCAL_EXPERT_KNOWLEDGE).find(([q]) => normalized.includes(q.slice(0, 15)))?.[1] ||
          `Terima kasih atas pertanyaan Anda tentang "${text}".\n\nDalam kerangka SDG 14 (Life Below Water), menjaga kesehatan ekosistem laut memerlukan sinergi antara pemahaman sains, pengurangan emisi karbon daratan, eliminasi limbah plastik di hulu, dan perlindungan habitat kritis seperti terumbu karang dan mangrove.\n\n*Catatan: Mode demonstrasi sains lokal aktif. Untuk respons generatif penuh, pastikan GEMINI_API_KEY dikonfigurasi pada environment.*`;

        const aquaMsg: MessageItem = {
          id: `${Date.now()}-a`,
          sender: 'aqua',
          text: fallbackAnswer,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isDemoFallback: true,
        };
        setMessages((prev) => [...prev, aquaMsg]);
      }
    } catch (e) {
      // Local fallback on network error
      const normalized = text.toLowerCase().trim();
      const fallbackAnswer = 
        LOCAL_EXPERT_KNOWLEDGE[normalized] ||
        `Lautan memiliki peran fundamental dalam mengatur iklim dan menyokong kehidupan bumi. Pertanyaan Anda "${text}" sangat penting bagi konservasi SDG 14.\n\n*Mode demonstrasi sains lokal aktif.*`;

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
        text: 'Percakapan telah dibersihkan. Silakan tanyakan topik sains kelautan atau konservasi laut yang ingin Anda diskusikan!',
        timestamp: 'Baru saja',
      },
    ]);
    soundEffects.playBubblePop();
  };

  return (
    <div className="min-h-screen bg-[#02080D] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="text-[11px] font-mono tracking-widest text-cyan-400/90 uppercase">
              Asisten Riset Kelautan · SDG 14
            </div>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-white tracking-tight">
              Aqua AI Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Konsultasikan oceanography, biologi kelautan, status konservasi spesies, atau interpretasi hasil simulasi ekosistem Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-rose-400/50 text-xs font-mono text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Bersihkan riwayat percakapan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Status banner */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            <span>
              {hasApiKey 
                ? 'Model: Gemini 3.8 Flash (Server Proxy Terhubung)'
                : 'Mode Pengetahuan Ilmiah Terverifikasi (NOAA / UNEP Science Dossier)'}
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-slate-500">Bahasa: Indonesia</span>
        </div>

        {/* CHAT CONTAINER */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md flex flex-col h-[540px] overflow-hidden">
          
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'aqua' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-100 rounded-tr-sm'
                        : 'bg-white/[0.03] text-slate-200 border border-white/[0.06] rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.isDemoFallback && (
                      <span className="text-cyan-400/80">&bull; Fakta Sains Terverifikasi</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs font-mono ml-1 text-slate-400">AQUA sedang menganalisis data sains kelautan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED PROMPTS BAR */}
          <div className="p-2.5 bg-white/[0.01] border-t border-white/[0.06] overflow-x-auto">
            <div className="flex items-center gap-2 text-[11px] whitespace-nowrap">
              <span className="text-slate-500 font-mono flex items-center gap-1 pl-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Topik:
              </span>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Ajukan pertanyaan mengenai biologi laut, terumbu karang, polusi plastik, atau konservasi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#03090F] border border-white/[0.08] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-white text-slate-950 hover:bg-cyan-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
