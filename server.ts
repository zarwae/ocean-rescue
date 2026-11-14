import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCliArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  const prefix = `${flag}=`;
  const eqArg = process.argv.find((arg) => arg.startsWith(prefix));
  return eqArg ? eqArg.slice(prefix.length) : undefined;
}

function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithRetry(
  fn: () => Promise<GenerateContentResponse>,
  retries = 1
): Promise<GenerateContentResponse> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err?.status || err?.code;
    const isClientError = status === 400 || status === 401 || status === 403 || status === 404;
    if (retries > 0 && !isClientError) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      return generateWithRetry(fn, retries - 1);
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  const portArg = getCliArg('--port');
  const hostArg = getCliArg('--host');
  const PORT = portArg ? parseInt(portArg, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
  const HOST = hostArg || process.env.HOST || '0.0.0.0';

  app.use(express.json());

  // Health and config status endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(getGeminiApiKey()),
      app: 'OCEAN RESCUE',
      sdg: '14 — Life Below Water',
    });
  });

  // Server-side Aqua AI chat route powered by gemini-4-hydrogen + Google Search grounding
  app.post('/api/aqua-chat', async (req, res) => {
    try {
      const { message, history, activeContext } = req.body ?? {};
      const cleanMessage = typeof message === 'string' ? message.trim() : '';

      if (!cleanMessage) {
        return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Pertanyaan kelautan tidak boleh kosong.' });
      }

      const ai = createGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'NO_API_KEY',
          message: 'API Key Gemini belum disetel pada environment server.',
        });
      }

      const contextTitle = typeof activeContext?.title === 'string' ? activeContext.title.trim() : '';
      const contextDesc = typeof activeContext?.description === 'string' ? activeContext.description.trim() : '';
      const contextBlock = contextTitle
        ? `\n\nKONTEKS HALAMAN PENGGUNA SAAT INI:\nPengguna sedang membuka halaman "${contextTitle}" (${contextDesc}). Jika pertanyaan merujuk pada halaman, grafik, data, atau fitur yang sedang dilihat, hubungkan penjelasan ilmiah Anda secara langsung dan relevan.`
        : '';

      const systemInstruction = `Anda adalah AQUA, asisten riset ilmiah kelautan dan konservasi samudra resmi platform OCEAN RESCUE (SDG 14: Life Below Water).

CAKUPAN KEAHLIAN ANDA:
Anda mampu menjawab SEMUA pertanyaan tentang kelautan secara menyeluruh, akurat, dan mutakhir, meliputi:
- Biologi laut & taksonomi spesies (mamalia laut, hiu/pari, reptil laut, ikan pelagis/karang, invertebrata, plankton, biota laut dalam/abisal).
- Ekosistem pesisir & samudra (terumbu karang, coral bleaching, padang lamun, hutan mangrove, estuari, zona pelagik hingga palung hadal).
- Oseanografi & iklim (suhu permukaan laut, sirkulasi termohalin, arus laut, El Niño/La Niña, kenaikan muka air laut, pengasaman laut/ocean acidification, blue carbon).
- Krisis & solusi konservasi (sampah plastik, mikroplastik, ocean gyres, ghost nets, overfishing, IUU fishing, Kawasan Konservasi Laut/MPA, High Seas Treaty/BBNJ, teknologi pembersihan laut, akuakultur berkelanjutan).
- Keanekaragaman laut Indonesia & Segitiga Terumbu Karang (Coral Triangle) serta aksi nyata pelajar dan masyarakat.

PEDOMAN JAWABAN:
1. Gunakan Bahasa Indonesia yang jernih, ilmiah namun mudah dipahami (atau sesuaikan bahasa jika pengguna bertanya dalam Bahasa Inggris).
2. Gunakan alat pencarian Google Search bila pertanyaan menyangkut data terbaru, peristiwa terkini, spesies/lokasi spesifik, atau riset mutakhir, dan rujuk lembaga kredibel (NOAA, UNESCO-IOC, UNEP, IPCC, IUCN, FAO, NASA, BRIN/KKP).
3. Susun jawaban menggunakan Markdown yang rapi dan ringkas: gunakan heading singkat (###), poin terstruktur, serta penebalan (**istilah penting**) agar nyaman dibaca di jendela chat pop-up maupun mode diperbesar.
4. Jika pertanyaan benar-benar di luar topik kelautan/lingkungan, jawab singkat dengan sopan dan arahkan kembali ke topik kelautan atau SDG 14.${contextBlock}`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
          if (item && typeof item.text === 'string' && item.text.trim()) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text.trim() }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: cleanMessage }],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 30000)
      );

      const callModel = async (useSearchGrounding: boolean): Promise<GenerateContentResponse> => {
        return generateWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents,
            config: {
              systemInstruction,
              ...(useSearchGrounding ? { tools: [{ googleSearch: {} }] } : {}),
            },
          })
        );
      };

      const generateWithGroundingFallback = async (): Promise<GenerateContentResponse> => {
        try {
          return await callModel(true);
        } catch (groundingErr: any) {
          const gStatus = groundingErr?.status || groundingErr?.code;
          const gMsg = String(groundingErr?.message || '');
          const isAuthFatal =
            gStatus === 401 ||
            gMsg.includes('API_KEY_INVALID') ||
            gMsg.includes('PERMISSION_DENIED');
          if (isAuthFatal) throw groundingErr;

          console.warn(
            'Search grounding unavailable, falling back to direct gemini-4-hydrogen:',
            gStatus || gMsg
          );
          return await callModel(false);
        }
      };

      const response = await Promise.race([generateWithGroundingFallback(), timeoutPromise]);
      const replyText =
        response.text?.trim() ||
        'Maaf, saya belum berhasil menyusun jawaban untuk pertanyaan tersebut. Silakan coba ajukan ulang dengan detail lebih spesifik.';

      // Extract deduplicated web grounding sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const seenUrls = new Set<string>();
      const sources: Array<{ title: string; uri: string }> = [];

      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          const uri = chunk?.web?.uri;
          const title = chunk?.web?.title;
          if (typeof uri === 'string' && /^https?:\/\//i.test(uri) && !seenUrls.has(uri)) {
            seenUrls.add(uri);
            sources.push({
              uri,
              title: typeof title === 'string' && title.trim() ? title.trim() : new URL(uri).hostname,
            });
          }
        }
      }

      return res.json({
        reply: replyText,
        sources: sources.slice(0, 5),
      });
    } catch (err: any) {
      const message = String(err?.message || err || '');
      const status = err?.status || err?.code;
      console.warn('Aqua AI API error:', status || message);

      if (status === 400 || status === 401 || status === 403 || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        return res.status(401).json({
          error: 'INVALID_API_KEY',
          message: 'Kunci API Gemini tidak valid atau ditolak. Periksa pengaturan di panel Secrets.',
        });
      }

      if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error: 'RATE_LIMITED',
          message: 'Batas permintaan AI sementara tercapai. Silakan tunggu beberapa detik lalu coba lagi.',
        });
      }

      return res.status(502).json({
        error: 'GENERATE_UNAVAILABLE',
        message: 'Layanan AI sedang sibuk atau mengalami gangguan koneksi. Silakan coba kembali.',
      });
    }
  });

  // Integrate Vite or serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`OCEAN RESCUE server running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start OCEAN RESCUE server:', err);
  process.exit(1);
});
