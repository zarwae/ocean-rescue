export interface Mission {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  actionGuidance: string;
  difficulty: 'Mudah' | 'Menengah' | 'Tantangan';
  estimatedTime: string;
  xpReward: number;
  category: 'Reduksi Plastik' | 'Edukasi & Riset' | 'Aksi Komunitas' | 'Konsumsi Bijak';
}

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission-bottle',
    type: 'daily',
    title: 'Gunakan Tumbler Air Minum Sendiri',
    description: 'Bawa dan gunakan botol minum guna ulang (tumbler) sepanjang hari ini untuk menghindari pembelian botol plastik sekali pakai.',
    actionGuidance: 'Isi air minum dari rumah atau dispenser sekolah/kampus. Satu botol guna ulang menyelamatkan rata-rata 167 botol plastik per orang setiap tahun.',
    difficulty: 'Mudah',
    estimatedTime: 'Sepanjang Hari',
    xpReward: 35,
    category: 'Reduksi Plastik',
  },
  {
    id: 'mission-bag',
    type: 'daily',
    title: 'Tolak Kantong Plastik Belanja',
    description: 'Bawa tas kain jinjing atau tolak kantong kresek saat berbelanja di minimarket atau kantin.',
    actionGuidance: 'Katakan dengan sopan: "Terima kasih, saya tidak membutuhkan kantong plastik, saya bawa tas sendiri."',
    difficulty: 'Mudah',
    estimatedTime: '5 Menit',
    xpReward: 30,
    category: 'Reduksi Plastik',
  },
  {
    id: 'mission-learn-species',
    type: 'daily',
    title: 'Pelajari Satu Spesies Laut Terancam',
    description: 'Buka menu Marine Life Explorer di website ini dan baca tuntas profil ilmiah salah satu spesies berstatus Endangered (EN) atau Critically Endangered (CR).',
    actionGuidance: 'Pahami peran ekologisnya dan ancaman kepunahan utama yang sedang dihadapinya.',
    difficulty: 'Mudah',
    estimatedTime: '10 Menit',
    xpReward: 40,
    category: 'Edukasi & Riset',
  },
  {
    id: 'mission-share-fact',
    type: 'daily',
    title: 'Bagikan 1 Fakta Konservasi Laut',
    description: 'Ceritakan satu fakta ilmiah tentang SDG 14 kepada teman sekelas, keluarga, atau bagikan di media sosial Anda.',
    actionGuidance: 'Contoh fakta: "Tahukah kamu lebih dari 50% oksigen di bumi dihasilkan oleh fitoplankton mikroskopis di laut?"',
    difficulty: 'Mudah',
    estimatedTime: '5 Menit',
    xpReward: 35,
    category: 'Edukasi & Riset',
  },
  {
    id: 'mission-cutlery',
    type: 'daily',
    title: 'Tolak Sedotan & Alat Makan Plastik',
    description: 'Makan atau minum hari ini tanpa menggunakan sedotan plastik maupun sendok/garpu sekali pakai.',
    actionGuidance: 'Gunakan sedotan stainless/bambu atau minum langsung dari gelas.',
    difficulty: 'Mudah',
    estimatedTime: '15 Menit',
    xpReward: 30,
    category: 'Reduksi Plastik',
  },
  // Weekly Challenges
  {
    id: 'weekly-cleanup',
    type: 'weekly',
    title: 'Aksi Bersih Lingkungan / Pesisir Mini',
    description: 'Kumpulkan dan pilah setidaknya 1 kantong sampah anorganik (botol, sedotan, kemasan sachet) di lingkungan selokan, sungai, atau pesisir sekitar Anda.',
    actionGuidance: 'Gunakan sarung tangan pengaman. Plastik yang tersangkut di saluran air kota pada akhirnya akan mengalir ke samudra jika tidak dicegah.',
    difficulty: 'Tantangan',
    estimatedTime: '45 Menit',
    xpReward: 120,
    category: 'Aksi Komunitas',
  },
  {
    id: 'weekly-seafood-audit',
    type: 'weekly',
    title: 'Audit Sumber Boga Bahari Keluarga',
    description: 'Cari tahu asal-usul ikan atau hidangan laut yang dikonsumsi di rumah/kantin minggu ini dan pastikan bukan spesies dilindungi.',
    actionGuidance: 'Pastikan keluarga tidak mengonsumsi hiu, anakan ikan napoleon, atau ikan hasil bom karang/trawl dasar.',
    difficulty: 'Menengah',
    estimatedTime: '30 Menit',
    xpReward: 85,
    category: 'Konsumsi Bijak',
  },
  {
    id: 'weekly-quiz-master',
    type: 'weekly',
    title: 'Selesaikan Kuis Kelautan dengan Akurasi >80%',
    description: 'Uji wawasan sains kelautan Anda di menu Ocean Quiz dan raih skor minimal 80% pada tingkat Intermediate atau Advanced.',
    actionGuidance: 'Pelajari penjelasan ilmiah pada setiap jawaban untuk memperdalam pemahaman SDG 14.',
    difficulty: 'Menengah',
    estimatedTime: '20 Menit',
    xpReward: 95,
    category: 'Edukasi & Riset',
  },
  {
    id: 'weekly-waste-sort',
    type: 'weekly',
    title: 'Pilah Sampah Daur Ulang Rumah Tangga',
    description: 'Pisahkan sampah plastik PET bersih dan kardus selama 7 hari berturut-turut untuk disalurkan ke bank sampah atau fasilitas daur ulang terdekat.',
    actionGuidance: 'Bilas botol plastik hingga bersih dan remukkan untuk menghemat ruang penyimpanan.',
    difficulty: 'Tantangan',
    estimatedTime: '1 Minggu',
    xpReward: 150,
    category: 'Reduksi Plastik',
  },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  requiredXp?: number;
  conditionDescription: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first-dive',
    name: 'First Dive',
    description: 'Langkah pertama menjelajahi samudra konservasi digital.',
    iconName: 'Compass',
    conditionDescription: 'Buka website dan selesaikan eksplorasi pertama Anda.',
  },
  {
    id: 'plastic-fighter',
    name: 'Plastic Fighter',
    description: 'Penjaga garis pantai dari serbuan sampah anorganik.',
    iconName: 'Trash2',
    conditionDescription: 'Selesaikan minimal 1 level pada Game Ocean Cleanup atau hitung jejak plastik.',
  },
  {
    id: 'marine-explorer',
    name: 'Marine Explorer',
    description: 'Mengenal keanekaragaman biota laut yang luar biasa.',
    iconName: 'Search',
    conditionDescription: 'Tandai setidaknya 3 spesies laut favorit di Ensiklopedia.',
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Pakar literasi sains biologi kelautan dan SDG 14.',
    iconName: 'Award',
    conditionDescription: 'Selesaikan satu sesi tantangan kuis dengan benar.',
  },
  {
    id: 'coral-protector',
    name: 'Coral Protector',
    description: 'Memahami sains kesetimbangan terumbu karang tropis.',
    iconName: 'ShieldAlert',
    conditionDescription: 'Jalankan simulasi ekosistem laut pada simulator interaktif.',
  },
  {
    id: 'deep-sea-discoverer',
    name: 'Deep Sea Discoverer',
    description: 'Menyingkap rahasia kehidupan di palung abisal terdalam.',
    iconName: 'Anchor',
    conditionDescription: 'Capai level 3 pada Game Ocean Cleanup atau baca artikel laut dalam.',
  },
  {
    id: 'ocean-guardian',
    name: 'Ocean Guardian',
    description: 'Gelar kehormatan tertinggi pelindung samudra bumi.',
    iconName: 'Sparkles',
    conditionDescription: 'Kumpulkan total akumulasi 600 XP atau capai Level 3 Marine Protector.',
  },
];
