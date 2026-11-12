import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Setup Gemini client
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health and config status endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey),
      app: 'OCEAN RESCUE',
      sdg: '14 — Life Below Water',
    });
  });

  // Server-side Aqua AI chat route
  app.post('/api/aqua-chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Pesan pertanyaan kelautan tidak boleh kosong.' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'NO_API_KEY',
          message: 'API Key Gemini belum disetel pada environment server. Mode edukasi interaktif lokal tetap siap melayani pertanyaan umum Anda.',
        });
      }

      const systemInstruction = `Anda adalah AQUA, AI Research Assistant kelautan resmi platform OCEAN RESCUE untuk Tujuan Pembangunan Berkelanjutan (SDG) 14: Life Below Water.
Pedoman Anda:
1. Menjawab pertanyaan pengguna secara ilmiah, edukatif, dan inspiratif menggunakan Bahasa Indonesia yang mudah dipahami oleh pelajar SMA hingga akademisi.
2. Jelaskan topik seperti biologi laut, terumbu karang (coral reefs), pemutihan karang (coral bleaching), pengasaman laut (ocean acidification), penangkapan ikan berlebih (overfishing), polusi mikroplastik, serta ekosistem mangrove dan lamun dengan fakta akurat (merujuk NOAA, UNESCO-IOC, UNEP, IPCC, IUCN).
3. Jika pengguna mendiskusikan simulasi ekosistem laut atau kalkulator plastik, berikan analisis ilmiah mengenai sebab-akibat dan solusi reduksi jejak lingkungan praktis.
4. Jaga nada bicara profesional, elegan, berwawasan luas, dan penuh kepedulian lingkungan.
5. Gunakan format markdown bersih dengan heading ringkas, poin terstruktur, dan penekanan teks bila relevan.`;

      // Build conversation history
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.text) }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Execute generateContent with a 7-second timeout protection
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const replyText = (response as any).text || 'Maaf, saya tidak dapat menghasilkan respon saat ini. Silakan ulangi pertanyaan Anda.';
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.warn('Aqua AI API error or timeout:', err?.message || err);
      return res.status(503).json({
        error: 'GENERATE_UNAVAILABLE',
        message: 'Layanan API sedang sibuk atau offline. Sistem beralih ke basis pengetahuan sains terverifikasi.',
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OCEAN RESCUE server running at http://localhost:${PORT}`);
  });
}

startServer();
