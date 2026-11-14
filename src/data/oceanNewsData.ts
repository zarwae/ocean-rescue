import { NewsComment, OceanNewsTopic } from '../utils/newsRecommendation';
import heroOceanImg from '../assets/images/hero_ocean_descent_1794530080584.jpg';
import ecologicalReefImg from '../assets/images/ecological_pillar_reef_1794530081122.jpg';
import abyssTwilightImg from '../assets/images/abyss_twilight_zone_1794530081646.jpg';
import plasticDriftImg from '../assets/images/plastic_ocean_drift_1794530081643.jpg';

export interface OceanNewsArticle {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  publishDate: string;
  topic: OceanNewsTopic;
  readTimeMinutes: number;
  coverImage: string;
  figureCaption: string;
  summary: string;
  paragraphs: string[];
  keyFacts: string[];
  initialLikes: number;
  initialComments: NewsComment[];
}

export const OCEAN_NEWS_ARTICLES: OceanNewsArticle[] = [
  {
    id: 'raja-ampat-heat-tolerant-coral-2026',
    title: 'Koloni Karang Tahan Panas Ditemukan Bertahan di Perairan Dangkal Raja Ampat',
    author: 'Nadia Kusumawardhani',
    authorRole: 'Jurnalis Sains Kelautan',
    publishDate: '2026-11-12',
    topic: 'Terumbu Karang',
    readTimeMinutes: 5,
    coverImage: ecologicalReefImg,
    figureCaption: 'Struktur koloni karang keras Acropora di perairan Raja Ampat tetap berpigmen cerah di tengah anomali suhu permukaan laut.',
    summary: 'Pemantauan dua tahun oleh tim peneliti kelautan Nusantara menemukan ratusan koloni karang alami yang mampu mempertahankan alga simbiotiknya meski suhu air naik di atas rata-rata musiman.',
    paragraphs: [
      'Di tengah gelombang panas laut global yang memicu pemutihan karang di berbagai belahan samudra tropis, tim peneliti gabungan dari Papua Barat dan pusat studi oseanografi melaporkan temuan yang memberi harapan baru. Sejumlah koloni karang batu di selat dangkal Raja Ampat memperlihatkan ketahanan termal luar biasa tanpa kehilangan alga simbiotik Zooxanthellae.',
      'Melalui pemetaan fotogrametri bawah air dan pengambilan sampel DNA lingkungan (eDNA) sepanjang tahun 2025 hingga akhir 2026, para ilmuwan mengidentifikasi bahwa arus pasang surut lokal yang kuat membawa air dingin dari lapisan mesopelagik naik secara berkala. Sirkulasi alami ini membantu karang melatih respons fisiologisnya terhadap fluktuasi suhu ekstrem.',
      'Ketahanan tersebut tidak berhenti pada faktor lingkungan semata. Analisis genetik awal menyingkap dominasi galur alga simbiotik Cladocopium yang lebih tahan terhadap tekanan oksidatif dibandingkan jenis umum lainnya. Temuan ini membuka jalan bagi teknik transplantasi terarah tanpa harus mengubah ekosistem alami secara agresif.',
      'Para ahli menegaskan bahwa karang tahan panas bukanlah alasan untuk menunda pengurangan emisi karbon global. Namun, menjadikan zona-zona refugia termal ini sebagai kawasan perlindungan inti memberi waktu berharga bagi terumbu karang Indonesia untuk beradaptasi dan memulihkan stok larva ke perairan sekitarnya.',
    ],
    keyFacts: [
      'Lebih dari 68% koloni di zona arus selat bertahan tanpa pemutihan berat sepanjang anomali panas 2026.',
      'Pemulihan tutupan karang di lokasi pemantauan mencapai 14% lebih cepat dibanding area perairan tenang.',
      'Hasil penelitian dijadikan rujukan penetapan koridor konservasi baru bersama masyarakat adat setempat.',
    ],
    initialLikes: 214,
    initialComments: [
      {
        id: 'seed-c-1',
        authorName: 'Raka Pratama',
        text: 'Menarik sekali melihat peran arus pasang surut lokal sebagai pendingin alami terumbu karang. Semoga koridor perlindungannya segera disahkan.',
        createdAt: '2026-11-12T10:20:00.000Z',
      },
    ],
  },
  {
    id: 'muara-interceptor-river-plastic-2026',
    title: 'Penghalang Sampah Otonom di Tiga Muara Jawa Tekan Aliran Plastik ke Laut Jawa hingga 61%',
    author: 'Dimas Adiputra',
    authorRole: 'Koresponden Maritim & Pesisir',
    publishDate: '2026-11-10',
    topic: 'Polusi Plastik',
    readTimeMinutes: 4,
    coverImage: plasticDriftImg,
    figureCaption: 'Ilustrasi zona akumulasi sampah plastik permukaan sebelum terpecah menjadi serpihan mikroplastik di laut terbuka.',
    summary: 'Operasi sistem pemilah sampah bertenaga surya di muara sungai padat penduduk membuktikan pencegahan di hilir jauh lebih efisien daripada pembersihan di tengah samudra.',
    paragraphs: [
      'Selama satu dekade terakhir, sebagian besar upaya penanganan plastik laut terfokus pada pembersihan pantai setelah sampah terdampar atau operasi kapal penyapu di perairan terbuka. Namun laporan evaluasi terbaru dari tiga muara sungai besar di pesisir utara Jawa menunjukkan hasil jauh lebih efektif ketika pencegahan dilakukan tepat sebelum sampah memasuki laut lepas.',
      'Menggunakan penghalang terapung berkonveyor tenaga surya yang beroperasi 24 jam, unit pemilah berhasil mencegat rata-rata 4,8 ton limbah rumah tangga setiap hari sebelum terbawa arus musim barat. Plastik kemasan multilayer dan botol PET langsung dipisahkan dari material organik sungai seperti eceng gondok.',
      'Keberhasilan teknis ini turut mengubah rantai nilai pengelolaan sampah di tingkat kelurahan pesisir. Sekitar 42% plastik keras yang tertangkap masih cukup bersih untuk dicacah dan dikirim ke pabrik daur ulang lokal, sementara sisanya diproses agar tidak kembali terbawa banjir rob.',
      'Peneliti pencemaran laut mengingatkan bahwa intervensi teknologi muara tetap harus berjalan beriringan dengan pengurangan kemasan sekali pakai dari produsen. Tanpa penghentian suplai di hulu, volume sampah musiman pada puncak musim hujan tetap berisiko melampaui kapasitas penampungan.',
    ],
    keyFacts: [
      'Pengurangan aliran plastik permukaan ke perairan pesisir tercatat sebesar 61% dalam 9 bulan operasi.',
      'Biaya penangkapan per kilogram plastik di muara tercatat 7 kali lebih rendah dibanding operasi kapal di laut lepas.',
      'Program melibatkan 120 pekerja pemilah lokal dari komunitas nelayan sekitar muara.',
    ],
    initialLikes: 186,
    initialComments: [],
  },
  {
    id: 'indonesian-throughflow-warming-2026',
    title: 'Pengukuran Arus Lintas Indonesia Mencatat Pergeseran Suhu Lapisan Termoklin',
    author: 'Dr. Arifin Hidayatullah',
    authorRole: 'Kontributor Oseanografi Fisik',
    publishDate: '2026-11-08',
    topic: 'Iklim & Arus',
    readTimeMinutes: 6,
    coverImage: abyssTwilightImg,
    figureCaption: 'Profil kolom air laut dalam zona pelagik hingga twilight zone menjadi indikator sensitif perubahan neraca panas samudra.',
    summary: 'Pelampung sensor laut dalam di Selat Makassar merekam pemanasan halus di kedalaman 200 meter yang memengaruhi pola migrasi ikan pelagis dan cuaca regional.',
    paragraphs: [
      'Arus Lintas Indonesia atau Indonesian Throughflow (ITF) merupakan salah satu jalur sirkulasi samudra terpenting di bumi yang memindahkan jutaan meter kubik air hangat dan tawar dari Samudra Pasifik menuju Samudra Hindia. Data terbaru dari rangkaian pelampung sensor otonom di Selat Makassar mengungkap bahwa perubahan iklim tidak hanya memanaskan permukaan laut.',
      'Selama 18 bulan pengamatan kontinu, sensor mencatat kenaikan suhu rata-rata sebesar 0,38 derajat Celsius pada kedalaman 150 hingga 250 meter—wilayah yang dikenal sebagai lapisan termoklin. Pergeseran ini menandakan panas atmosfer kini semakin dalam tersimpan ke dalam kolom samudra.',
      'Dampak ekologis dari pergeseran termoklin mulai dirasakan oleh sektor perikanan tangkap. Kawanan ikan pelagis bernilai ekonomis seperti cakalang dan tuna mata besar cenderung bergerak lebih dalam atau bergeser ke lintang selatan mengikuti batas suhu optimal mereka.',
      'Tim oseanografi saat ini mengintegrasikan data sensor bawah laut tersebut ke dalam model prakiraan curah hujan dan iklim maritim nasional agar nelayan tradisional mendapatkan informasi daerah tangkapan yang lebih akurat.',
    ],
    keyFacts: [
      'Arus Lintas Indonesia mengalirkan sekitar 15 juta meter kubik air laut setiap detik antara Pasifik dan Hindia.',
      'Kenaikan suhu di lapisan termoklin berdampak langsung pada distribusi oksigen terlarut dan produktivitas fitoplankton.',
      'Pembaruan data pelampung dipancarkan via satelit setiap enam jam untuk kalibrasi prakiraan iklim regional.',
    ],
    initialLikes: 149,
    initialComments: [],
  },
  {
    id: 'satellite-tracking-manta-corridor-2026',
    title: 'Pelacakan Satelit Ungkap Jalur Migrasi Tersembunyi Pari Manta di Laut Sawu dan Flores',
    author: 'Siti Rahma Alatas',
    authorRole: 'Peneliti & Penulis Biota Pelagis',
    publishDate: '2026-11-06',
    topic: 'Biota Laut',
    readTimeMinutes: 5,
    coverImage: heroOceanImg,
    figureCaption: 'Ruang jelajah vertikal pari manta oseanik membentang dari perairan permukaan kaya plankton hingga kedalaman laut terbuka.',
    summary: 'Penandaan akustik dan satelit pada 28 ekor pari manta membongkar koridor penghubung antar-taman nasional yang selama ini berada di luar zona pantau kapal wisata.',
    paragraphs: [
      'Pari manta karang dan oseanik selama ini kerap terlihat berkumpul di stasiun pembersihan populer seperti Nusa Penida dan Komodo. Namun ke mana raksasa lembut ini pergi ketika musim berganti masih lama menjadi teka-teki bagi ilmuwan konservasi.',
      'Rekaman dari pemancar satelit berdaya rendah yang ditempatkan secara aman pada sirip punggung 28 individu kini memberi peta utuh. Data membuktikan adanya koridor lintas laut selebar puluhan kilometer yang menghubungkan Laut Flores hingga cekungan dalam Laut Sawu pada bulan-bulan peralihan angin.',
      'Di sepanjang koridor tersebut, fenomena upwelling musiman mengangkat nutrien dasar laut ke permukaan dan menciptakan hamparan padat krill serta zooplankton—sumber pakan utama pari manta yang menyaring air hingga ratusan liter per menit.',
      'Dengan ditemukannya titik-titik lintasan padat ini, pengelola taman perairan dapat menyusun aturan batas kecepatan kapal niaga musiman serta mencegah benturan tidak sengaja dengan satwa dilindungi penuh tersebut.',
    ],
    keyFacts: [
      'Individu pari manta yang dipantau mampu menempuh jarak migrasi lebih dari 1.400 kilometer dalam satu musim.',
      'Sebanyak 73% waktu makan berlangsung pada kedalaman 30 hingga 120 meter di malam hari.',
      'Indonesia merupakan salah satu habitat dengan populasi pari manta terpenting di dunia.',
    ],
    initialLikes: 238,
    initialComments: [
      {
        id: 'seed-c-2',
        authorName: 'Maya Lestari',
        text: 'Peta koridor seperti ini penting banget supaya kapal feri dan kargo tahu kapan harus memperlambat laju di Laut Sawu.',
        createdAt: '2026-11-07T08:45:00.000Z',
      },
    ],
  },
  {
    id: 'high-seas-treaty-ratification-push-2026',
    title: 'Perjanjian Laut Lepas Global Mulai Diterapkan: Menuju Perlindungan 30% Samudra Dunia',
    author: 'Bagas Prakoso',
    authorRole: 'Editor Kebijakan Maritim',
    publishDate: '2026-11-03',
    topic: 'Kebijakan & Konservasi',
    readTimeMinutes: 6,
    coverImage: heroOceanImg,
    figureCaption: 'Wilayah laut lepas di luar batas yurisdiksi nasional mencakup hampir dua pertiga seluruh permukaan samudra bumi.',
    summary: 'Berlakunya mekanisme hukum internasional BBNJ memungkinkan pembentukan kawasan konservasi di laut lepas yang sebelumnya nyaris tanpa pengawasan terpadu.',
    paragraphs: [
      'Hampir dua pertiga luas samudra planet ini berada di luar Zona Ekonomi Eksklusif negara mana pun. Selama puluhan tahun, kawasan yang disebut laut lepas itu menjadi ruang abu-abu yang rentan terhadap penangkapan ikan berlebih dan eksplorasi tanpa kerangka perlindungan keanekaragaman hayati yang mengikat.',
      'Memasuki fase implementasi awal perjanjian Biodiversity Beyond National Jurisdiction (BBNJ), koalisi negara maritim termasuk perwakilan kawasan Asia Tenggara mulai mengajukan cetak biru kawasan lindung laut internasional pertama di Samudra Hindia bagian timur dan Pasifik barat.',
      'Salah satu terobosan terbesar perjanjian ini adalah kewajiban analisis dampak lingkungan lintas batas sebelum aktivitas industri baru seperti penambangan dasar laut dalam atau rekayasa geo-iklim dapat dipertimbangkan di perairan internasional.',
      'Bagi negara kepulauan seperti Indonesia, tata kelola laut lepas yang lebih ketat secara langsung ikut melindungi stok ikan tuna migran dan mamalia laut yang melintasi perairan nasional sepanjang siklus hidupnya.',
    ],
    keyFacts: [
      'Target global 30x30 menetapkan perlindungan 30% daratan dan 30% lautan dunia pada tahun 2030.',
      'Perjanjian BBNJ mewajibkan berbagi pengetahuan ilmiah dan data genetik laut secara adil antarnegara.',
      'Pengawasan kepatuhan akan mengandalkan sistem identifikasi otomatis (AIS) dan pemantauan citra satelit terbuka.',
    ],
    initialLikes: 175,
    initialComments: [],
  },
  {
    id: 'microplastic-mangrove-trap-study-2026',
    title: 'Akar Mangrove Terbukti Menyaring Ratusan Ton Serpihan Mikroplastik Sebelum Mencapai Terumbu Karang',
    author: 'Nadia Kusumawardhani',
    authorRole: 'Jurnalis Sains Kelautan',
    publishDate: '2026-10-30',
    topic: 'Polusi Plastik',
    readTimeMinutes: 5,
    coverImage: plasticDriftImg,
    figureCaption: 'Jalinan akar napas mangrove memperlambat arus pasang surut sekaligus memerangkap sedimen dan fragmen plastik halus.',
    summary: 'Riset ekologi pesisir menunjukkan sabuk hutan bakau sehat berfungsi sebagai penyaring biologis ganda yang melindungi padang lamun dan karang di sisi laut.',
    paragraphs: [
      'Hutan mangrove selama ini dikenal luas sebagai pelindung garis pantai dari abrasi dan penyerap karbon biru raksasa. Kini studi sedimentologi di empat estuari Indonesia menambah daftar panjang jasa ekologisnya: kemampuan memerangkap serat serta fragmen mikroplastik yang terbawa aliran sungai.',
      'Rapatnya jaringan akar tunjang Rhizophora menurunkan kecepatan arus air hingga lebih dari 70 persen. Ketika aliran melambat, partikel plastik mikro yang bercampur dengan lumpur organik mengendap di dasar sedimen bakau alih-alih melayang bebas ke padang lamun dan terumbu karang di lepas pantai.',
      'Meskipun temuan ini menegaskan peran vital mangrove sebagai benteng penyaring pesisir, para peneliti menekankan bahwa kapasitas sedimen bukanlah tempat pembuangan tanpa batas. Akumulasi plastik yang terlalu pekat tetap dapat mengganggu biota dasar seperti kepiting bakau dan kerang lumpur.',
      'Karena itu, rehabilitasi mangrove di muara sungai perlu dipadukan dengan pengendalian limbah rumah tangga di daratan agar ekosistem bakau tidak terbebani melampaui daya pulih alaminya.',
    ],
    keyFacts: [
      'Konsentrasi mikroplastik di perairan luar sabuk mangrove tercatat 48% lebih rendah dibanding mulut sungai.',
      'Satu hektare mangrove menyimpan karbon 3 hingga 5 kali lebih besar daripada hutan hujan tropis daratan.',
      'Sebagian besar serat yang terperangkap berasal dari limbah tekstil sintetis dan jaring nelayan usang.',
    ],
    initialLikes: 162,
    initialComments: [],
  },
  {
    id: 'bioacoustic-reef-recovery-2026',
    title: 'Rekaman Suara Terumbu Karang Sehat Mempercepat Kembalinya Ikan Muda ke Zona Rehabilitasi',
    author: 'Siti Rahma Alatas',
    authorRole: 'Peneliti & Penulis Biota Pelagis',
    publishDate: '2026-10-26',
    topic: 'Terumbu Karang',
    readTimeMinutes: 4,
    coverImage: ecologicalReefImg,
    figureCaption: 'Pemasangan pengeras suara bawah air bertenaga surya menciptakan lanskap akustik alami untuk memandu larva ikan karang.',
    summary: 'Eksperimen bioakustik bawah laut di Sulawesi membuktikan larva ikan karang mengandalkan suara gemeretak udang pistol dan dengungan ikan untuk menemukan rumah baru.',
    paragraphs: [
      'Terumbu karang yang sehat jauh dari kata sunyi. Di bawah permukaan air, koloni udang pistol, ikan damsel, dan bulu babi menghasilkan simfoni suara berfrekuensi rendah yang dapat merambat berkilo-kilometer jauhnya melalui air laut.',
      'Sebaliknya, karang yang rusak akibat pengeboman ikan atau pemutihan menjadi hening secara akustik. Keheningan ini membuat larva ikan pelagis yang baru berenang kembali ke pesisir gagal mengenali lokasi yang layak untuk menetap.',
      'Dalam uji coba selama empat bulan di kawasan rehabilitasi terumbu di Sulawesi Tengah, tim peneliti memasang pemancar suara bawah air yang memutar rekaman lanskap suara karang sehat. Hasilnya mengejutkan: jumlah larva ikan pemakan alga yang kembali menetap meningkat dua kali lipat dibanding plot tanpa suara.',
      'Kehadiran kembali ikan-ikan pemakan alga tersebut memicu efek berantai positif karena mereka menjaga permukaan batu karang tetap bersih dari lumut pengganggu sehingga bibit karang baru lebih mudah menempel.',
    ],
    keyFacts: [
      'Rekaman suara bawah laut meningkatkan rekrutmen ikan remaja hingga 2,1 kali lipat dalam 16 minggu.',
      'Ikan herbivora yang kembali membantu menekan pertumbuhan makroalga pesaing karang hingga 35%.',
      'Teknik pengayaan akustik dapat dijalankan dengan daya panel surya kecil di rakit pemantau.',
    ],
    initialLikes: 198,
    initialComments: [],
  },
  {
    id: 'deep-sea-thermal-vent-biodiversity-2026',
    title: 'Ekspedisi Laut Dalam Temukan Spesies Moluska dan Cacing Tabung Baru di Celah Vulkanik Laut Banda',
    author: 'Dr. Arifin Hidayatullah',
    authorRole: 'Kontributor Oseanografi Fisik',
    publishDate: '2026-10-21',
    topic: 'Biota Laut',
    readTimeMinutes: 6,
    coverImage: abyssTwilightImg,
    figureCaption: 'Zona afotik di bawah kedalaman 1.000 meter menyimpan rantai makanan berbasis kemosintesis tanpa cahaya matahari.',
    summary: 'Wahana selam tanpa awak (ROV) memetakan ekosistem unik di kedalaman lebih dari dua kilometer yang bergantung penuh pada mineral panas bumi dasar samudra.',
    paragraphs: [
      'Jauh di bawah batas jangkauan sinar matahari, ekspedisi riset gabungan di cekungan timur Laut Banda menurunkan wahana kendali jarak jauh (ROV) hingga kedalaman 2.340 meter. Kamera resolusi tinggi merekam formasi cerobong hidrotermal aktif yang dikelilingi ratusan moluska bercangkang tebal dan cacing tabung.',
      'Berbeda dengan ekosistem permukaan yang ditopang fotosintesis fitoplankton, kehidupan di sekitar ventilasi hidrotermal ditenagai oleh proses kemosintesis. Bakteri simbiotik mengubah senyawa hidrogen sulfida yang keluar dari kerak bumi menjadi energi kimia.',
      'Pengambilan sampel kecil menggunakan lengan robotik menunjukkan sedikitnya tiga spesies siput laut dalam yang belum pernah tercatat dalam katalog taksonomi sebelumnya. Enzim alami dari organisme ekstremofil seperti ini sangat berharga bagi riset bioteknologi medis.',
      'Penemuan ini memperkuat argumen kalangan ilmiah agar zona palung dan gunung api bawah laut Nusantara dipetakan secara tuntas sebelum potensi aktivitas ekstraktif laut dalam dibuka.',
    ],
    keyFacts: [
      'Lebih dari 80% dasar samudra bumi masih belum dipetakan dalam resolusi tinggi hingga saat ini.',
      'Mikroba hidrotermal mampu bertahan pada suhu cairan di atas 80°C di sekitar celah mineral.',
      'Seluruh rekaman video ekspedisi dibuka untuk keperluan pembelajaran biologi kelautan sekolah dan universitas.',
    ],
    initialLikes: 154,
    initialComments: [],
  },
  {
    id: 'traditional-sasi-coastal-fisheries-2026',
    title: 'Kearifan Adat Sasi Laut di Maluku Terbukti Pulihkan Biomassa Ikan Karang hingga Tiga Kali Lipat',
    author: 'Bagas Prakoso',
    authorRole: 'Editor Kebijakan Maritim',
    publishDate: '2026-10-16',
    topic: 'Kebijakan & Konservasi',
    readTimeMinutes: 5,
    coverImage: ecologicalReefImg,
    figureCaption: 'Pengelolaan buka-tutup wilayah tangkap berbasis komunitas memberi jeda alami bagi populasi ikan dan teripang untuk berkembang biak.',
    summary: 'Kombinasi aturan adat tutup-buka perairan dan pendataan partisipatif nelayan meningkatkan hasil tangkapan berkelanjutan sekaligus menjaga kesehatan ekosistem pesisir.',
    paragraphs: [
      'Jauh sebelum istilah kawasan konservasi perairan modern diperkenalkan dalam literatur internasional, masyarakat pesisir di Maluku dan Papua telah mempraktikkan tradisi Sasi—aturan adat yang melarang sementara pengambilan hasil laut tertentu demi memberi ruang pemulihan alami.',
      'Studi kolaboratif antara tetua adat, kelompok nelayan, dan ahli perikanan selama tiga tahun terakhir mendokumentasikan dampak terukur dari sistem ini. Pada wilayah perairan yang menerapkan penutupan Sasi selama 12 hingga 18 bulan, biomassa ikan kakap, kerapu, serta populasi teripang meningkat hingga tiga kali lipat.',
      'Ketika musim buka Sasi tiba secara terstruktur, ukuran rata-rata ikan yang ditangkap jauh lebih besar dan bernilai jual lebih tinggi di pasar. Nelayan tidak perlu melaut terlalu jauh sehingga biaya bahan bakar perahu dapat ditekan secara signifikan.',
      'Kementerian dan pemerintah daerah kini mulai mengintegrasikan peta wilayah Sasi adat ke dalam rencana zonasi wilayah pesisir resmi agar hukum adat mendapatkan pengakuan legal yang kuat dari tekanan armada luar.',
    ],
    keyFacts: [
      'Wilayah dengan Sasi aktif mencatat ukuran rata-rata kerapu dewasa 32% lebih besar dibanding zona tangkap bebas.',
      'Pendapatan musiman kelompok nelayan peserta program meningkat stabil tanpa merusak stok induk.',
      'Pendataan hasil tangkapan dilakukan mandiri menggunakan buku catatan dan aplikasi sederhana desa.',
    ],
    initialLikes: 229,
    initialComments: [],
  },
  {
    id: 'phytoplankton-carbon-sink-monitoring-2026',
    title: 'Citra Satelit Generasi Baru Pantau Ledakan Fitoplankton dan Daya Serap Karbon Samudra',
    author: 'Dimas Adiputra',
    authorRole: 'Koresponden Maritim & Pesisir',
    publishDate: '2026-10-12',
    topic: 'Iklim & Arus',
    readTimeMinutes: 5,
    coverImage: abyssTwilightImg,
    figureCaption: 'Pemantauan warna permukaan laut dari orbit bumi mengungkap sebaran konsentrasi klorofil fitoplankton lintas musim.',
    summary: 'Sensor hiperspektral antariksa memungkinkan ilmuwan membedakan jenis mikroalga laut dari luar angkasa guna menghitung pompa karbon biologis bumi secara lebih akurat.',
    paragraphs: [
      'Meskipun tak kasat mata oleh penyelam biasa, fitoplankton mikroskopis di lapisan atas laut menghasilkan lebih dari separuh oksigen yang dihirup makhluk darat sekaligus menyerap miliaran ton karbon dioksida setiap tahun.',
      'Kini dengan beroperasinya sensor optik hiperspektral generasi baru di orbit bumi, ilmuwan kelautan tidak lagi hanya melihat warna hijau klorofil secara umum. Satelit mampu membedakan kelompok diatom penyimpan karbon cepat dari spesies dinoflagelata yang berpotensi memicu pasang merah beracun.',
      'Kemampuan identifikasi dini ini sangat membantu wilayah perairan budidaya kerang dan tambak pesisir di Asia Tenggara dalam mengantisipasi penurunan kualitas air beberapa hari sebelum gejala tampak di permukaan.',
      'Data terbuka dari sistem pemantauan warna laut tersebut kini juga dipakai sebagai bahan ajar interaktif agar pelajar memahami betapa eratnya kaitan antara organisme mikroskopis samudra dan stabilitas iklim bumi.',
    ],
    keyFacts: [
      'Pompa karbon biologis laut memindahkan sekitar 10 gigaton karbon ke lapisan dalam setiap tahun.',
      'Sensor hiperspektral mampu membaca ratusan pita gelombang cahaya pantulan permukaan air laut.',
      'Peringatan dini ledakan alga berbahaya membantu melindungi tambak budidaya pesisir.',
    ],
    initialLikes: 131,
    initialComments: [],
  },
];
