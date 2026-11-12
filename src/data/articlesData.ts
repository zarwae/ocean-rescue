export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  readTimeMinutes: number;
  author: string;
  publishDate: string;
  coverImage: string;
  leadParagraph: string;
  contentSections: {
    heading: string;
    body: string;
  }[];
  scientificFacts: string[];
  relatedSpecies: string[];
  references: string[];
}

export const ARTICLES_DATABASE: KnowledgeArticle[] = [
  {
    id: 'understanding-sdg-14',
    title: 'Memahami SDG 14: Konservasi dan Pemanfaatan Berkelanjutan Sumber Daya Laut',
    category: 'Kebijakan Global & SDG',
    readTimeMinutes: 6,
    author: 'Divisi Sains Kelautan PBB & OCEAN RESCUE',
    publishDate: '2026-10-15',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Tujuan Pembangunan Berkelanjutan (SDG) 14: Life Below Water adalah komitmen global untuk melestarikan samudra, laut, dan sumber daya kelautan secara berkelanjutan sebagai fondasi penopang biosfer bumi.',
    contentSections: [
      {
        heading: 'Urgensi Ekologis SDG 14',
        body: 'Samudra mencakup lebih dari 70 persen permukaan bumi dan menyediakan ruang hidup terbesar bagi keanekaragaman hayati. Lebih dari tiga miliar penduduk bumi bergantung pada keanekaragaman hayati laut dan pesisir sebagai sumber mata pencaharian utama dan pasokan protein esensial. Namun, tekanan dari penangkapan ikan berlebih (overfishing), polusi limbah daratan, pemanasan global, dan pengasaman samudra mengancam daya dukung ekologis tersebut.',
      },
      {
        heading: 'Target Kunci yang Harus Dicapai',
        body: 'Target 14.1 menuntut pencegahan dan pengurangan signifikan polusi laut, khususnya dari aktivitas darat seperti sampah plastik dan limpasan nutrien. Target 14.2 mengamanatkan pengelolaan dan perlindungan ekosistem laut secara berkelanjutan. Target 14.4 mengatur pemulihan stok ikan melalui regulasi penangkapan yang efektif dan penghentian IUU Fishing (penangkapan ilegal, tak terlaporkan, dan tak diatur). Target 14.5 menargetkan konservasi minimal 10% (kini diperluas ke 30% via kesepakatan CBD 2030) kawasan pesisir dan laut dunia.',
      },
      {
        heading: 'Peran Generasi Muda dalam Implementasi',
        body: 'Pelajar dan masyarakat sipil dapat berkontribusi langsung dengan mengadopsi pola konsumsi berkelanjutan, mengurangi penggunaan plastik sekali pakai, mendukung produk boga bahari bersertifikasi MSC, dan menyebarkan literasi sains kelautan kepada komunitas sekitar.',
      },
    ],
    scientificFacts: [
      'Samudra menyerap sekitar 30% emisi karbon dioksida antropogenik yang dihasilkan manusia sejak revolusi industri.',
      'Nilai ekonomi tahunan dari barang dan jasa yang disediakan oleh samudra diperkirakan mencapai USD 2,5 triliun (setara ekonomi terbesar ke-7 di dunia).',
    ],
    relatedSpecies: ['whale-shark', 'blue-whale', 'green-sea-turtle'],
    references: ['United Nations SDG 14 Targets & Indicators', 'UN Ocean Conference Report', 'UNESCO IOC State of the Ocean Report'],
  },
  {
    id: 'marine-biodiversity-importance',
    title: 'Keanekaragaman Hayati Laut: Jaring Kehidupan Penopang Planet',
    category: 'Biologi Kelautan',
    readTimeMinutes: 7,
    author: 'Tim Ekologi Maritim OCEAN RESCUE',
    publishDate: '2026-09-28',
    coverImage: 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Keanekaragaman hayati laut bukan sekadar daftar spesies eksotis; ia adalah jaring interkoneksi biologis yang mengatur siklus nutrisi, stabilitas iklim bumi, dan ketahanan ekologis terhadap bencana alam.',
    contentSections: [
      {
        heading: 'Struktur Jaring-Jaring Makanan Bahari',
        body: 'Dari fitoplankton mikroskopis yang mengikat energi matahari melalui fotosintesis hingga predator puncak seperti hiu putih dan paus orca, setiap tingkatan trofik memainkan peran penyeimbang vital. Hilangnya satu spesies kunci (keystone species) dapat memicu fenomena trophic cascade yang meruntuhkan kestabilan seluruh ekosistem perairan.',
      },
      {
        heading: 'Segitiga Karang Dunia (Coral Triangle)',
        body: 'Perairan Indonesia, Filipina, Malaysia, Timor Leste, Papua Nugini, dan Kepulauan Solomon membentuk kawasan Coral Triangle yang menyimpan lebih dari 76% spesies karang pembangun terumbu dan lebih dari 3.000 spesies ikan karang. Ini adalah episentrum keanekaragaman hayati laut terkaya di planet Bumi.',
      },
    ],
    scientificFacts: [
      'Ilmuwan memperkirakan lebih dari 80% samudra di dunia belum pernah dipetakan atau dieksplorasi secara mendetail.',
      'Terdapat sekitar 240.000 spesies laut yang telah dideskripsikan secara ilmiah, namun jutaan spesies lainnya diperkirakan masih belum teridentifikasi.',
    ],
    relatedSpecies: ['manta-ray', 'napoleon-wrasse', 'giant-clam'],
    references: ['Census of Marine Life Final Synthesis', 'Coral Triangle Initiative (CTI-CFF)'],
  },
  {
    id: 'hidden-impact-plastic-pollution',
    title: 'Dampak Tersembunyi Sampah Plastik: Dari Megaplastik Hingga Nanoplastik',
    category: 'Pencemaran Laut',
    readTimeMinutes: 8,
    author: 'Laboratorium Toksikologi Kelautan',
    publishDate: '2026-10-02',
    coverImage: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Setiap tahun lebih dari 11 juta metrik ton sampah plastik masuk ke perairan laut dunia. Yang kasat mata di permukaan hanyalah puncak gunung es dari krisis polusi polimer abadi.',
    contentSections: [
      {
        heading: 'Fragmen Mikroplastik dan Nanoplastik',
        body: 'Di bawah terpaan sinar ultraviolet matahari dan hantaman gelombang mekanis, plastik besar tidak terurai menjadi senyawa organik, melainkan hancur menjadi partikel mikroplastik (<5mm) dan nanoplastik (<1µm). Partikel ini memiliki luas permukaan spesifik tinggi yang mengikat polutan kimia persisten seperti PCB dan pestisida.',
      },
      {
        heading: 'Bioakumulasi dan Masuknya Plastik ke Rantai Pangan Manusia',
        body: 'Zooplankton dan kerang bivalvia menyaring mikroplastik karena ukurannya yang menyerupai makanan alami. Melalui proses biomagnifikasi, racun terakumulasi pada ikan predator yang pada akhirnya dikonsumsi oleh manusia di seluruh dunia.',
      },
    ],
    scientificFacts: [
      'Partikel mikroplastik kini telah ditemukan di palung terdalam samudra (Palung Mariana kedalaman 10.994 meter) hingga es abadi Antartika.',
      'Satu helai pakaian sintetis (poliester/nilon) dapat melepaskan hingga 700.000 serat mikroplastik dalam sekali siklus pencucian mesin cuci.',
    ],
    relatedSpecies: ['green-sea-turtle', 'leatherback-turtle', 'ocean-sunfish'],
    references: ['UNEP From Pollution to Solution Report', 'Jambeck et al., Science 2015', 'Nature Microplastics Review 2022'],
  },
  {
    id: 'coral-reefs-rainforests-sea',
    title: 'Terumbu Karang: Hutan Hujan Lautan yang Berada di Titik Kritis',
    category: 'Ekosistem Karang',
    readTimeMinutes: 7,
    author: 'Dr. Sarah Latimeria / Coral Health Working Group',
    publishDate: '2026-09-12',
    coverImage: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Terumbu karang adalah megastruktur biologis terbesar di bumi yang dibangun oleh koloni jutaan hewan polip kecil yang bekerja sama dengan alga simbiotik selama ribuan tahun.',
    contentSections: [
      {
        heading: 'Simbiosis Ajaib Polip dan Zooxanthellae',
        body: 'Polip karang menyediakan kerangka kalsium karbonat dan limbah nitrogen/fosfor bagi alga Zooxanthellae (famili Symbiodiniaceae). Sebagai imbalan, alga melakukan fotosintesis dan mentransfer hingga 90% karbohidrat serta glukosa yang dihasilkannya untuk metabolisme karang.',
      },
      {
        heading: 'Ancaman Global Pemutihan Massal (Mass Bleaching)',
        body: 'Kenaikan suhu air laut sebesar 1°C di atas batas ambang musim panas selama beberapa minggu berturut-turut memicu fotokerusakan pada fotosistem alga simbiotik. Alga menghasilkan senyawa oksigen reaktif beracun (ROS) yang memaksa polip mengeluarkan mereka, mengubah karang menjadi putih kapur.',
      },
    ],
    scientificFacts: [
      'Terumbu karang menyerap hingga 97% energi gelombang ombak samudra, melindungi garis pantai dari abrasi dan kehancuran akibat badai tropis.',
      'Lebih dari 500 juta orang di seluruh dunia bergantung secara langsung pada terumbu karang untuk makanan, pendapatan, dan perlindungan pesisir.',
    ],
    relatedSpecies: ['staghorn-coral', 'brain-coral', 'clownfish'],
    references: ['NOAA Coral Reef Watch', 'Status of Coral Reefs of the World (GCRMN)'],
  },
  {
    id: 'problem-of-overfishing',
    title: 'Krisis Penangkapan Ikan Berlebih: Menjaga Keseimbangan Stok Perikanan',
    category: 'Perikanan Berkelanjutan',
    readTimeMinutes: 6,
    author: 'Konsultan Sumber Daya Hayati FAO & OCEAN RESCUE',
    publishDate: '2026-08-20',
    coverImage: 'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Armada penangkapan industri modern dengan sonar pelacak dan pukat harimau telah mendorong sepertiga stok ikan dunia dieksploitasi melampaui batas biologis yang berkelanjutan.',
    contentSections: [
      {
        heading: 'Dampak Trawl Dasar Laut dan Bycatch',
        body: 'Pukat hela dasar (bottom trawling) mengeruk lantai samudra seperti buldoser meratakan hutan purba, menghancurkan spons karang berusia ratusan tahun. Selain itu, jutaan ton satwa laut seperti penyu, lumba-lumba, dan hiu tertangkap sia-sia sebagai tangkapan sampingan (bycatch) dan dibuang mati ke laut.',
      },
      {
        heading: 'Solusi Kuota Ilmiah dan Perikanan Tradisional Berkelanjutan',
        body: 'Penerapan kuota tangkap berbasis Maximum Sustainable Yield (MSY), perlindungan musim pemijahan, dan pengakuan kearifan lokal seperti tradisi Sasi di Maluku telah terbukti berhasil memulihkan stok ikan yang sempat kritis.',
      },
    ],
    scientificFacts: [
      'Menurut laporan The State of World Fisheries and Aquaculture (SOFIA) FAO, 35,4% stok ikan laut komersial dunia saat ini dieksploitasi melampaui batas berkelanjutan.',
      'Populasi predator puncak pelagik besar seperti tuna sirip biru dan hiu samudera telah merosot hingga 70-90% sejak tahun 1950-an.',
    ],
    relatedSpecies: ['hammerhead-shark', 'great-white-shark', 'napoleon-wrasse'],
    references: ['FAO SOFIA 2024 Report', 'Sea Around Us Global Fisheries Project'],
  },
  {
    id: 'understanding-ocean-acidification',
    title: 'Pengasaman Laut: Fenomena "Osteoporosis" Kimia di Kedalaman Samudra',
    category: 'Kimia & Iklim Samudra',
    readTimeMinutes: 7,
    author: 'Tim Geokimia Kelautan OCEAN RESCUE',
    publishDate: '2026-10-10',
    coverImage: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Penyerapan emisi karbon dioksida oleh air laut telah mengubah kimia samudra pada kecepatan yang belum pernah terjadi selama 300 juta tahun terakhir dalam sejarah bumi.',
    contentSections: [
      {
        heading: 'Reaksi Kimia Asam Karbonat',
        body: 'Ketika CO2 berdifusi ke dalam air laut, ia bereaksi membentuk asam karbonat (H2CO3) yang terdisosiasi melepaskan ion H+ dan ion bikarbonat (HCO3-). Kelebihan ion H+ ini berikatan dengan ion karbonat bebas (CO3^2-), mengurangi ketersediaan bahan baku penting bagi organisme pembangun cangkang kalsium karbonat.',
      },
      {
        heading: 'Ancaman terhadap Fondasi Rantai Pangan',
        body: 'Pteropoda (siput laut bersayap mikroskopis), kokolitofor, tiram, kerang, dan karang arsitek terumbu mengalami kesulitan mengkristalkan aragonit dan kalsit. Pada perairan kutub yang dingin, cangkang pteropoda bahkan mulai larut langsung dalam hitungan minggu.',
      },
    ],
    scientificFacts: [
      'Tingkat keasaman permukaan samudra global telah meningkat sekitar 30% sejak awal revolusi industri (penurunan pH dari 8,25 menjadi ~8,14).',
      'Proyeksi IPCC menunjukkan bahwa pada akhir abad ke-21 tanpa mitigasi emisi, pH laut dapat turun lagi sebesar 0,3 hingga 0,4 unit.',
    ],
    relatedSpecies: ['staghorn-coral', 'giant-clam', 'nautilus'],
    references: ['IPCC Special Report on the Ocean and Cryosphere', 'NOAA Ocean Acidification Program'],
  },
  {
    id: 'role-of-mangrove-forests',
    title: 'Benteng Pesisir Mangrove: Juara Karbon Biru dan Pembibitan Kehidupan',
    category: 'Ekosistem Pesisir',
    readTimeMinutes: 6,
    author: 'Spesialis Konservasi Pesisir Nusantara',
    publishDate: '2026-09-18',
    coverImage: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Hutan bakau (mangrove) berdiri kokoh di pertemuan antara daratan dan lautan, menjadi ekosistem pembibitan (nursery ground) bagi ribuan spesies laut dan penyimpan karbon terhebat di planet ini.',
    contentSections: [
      {
        heading: 'Akar Tunjang Sebagai Ruang Aman Pemijahan',
        body: 'Sistem perakaran tunjang (Rhizophora) dan akar napas (Avicennia) yang rapat menjebak sedimen dan meredam energi gelombang ombak, menciptakan labirin aman tempat larva kepiting, udang windu, dan anakan ikan bertumbuh bebas dari ancaman predator laut lepas.',
      },
      {
        heading: 'Kapasitas Penyerapan Karbon Biru Raksasa',
        body: 'Sedimen tanah mangrove bersifat anaerobik (miskin oksigen) sehingga bahan organik yang terperangkap tidak cepat terurai menjadi gas CO2. Satu hektar mangrove mampu menyimpan karbon hingga lima kali lebih banyak daripada hutan hujan tropis dataran tinggi.',
      },
    ],
    scientificFacts: [
      'Indonesia memiliki sekitar 3,36 juta hektar hutan mangrove, mewakili lebih dari 20% total mangrove dunia.',
      'Satu kilometer sabuk hutan bakau yang sehat dapat meredam hingga 66% energi hantaman gelombang tsunami.',
    ],
    relatedSpecies: ['green-sea-turtle', 'clownfish', 'dugong'],
    references: ['Global Mangrove Alliance 2024 Report', 'Kementerian Lingkungan Hidup dan Kehutanan RI Data Mangrove Nasional'],
  },
  {
    id: 'deep-sea-ecosystems',
    title: 'Dunia Abisal Laut Dalam: Misteri Kehidupan di Bawah Tekanan Ekstrem',
    category: 'Eksplorasi Laut Dalam',
    readTimeMinutes: 7,
    author: 'Tim Oseanografi Ekstrem OCEAN RESCUE',
    publishDate: '2026-08-14',
    coverImage: 'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Di kedalaman lebih dari 1.000 meter di bawah permukaan laut, di mana tidak ada seberkas pun sinar matahari yang dapat menembus, kehidupan berkembang dengan adaptasi evolusi yang luar biasa.',
    contentSections: [
      {
        heading: 'Bioluminesensi: Bahasa Cahaya di Kegelapan Abisal',
        body: 'Lebih dari 90% hewan di zona mesopelagik dan batipelagik menghasilkan cahaya bioluminesensi sendiri. Cahaya ini digunakan untuk menarik pasangan, berkamuflase dari bayangan predator bawah (counter-illumination), atau memikat mangsa.',
      },
      {
        heading: 'Ventilasi Hidrotermal dan Kemosintesis',
        body: 'Di sepanjang punggungan tengah samudra, cerobong hidrotermal menyemburkan air mendidih bersuhu lebih dari 350°C yang sarat hidrogen sulfida. Di sini, bakteri kemosintetik menggantikan peran sinar matahari untuk menghasilkan biomassa, menopang komunitas cacing tabung raksasa dan kepiting buta.',
      },
    ],
    scientificFacts: [
      'Tekanan hidrostatis di dasar Palung Mariana melebihi 1.000 atmosfer (setara dengan berat 50 pesawat jet jumbo yang ditumpuk di atas tubuh seseorang).',
      'Suhu rata-rata air di zona abisal laut dalam berada stabil tepat di atas titik beku, yakni sekitar 1°C hingga 4°C.',
    ],
    relatedSpecies: ['anglerfish', 'dumbo-octopus', 'vampire-squid'],
    references: ['NOAA Ocean Exploration Office', 'Monterey Bay Aquarium Research Institute (MBARI)'],
  },
  {
    id: 'sustainable-seafood-guide',
    title: 'Panduan Konsumen Bijak: Memilih Boga Bahari yang Ramah Ekosistem',
    category: 'Gaya Hidup & Konservasi',
    readTimeMinutes: 5,
    author: 'Tim Kampanye Konsumsi Berkelanjutan',
    publishDate: '2026-10-18',
    coverImage: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Sebagai konsumen sehari-hari, pilihan menu makanan di piring kita memiliki kekuatan ekonomi langsung untuk mendukung nelayan lokal ramah lingkungan dan menghentikan penangkapan ikan ilegal.',
    contentSections: [
      {
        heading: 'Pahami Metode Penangkapan',
        body: 'Ikan yang ditangkap menggunakan pancing ulur satu-satu (one-by-one handline) atau pole-and-line memiliki dampak ekologis yang jauh lebih rendah dan nol risiko bycatch dibanding ikan hasil pukat hela industri raksasa.',
      },
      {
        heading: 'Hindari Membeli Spesies Terancam',
        body: 'Jangan pernah memesan sup sirip hiu, pari manta, ikan napoleon hidup berukuran anakan, atau telur penyu laut. Pilihlah jenis ikan pelagik kecil yang cepat berbiak seperti cakalang (skipjack tuna) dan sarden lokal dari perikanan yang terkelola dengan baik.',
      },
    ],
    scientificFacts: [
      'Konsumsi sirip hiu menyebabkan kematian diperkirakan 70 hingga 100 juta ekor hiu setiap tahun di seluruh samudra dunia.',
      'Sertifikasi MSC (Marine Stewardship Council) dan ASC (Aquaculture Stewardship Council) memastikan ketertelusuran produk dari jaring nelayan hingga rak pasar swalayan.',
    ],
    relatedSpecies: ['whale-shark', 'hammerhead-shark', 'napoleon-wrasse'],
    references: ['WWF Seafood Guide', 'Marine Stewardship Council Global Standards'],
  },
  {
    id: 'protecting-endangered-marine-species',
    title: 'Melindungi Spesies Laut Terancam: Menyelamatkan Fauna dari Garis Kepunahan',
    category: 'Konservasi Spesies',
    readTimeMinutes: 8,
    author: 'Divisi Konservasi Satwa Dilindungi IUCN & OCEAN RESCUE',
    publishDate: '2026-09-05',
    coverImage: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Dari penyu sisik yang kritis hingga paus biru yang pulih lambat, upaya perlindungan spesies membutuhkan sinergi suaka perlindungan, patroli laut, penegakan hukum, dan pemberdayaan masyarakat adat.',
    contentSections: [
      {
        heading: 'Ancaman Perdagangan Satwa Liar Ilegal',
        body: 'Permintaan pasar gelap internasional untuk cangkang penyu, gigi paus sperma, dan pelat insang pari manta mengancam kelangsungan hidup spesies yang memiliki laju reproduksi alami lambat. Pengawasan di pelabuhan dan penerapan sanksi pidana CITES menjadi garda depan pencegahan.',
      },
      {
        heading: 'Keberhasilan Konservasi Berbasis Komunitas',
        body: 'Program perlindungan pantai peneluran penyu di pesisir Papua Barat dan Bali yang melibatkan mantan pemburu telur menjadi penjaga suaka membuktikan bahwa ekowisata berbasis komunitas memberikan keuntungan ekonomi yang jauh lebih berkelanjutan daripada perburuan eksploitatif.',
      },
    ],
    scientificFacts: [
      'Hanya sekitar 1 dari 1.000 ekor tukik (anak penyu) yang berhasil bertahan hidup hingga mencapai usia dewasa di alam liar.',
      'Perlindungan total paus dari perburuan komersial sejak moratorium IWC 1986 telah memungkinkan populasi paus bungkuk kembali pulih hingga lebih dari 80.000 individu di seluruh dunia.',
    ],
    relatedSpecies: ['hawksbill-turtle', 'blue-whale', 'dugong'],
    references: ['IUCN Red List Guidelines', 'CITES Appendix Reports on Marine Species'],
  },
  {
    id: 'marine-protected-areas-science',
    title: 'Kawasan Konservasi Perairan (MPA): Suaka Pemulihan Ekosistem Laut',
    category: 'Kawasan Konservasi',
    readTimeMinutes: 6,
    author: 'Peneliti Konservasi Kawasan Laut',
    publishDate: '2026-10-22',
    coverImage: 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Kawasan Konservasi Perairan (Marine Protected Areas / MPA) adalah instrumen spasial paling ampuh untuk memulihkan keanekaragaman hayati, biomassa ikan, dan ketahanan terhadap krisis iklim.',
    contentSections: [
      {
        heading: 'Zonasi dan Zona Inti Tanpa Tangkap (No-Take Zone)',
        body: 'MPA yang efektif menerapkan sistem zonasi yang tegas: zona inti bebas dari segala aktivitas ekstraktif, dikelilingi oleh zona pemanfaatan terbatas untuk nelayan tradisional dan penelitian ilmiah. Di dalam zona tanpa tangkap, ikan dapat bertumbuh hingga ukuran maksimal dan memproduksi telur ratusan kali lebih banyak.',
      },
      {
        heading: 'Target 30x30 dan Konektivitas Antar Kawasan',
        body: 'Menghubungkan jaringan suaka laut (marine reserves network) memungkinkan koridor migrasi bagi megafauna laut seperti hiu paus, penyu, dan lumba-lumba melintasi batas perairan yurisdiksi antar negara.',
      },
    ],
    scientificFacts: [
      'Kawasan tanpa tangkap (no-take reserve) rata-rata mengalami peningkatan biomassa ikan hingga 670% dibandingkan wilayah perairan tanpa perlindungan.',
      'Saat ini baru sekitar 8% permukaan samudra dunia yang ditetapkan sebagai MPA, dengan hanya sekitar 3% yang mendapatkan perlindungan ketat.',
    ],
    relatedSpecies: ['whale-shark', 'manta-ray', 'green-sea-turtle'],
    references: ['IUCN Guidelines for Marine Protected Areas', 'Nature Ecology & Evolution MPA Synthesis 2023'],
  },
  {
    id: 'how-climate-change-affects-ocean',
    title: 'Gelombang Panas dan Deoksigenasi: Bagaimana Pemanasan Global Mengubah Lautan',
    category: 'Klimatologi Kelautan',
    readTimeMinutes: 7,
    author: 'Panel Ilmuwan Iklim Maritim OCEAN RESCUE',
    publishDate: '2026-10-05',
    coverImage: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
    leadParagraph: 'Pemanasan global tidak hanya menaikkan suhu permukaan samudra, namun juga memicu stratifikasi massa air, penurunan kadar oksigen terlarut (deoksigenasi), dan pergeseran pola arus global.',
    contentSections: [
      {
        heading: 'Gelombang Panas Laut (Marine Heatwaves)',
        body: 'Sama seperti gelombang panas di daratan, gelombang panas laut adalah periode suhu air laut tinggi ekstrem yang berlangsung berhari-hari hingga berbulan-bulan. Kejadian ini dapat mematikan padang lamun, hutan kelp, dan memicu kematian massal invertebrata bentik.',
      },
      {
        heading: 'Deoksigenasi dan Meluasnya Zona Minim Oksigen',
        body: 'Air yang lebih hangat menampung lebih sedikit gas oksigen terlarut. Ditambah dengan berkurangnya sirkulasi percampuran vertikal akibat stratifikasi densitas lapisan air, zona minim oksigen di samudra terbuka telah meluas jutaan kilometer persegi, memaksa ikan pelagik mengungsi ke lapisan permukaan yang lebih dangkal.',
      },
    ],
    scientificFacts: [
      'Frekuensi terjadinya gelombang panas laut telah meningkat lebih dari dua kali lipat sejak tahun 1982.',
      'Samudra telah menyerap energi panas yang setara dengan meledakkan lima bom atom ukuran Hiroshima setiap detik selama 25 tahun terakhir.',
    ],
    relatedSpecies: ['blue-whale', 'ocean-sunfish', 'staghorn-coral'],
    references: ['IPCC Sixth Assessment Report (AR6) WGII', 'UNESCO Ocean Deoxygenation Brief'],
  },
];
