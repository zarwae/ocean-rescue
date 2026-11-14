export type AppPageId =
  | 'home'
  | 'crisis'
  | 'explorer'
  | 'tracker'
  | 'simulator'
  | 'game'
  | 'knowledge'
  | 'calculator'
  | 'missions'
  | 'dashboard'
  | 'quiz'
  | 'data'
  | 'news';

export interface PageContextInfo {
  id: AppPageId;
  title: string;
  description: string;
  suggestedPrompts: string[];
}

export const PAGE_CONTEXT_MAP: Record<AppPageId, PageContextInfo> = {
  home: {
    id: 'home',
    title: 'Beranda Ocean Rescue',
    description: 'Halaman utama pengenalan misi SDG 14 Life Below Water, zona kedalaman laut, dan pilar ekosistem samudra.',
    suggestedPrompts: [
      'Mengapa lautan sangat krusial bagi iklim dan oksigen bumi?',
      'Apa saja target utama SDG 14 Life Below Water?',
      'Bagaimana kondisi ekosistem terumbu karang Indonesia saat ini?',
    ],
  },
  crisis: {
    id: 'crisis',
    title: 'Krisis Ekosistem Laut',
    description: 'Penjelasan krisis laut: pemanasan laut, pengasaman air laut (ocean acidification), overfishing, dan polusi plastik.',
    suggestedPrompts: [
      'Apa proses ilmiah di balik pemutihan karang (coral bleaching)?',
      'Bagaimana pengasaman laut memengaruhi cangkang kerang dan karang?',
      'Apa dampak overfishing terhadap jaring makanan samudra?',
    ],
  },
  explorer: {
    id: 'explorer',
    title: 'Museum Biota Samudra',
    description: 'Ensiklopedia interaktif 32 spesies laut lengkap dengan status IUCN, habitat, kedalaman, dan peran ekologis.',
    suggestedPrompts: [
      'Mengapa hiu dan pari manta penting bagi keseimbangan laut?',
      'Bagaimana adaptasi makhluk laut dalam di zona afotik?',
      'Spesies laut Indonesia apa saja yang berstatus terancam punah?',
    ],
  },
  tracker: {
    id: 'tracker',
    title: 'Global Plastic Tracker',
    description: 'Peta interaktif 3D dan 2D sebaran sampah plastik samudra, pusaran arus (ocean gyres), dan zona penumpukan limbah.',
    suggestedPrompts: [
      'Mengapa sampah plastik berkumpul di Great Pacific Garbage Patch?',
      'Bagaimana mikroplastik masuk ke rantai makanan hingga ke manusia?',
      'Negara dan sungai mana yang paling berpengaruh pada aliran plastik laut?',
    ],
  },
  simulator: {
    id: 'simulator',
    title: 'Simulator Ekosistem Laut',
    description: 'Laboratorium simulasi parameter suhu laut, pH, tingkat plastik, dan biomassa karang serta ikan.',
    suggestedPrompts: [
      'Berapa batas kenaikan suhu laut yang memicu kematian karang massal?',
      'Mengapa pH laut turun dari 8,2 menjadi sekitar 8,1 sangat berbahaya?',
      'Bagaimana memulihkan ekosistem karang yang sudah mengalami stres?',
    ],
  },
  game: {
    id: 'game',
    title: 'Game Bersih Laut',
    description: 'Mini-game edukasi membersihkan sampah plastik laut sambil melindungi biota.',
    suggestedPrompts: [
      'Teknologi nyata apa yang dipakai untuk membersihkan plastik di samudra?',
      'Mengapa jaring hantu (ghost nets) sangat mematikan bagi penyu?',
      'Bagaimana cara mencegah plastik dari darat masuk ke laut?',
    ],
  },
  knowledge: {
    id: 'knowledge',
    title: 'Pustaka Riset Sains',
    description: 'Kumpulan artikel sains kelautan mengenai blue carbon, mangrove, lamun, terumbu karang, dan laut dalam.',
    suggestedPrompts: [
      'Apa itu blue carbon dan mengapa mangrove sangat efektif menyerap CO2?',
      'Apa perbedaan peran ekologis padang lamun dan hutan mangrove?',
      'Bagaimana fitoplankton memengaruhi siklus karbon global?',
    ],
  },
  calculator: {
    id: 'calculator',
    title: 'Kalkulator Jejak Plastik',
    description: 'Alat hitung estimasi konsumsi plastik tahunan pengguna dan langkah pengurangannya.',
    suggestedPrompts: [
      'Jenis plastik sekali pakai apa yang paling sering mencemari pesisir?',
      'Apakah bioplastik benar-benar terurai cepat di air laut?',
      'Langkah paling berdampak untuk memangkas jejak plastik harian?',
    ],
  },
  missions: {
    id: 'missions',
    title: 'Misi Aksi Nyata',
    description: 'Daftar misi konservasi harian dan komunitas yang dapat dikerjakan pengguna untuk mendapatkan XP.',
    suggestedPrompts: [
      'Bagaimana pelajar atau masyarakat umum bisa berkontribusi pada SDG 14?',
      'Apa panduan memilih seafood yang berkelanjutan?',
      'Bagaimana cara memulai aksi bersih pantai atau sungai yang efektif?',
    ],
  },
  dashboard: {
    id: 'dashboard',
    title: 'Explorer Passport',
    description: 'Profil progres, level, lencana konservasi, dan daftar spesies favorit tersimpan milik pengguna.',
    suggestedPrompts: [
      'Fakta mengejutkan tentang keanekaragaman laut Segitiga Terumbu Karang?',
      'Bagaimana peran kawasan konservasi laut (MPA) memulihkan stok ikan?',
      'Rekomendasi topik riset kelautan menarik untuk dipelajari selanjutnya?',
    ],
  },
  quiz: {
    id: 'quiz',
    title: 'Tantangan Kuis Sains',
    description: 'Kuis interaktif menguji pemahaman tentang ekosistem laut, biologi kelautan, dan polusi plastik.',
    suggestedPrompts: [
      'Jelaskan perbedaan zona fotik, batipelagik, dan abisopelagik!',
      'Berapa persen oksigen bumi yang diproduksi oleh organisme laut?',
      'Mengapa sirkulasi termohalin disebut sabuk pengangkut panas bumi?',
    ],
  },
  data: {
    id: 'data',
    title: 'Visualisasi Data Resmi',
    description: 'Grafik tren suhu permukaan laut, kenaikan muka air laut, stok ikan global, dan proyeksi plastik dari NOAA, IPCC, FAO, UNEP.',
    suggestedPrompts: [
      'Bagaimana tren suhu permukaan laut global dalam beberapa tahun terakhir?',
      'Apa data terbaru mengenai status stok perikanan dunia menurut FAO?',
      'Mengapa kenaikan suhu laut memicu siklon dan cuaca ekstrem?',
    ],
  },
  news: {
    id: 'news',
    title: 'Berita Kelautan',
    description: 'Kurasi laporan jurnalisme dan kabar terbaru seputar konservasi samudra, terumbu karang, dan kebijakan maritim.',
    suggestedPrompts: [
      'Apa perkembangan terbaru Perjanjian Laut Lepas PBB (High Seas Treaty)?',
      'Bagaimana kabar pemutihan karang global (global coral bleaching) terkini?',
      'Inovasi terbaru apa yang membantu konservasi laut di Indonesia?',
    ],
  },
};

export function findMarineFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('karang') || q.includes('coral') || q.includes('bleaching') || q.includes('pemutihan')) {
    return `### Pemutihan & Ekosistem Terumbu Karang

Terumbu karang menyokong sekitar **25% seluruh keanekaragaman hayati laut** meski luasnya kurang dari 1% dasar samudra.

1. **Simbiosis Alga**: Polip karang bergantung pada alga mikroskopis *Zooxanthellae* yang memberi warna sekaligus menyuplai hingga **90% energi** lewat fotosintesis.
2. **Pemicu Stres Termal**: Kenaikan suhu permukaan laut **1–2°C** di atas ambang normal memicu pelepasan *Zooxanthellae*, membuat karang memutih (*coral bleaching*) dan rentan mati jika suhu panas berlangsung lama.
3. **Pengasaman Laut**: Penyerapan CO2 berlebih menurunkan pH air laut dan mengurangi ion karbonat yang dibutuhkan karang untuk membangun kerangka kalsium karbonatnya.`;
  }

  if (q.includes('plastik') || q.includes('mikroplastik') || q.includes('sampah') || q.includes('gyre')) {
    return `### Polusi Plastik & Mikroplastik di Samudra

Diperkirakan **8–11 juta ton sampah plastik** masuk ke lautan setiap tahun melalui sungai, limpasan pesisir, dan aktivitas perikanan.

- **Akumulasi di Pusaran Arus**: Arus laut global (*ocean gyres*) memerangkap serpihan plastik di lima zona utama, termasuk *Great Pacific Garbage Patch*.
- **Bahaya Mikroplastik (<5 mm)**: Plastik tidak terurai secara hayati, melainkan terpecah oleh sinar UV dan ombak menjadi mikroplastik yang mudah tertelan plankton, ikan, hingga mamalia laut.
- **Jaring Hantu (*Ghost Nets*)**: Alat tangkap hilang/dibuang terus menjerat penyu, hiu, dan lumba-lumba di kolom air selama puluhan tahun.`;
  }

  if (q.includes('asam') || q.includes('ph') || q.includes('acidification') || q.includes('karbon')) {
    return `### Pengasaman Laut & Siklus Karbon

Samudra menyerap sekitar **25–30% emisi karbon dioksida (CO2)** yang dilepaskan aktivitas manusia, sehingga menjadi penyangga iklim sekaligus mengalami perubahan kimia.

1. **Reaksi Asam Karbonat**: Ketika CO2 larut dalam air laut, terbentuk asam karbonat yang melepaskan ion hidrogen dan menurunkan pH laut (saat ini rata-rata turun dari **8,2 menjadi ~8,1**—setara peningkatan keasaman ~30%).
2. **Dampak Kalsifikasi**: Berkurangnya ion karbonat menghambat pertumbuhan kerangka terumbu karang, kerang, tiram, serta plankton pteropoda yang menjadi dasar rantai makanan laut.`;
  }

  if (q.includes('blue carbon') || q.includes('mangrove') || q.includes('lamun') || q.includes('bakau')) {
    return `### Blue Carbon: Mangrove, Padang Lamun & Rawa Pasang Surut

Ekosistem pesisir bervegetasi menyimpan karbon hingga **4–10 kali lebih padat per hektare** dibanding hutan daratan tropis karena sedimen basahnya memperlambat pembusukan organik.

- **Hutan Mangrove**: Melindungi garis pantai dari abrasi dan tsunami, menjadi daerah asuhan (*nursery ground*) ikan serta udang, dan menyimpan cadangan karbon raksasa di akar dan tanah gambutnya.
- **Padang Lamun (*Seagrass*)**: Tumbuhan berbunga laut yang menjernihkan air, menstabilkan sedimen dasar laut, menyuplai oksigen, dan menjadi pakan utama penyu hijau serta dugong.`;
  }

  if (q.includes('hiu') || q.includes('paus') || q.includes('penyu') || q.includes('ikan') || q.includes('spesies') || q.includes('biota')) {
    return `### Peran Kunci Biota & Rantai Makanan Laut

Setiap kelompok biota laut menjaga kestabilan jejaring trofik samudra:

- **Predator Puncak (Hiu & Tuna)**: Mengontrol populasi pemangsa menengah agar populasi ikan herbivora pemakan alga di terumbu karang tetap sehat.
- **Paus & Mamalia Laut**: Melalui *whale pump*, kotoran paus menyuburkan lapisan permukaan dengan zat besi dan nitrogen yang memicu pertumbuhan fitoplankton penyerap karbon.
- **Penyu Laut**: Menjaga kesehatan padang lamun (penyu hijau) dan populasi spons di terumbu karang (penyu sisik).`;
  }

  return `### Penjelasan Sains Kelautan — SDG 14

Pertanyaan Anda mengenai **"${query}"** berkaitan erat dengan dinamika ekosistem samudra global:

1. **Regulator Iklim & Oksigen**: Laut menghasilkan lebih dari **50% oksigen atmosfer** melalui fitoplankton dan menyerap lebih dari **90% kelebihan panas** akibat pemanasan global.
2. **Kerentanan Ekosistem**: Tekanan utama saat ini meliputi pemanasan laut, pengasaman air laut, penangkapan ikan berlebih (*overfishing*), dan polusi plastik serta nutrien.
3. **Solusi Konservasi**: Perluasan Kawasan Konservasi Laut (*Marine Protected Areas*), rehabilitasi mangrove/lamun, pengurangan plastik sekali pakai, dan transisi ke perikanan berkelanjutan.

*Catatan: Koneksi ke layanan AI server sedang offline/belum terkonfigurasi sehingga Aqua menampilkan ringkasan basis pengetahuan lokal.*`;
}
