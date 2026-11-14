export type OceanRegionId = 'all' | 'pacific' | 'atlantic' | 'indian' | 'southern' | 'arctic';

export type TrackerLayerId =
  | 'heatmap'
  | 'zones'
  | 'currents'
  | 'stations'
  | 'mpa';

export type ProvenanceKind = 'LIVE_OBSERVATION' | 'HISTORICAL_BASELINE' | 'SIMULATION';

export interface OceanRegion {
  id: OceanRegionId;
  name: string;
  indonesianName: string;
  centerLat: number;
  centerLng: number;
  cameraZoom: number; // 1 = wide global, >1 closer
  surfaceAreaMillionKm2: number;
  summary: string;
  dominantGyre: string;
  keyObservation: string;
}

export interface AccumulationZone {
  id: string;
  name: string;
  indonesianName: string;
  region: OceanRegionId;
  lat: number;
  lng: number;
  radiusDeg: number;
  // Strictly separated scientific units — never conflated
  surfaceConcentrationItemsPerKm2: number;
  estimatedSurfaceMassMetricTons: number;
  approxFootprintKm2: number;
  dominantPolymerMix: string;
  surveyPeriod: string;
  attribution: string;
  scientificNote: string;
}

export interface PlasticHeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  intensity: number; // 0.15 - 1.0 normalized historical density
  estimatedItemsPerKm2: number;
  region: OceanRegionId;
  label: string;
  surveyBasis: string;
}

export interface OceanCurrentCircuit {
  id: string;
  name: string;
  region: OceanRegionId;
  type: 'warm' | 'cold' | 'gyre';
  baselineVelocityMs: number;
  waypoints: [number, number][]; // [lat, lng]
  roleInPlasticTransport: string;
}

export interface ObservationStation {
  id: string;
  name: string;
  agency: string;
  region: OceanRegionId;
  lat: number;
  lng: number;
  baselineVelocityKmh: number;
  baselineDirectionDeg: number;
  baselineObservedYear: string;
  microplasticIndexNote: string;
  measurementMethod: string;
}

export interface LiveStationCurrent {
  stationId: string;
  velocityKmh: number;
  velocityMs: number;
  directionDeg: number;
  compassBearing: string;
  observedAtIso: string;
  provenance: 'LIVE_OBSERVATION' | 'HISTORICAL_BASELINE';
}

export interface MarineProtectedArea {
  id: string;
  name: string;
  region: OceanRegionId;
  lat: number;
  lng: number;
  protectedAreaKm2: number;
  yearEstablished: number;
  designation: string;
  keyProtectedSpecies: string;
  attribution: string;
}

export interface PlasticJourneyOrigin {
  id: string;
  name: string;
  countryOrCoast: string;
  region: OceanRegionId;
  startLat: number;
  startLng: number;
  targetZoneId: string;
  targetZoneName: string;
  waypoints: [number, number][];
  estimatedTransitMonths: string;
  primaryCurrentPath: string;
  ecologicalRiskSummary: string;
  methodologyNote: string;
}

export const OCEAN_REGIONS: OceanRegion[] = [
  {
    id: 'all',
    name: 'Global Ocean',
    indonesianName: 'Seluruh Samudra Dunia',
    centerLat: 12,
    centerLng: -160,
    cameraZoom: 1.0,
    surfaceAreaMillionKm2: 361.9,
    summary:
      'Satu kesatuan samudra yang saling terhubung melalui sirkulasi termohalin dan lima pusaran arus subtropis (gyre) utama bumi.',
    dominantGyre: '5 Subtropical Ocean Gyres',
    keyObservation:
      'Konsentrasi permukaan tertinggi terdeteksi pada zona konvergensi angin subtropis Lintang Tengah.',
  },
  {
    id: 'pacific',
    name: 'Pacific Ocean',
    indonesianName: 'Samudra Pasifik',
    centerLat: 24,
    centerLng: -145,
    cameraZoom: 1.35,
    surfaceAreaMillionKm2: 165.2,
    summary:
      'Cekungan samudra terbesar bumi yang menampung zona akumulasi North Pacific (GPGP) dan South Pacific Subtropical Gyre.',
    dominantGyre: 'North & South Pacific Gyres',
    keyObservation:
      'Survei trawl & udara menunjukkan dominasi jaring perikanan hanyut serta fragmen polietilena dan polipropilena.',
  },
  {
    id: 'atlantic',
    name: 'Atlantic Ocean',
    indonesianName: 'Samudra Atlantik',
    centerLat: 26,
    centerLng: -42,
    cameraZoom: 1.4,
    surfaceAreaMillionKm2: 106.5,
    summary:
      'Digerakkan oleh Gulf Stream dan Canary Current yang mengonsentrasikan mikroplastik terdispersi ke Laut Sargasso.',
    dominantGyre: 'North & South Atlantic Gyres',
    keyObservation:
      'Data jangka panjang SEA Education Association (1986–2020) mencatat fragmentasi plastik sekunder berukuran < 5 mm.',
  },
  {
    id: 'indian',
    name: 'Indian Ocean',
    indonesianName: 'Samudra Hindia',
    centerLat: -18,
    centerLng: 78,
    cameraZoom: 1.4,
    surfaceAreaMillionKm2: 70.6,
    summary:
      'Memiliki dinamika muson musiman yang membalikkan arah arus permukaan utara, sambil menyalurkan polutan ke pusaran selatan.',
    dominantGyre: 'Indian Ocean Subtropical Gyre',
    keyObservation:
      'Arus Lintas Indonesia (ARLINDO) menghubungkan perairan tropis Asia Tenggara menuju Samudra Hindia bagian timur.',
  },
  {
    id: 'southern',
    name: 'Southern Ocean',
    indonesianName: 'Samudra Selatan',
    centerLat: -58,
    centerLng: 20,
    cameraZoom: 1.35,
    surfaceAreaMillionKm2: 20.3,
    summary:
      'Dikelilingi Arus Sirkumpolar Antartika yang bertindak sebagai penghalang termal, namun tetap ditemukan mikroserat polimer di dekat stasiun riset.',
    dominantGyre: 'Antarctic Circumpolar Current',
    keyObservation:
      'Konsentrasi jauh lebih rendah dibanding lintang tengah, didominasi serat tekstil sintetis dan fragmen cat kapal.',
  },
  {
    id: 'arctic',
    name: 'Arctic Ocean',
    indonesianName: 'Samudra Arktik',
    centerLat: 76,
    centerLng: 10,
    cameraZoom: 1.45,
    surfaceAreaMillionKm2: 14.1,
    summary:
      'Bertindak sebagai zona buntu transportasi arus Atlantik Utara (North Atlantic Drift) yang membawa mikroplastik menuju es laut dan dasar Fram Strait.',
    dominantGyre: 'Beaufort Gyre & Transpolar Drift',
    keyObservation:
      'Studi Alfred Wegener Institute & GOOS menemukan ribuan partikel mikroplastik per liter terperangkap dalam inti es laut.',
  },
];

export const ACCUMULATION_ZONES: AccumulationZone[] = [
  {
    id: 'gpgp',
    name: 'North Pacific Subtropical Gyre (GPGP)',
    indonesianName: 'Zona Akumulasi Pasifik Utara (GPGP)',
    region: 'pacific',
    lat: 32.5,
    lng: -145.0,
    radiusDeg: 14,
    surfaceConcentrationItemsPerKm2: 678000,
    estimatedSurfaceMassMetricTons: 79000,
    approxFootprintKm2: 1600000,
    dominantPolymerMix: 'Polyethylene (PE), Polypropylene (PP), Ghost Fishing Nets',
    surveyPeriod: '2015–2022 Multi-Vessel & Aerial Baseline',
    attribution: 'Lebreton et al. (Scientific Reports), NOAA Marine Debris Program',
    scientificNote:
      'Bukan pulau sampah padat yang bisa dipijak; zona ini adalah perairan terbuka dengan konsentrasi mikroplastik terdispersi dan serpihan alat tangkap yang jauh lebih padat daripada rata-rata samudra.',
  },
  {
    id: 'nag',
    name: 'North Atlantic Subtropical Gyre',
    indonesianName: 'Zona Akumulasi Atlantik Utara',
    region: 'atlantic',
    lat: 29.0,
    lng: -54.0,
    radiusDeg: 12,
    surfaceConcentrationItemsPerKm2: 280000,
    estimatedSurfaceMassMetricTons: 56470,
    approxFootprintKm2: 1100000,
    dominantPolymerMix: 'Fragmented Microplastics (<5mm), Packaging Film',
    surveyPeriod: '1986–2020 Shipboard Neuston Net Baseline',
    attribution: 'Eriksen et al. (PLOS ONE), UNESCO-IOC, Copernicus Marine',
    scientificNote:
      'Terbentuk oleh konvergensi arus Gulf Stream dan North Equatorial Current di sekitar Laut Sargasso; sebagian besar partikel berada di bawah permukaan akibat pencampuran angin.',
  },
  {
    id: 'spg',
    name: 'South Pacific Subtropical Gyre',
    indonesianName: 'Zona Akumulasi Pasifik Selatan',
    region: 'pacific',
    lat: -28.0,
    lng: -118.0,
    radiusDeg: 11,
    surfaceConcentrationItemsPerKm2: 165000,
    estimatedSurfaceMassMetricTons: 21020,
    approxFootprintKm2: 950000,
    dominantPolymerMix: 'Weathered Micro-fragments, Maritime Rope',
    surveyPeriod: '2011–2021 Expedition Transect Baseline',
    attribution: 'Eriksen et al. (2014/2023), 5 Gyres Institute, UNEP',
    scientificNote:
      'Memiliki kepadatan numerik lebih rendah daripada belahan utara, tetapi fragmen berumur panjang terakumulasi perlahan menuju sisi timur cekungan di lepas pantai Cile.',
  },
  {
    id: 'sag',
    name: 'South Atlantic Subtropical Gyre',
    indonesianName: 'Zona Akumulasi Atlantik Selatan',
    region: 'atlantic',
    lat: -26.5,
    lng: -18.0,
    radiusDeg: 10,
    surfaceConcentrationItemsPerKm2: 112000,
    estimatedSurfaceMassMetricTons: 12780,
    approxFootprintKm2: 720000,
    dominantPolymerMix: 'Microplastic Pellets, Coastal Packaging Fragments',
    surveyPeriod: '2013–2021 South Atlantic Transect Baseline',
    attribution: 'Eriksen et al., GOOS South Atlantic Observations',
    scientificNote:
      'Sebagian limbah plastik yang keluar ke zona ini juga terbawa ke timur melampaui Tanjung Harapan menuju sistem sirkulasi Samudra Hindia.',
  },
  {
    id: 'iog',
    name: 'Indian Ocean Subtropical Gyre',
    indonesianName: 'Zona Akumulasi Samudra Hindia',
    region: 'indian',
    lat: -26.0,
    lng: 76.0,
    radiusDeg: 11.5,
    surfaceConcentrationItemsPerKm2: 218000,
    estimatedSurfaceMassMetricTons: 59130,
    approxFootprintKm2: 1050000,
    dominantPolymerMix: 'Riverine Film Plastics, Synthetic Fibers, Polypropylene',
    surveyPeriod: '2014–2022 Modeling & Surface Trawl Baseline',
    attribution: 'Eriksen et al., UNEP Indian Ocean Assessment, UNESCO-IOC',
    scientificNote:
      'Dinamika muson menyebabkan fluktuasi lebar pada perbatasan utara pusaran; data observasi langsung di Samudra Hindia bagian tengah masih menjadi prioritas riset global.',
  },
];

export const PLASTIC_HEATMAP_POINTS: PlasticHeatmapPoint[] = [
  // North Pacific Peak & Plumes
  { id: 'hp-1', lat: 33.5, lng: -145, intensity: 1.0, estimatedItemsPerKm2: 680000, region: 'pacific', label: 'Inti Konvergensi Pasifik Utara', surveyBasis: 'NOAA / Lebreton Surface Baseline' },
  { id: 'hp-2', lat: 31.0, lng: -135, intensity: 0.85, estimatedItemsPerKm2: 490000, region: 'pacific', label: 'Sisi Timur Pasifik Subtropis', surveyBasis: 'Historical Neuston Survey' },
  { id: 'hp-3', lat: 35.0, lng: 145, intensity: 0.72, estimatedItemsPerKm2: 340000, region: 'pacific', label: 'Koridor Arus Kuroshio Timur', surveyBasis: 'UNEP East Asia Baseline' },
  { id: 'hp-4', lat: 14.0, lng: 116, intensity: 0.78, estimatedItemsPerKm2: 390000, region: 'pacific', label: 'Cekungan Laut Tiongkok Selatan', surveyBasis: 'Regional Riverine Outflow Study' },
  { id: 'hp-5', lat: -7.5, lng: 115, intensity: 0.68, estimatedItemsPerKm2: 295000, region: 'indian', label: 'Selat Nusantara & ARLINDO', surveyBasis: 'Regional Coastal Observation' },
  // Indian Ocean
  { id: 'hp-6', lat: 14.0, lng: 86, intensity: 0.75, estimatedItemsPerKm2: 360000, region: 'indian', label: 'Teluk Benggala Utara', surveyBasis: 'UNEP Riverine Baseline' },
  { id: 'hp-7', lat: -26.0, lng: 76, intensity: 0.78, estimatedItemsPerKm2: 218000, region: 'indian', label: 'Pusaran Samudra Hindia Selatan', surveyBasis: 'Eriksen et al. Gyre Model' },
  { id: 'hp-8', lat: -24.0, lng: 58, intensity: 0.56, estimatedItemsPerKm2: 145000, region: 'indian', label: 'Cekungan Mascarene Barat', surveyBasis: 'Historical Transect' },
  // Atlantic
  { id: 'hp-9', lat: 29.0, lng: -54, intensity: 0.88, estimatedItemsPerKm2: 280000, region: 'atlantic', label: 'Laut Sargasso / Atlantik Utara', surveyBasis: 'SEA / NOAA Baseline' },
  { id: 'hp-10', lat: 37.5, lng: 14, intensity: 0.84, estimatedItemsPerKm2: 420000, region: 'atlantic', label: 'Cekungan Mediterania Tengah', surveyBasis: 'Copernicus Marine / UNEP MAP' },
  { id: 'hp-11', lat: 4.5, lng: 2, intensity: 0.64, estimatedItemsPerKm2: 210000, region: 'atlantic', label: 'Teluk Guinea Ekuatorial', surveyBasis: 'Coastal Survey Baseline' },
  { id: 'hp-12', lat: -26.5, lng: -18, intensity: 0.54, estimatedItemsPerKm2: 112000, region: 'atlantic', label: 'Pusaran Atlantik Selatan', surveyBasis: 'Eriksen et al. Baseline' },
  // South Pacific
  { id: 'hp-13', lat: -28.0, lng: -118, intensity: 0.60, estimatedItemsPerKm2: 165000, region: 'pacific', label: 'Pusaran Pasifik Selatan', surveyBasis: '5 Gyres Transect' },
  // Arctic & Southern (much lower concentration)
  { id: 'hp-14', lat: 76.5, lng: 4, intensity: 0.32, estimatedItemsPerKm2: 48000, region: 'arctic', label: 'Selat Fram (Gerbang Arktik)', surveyBasis: 'Alfred Wegener / GOOS Baseline' },
  { id: 'hp-15', lat: -58.0, lng: -62, intensity: 0.18, estimatedItemsPerKm2: 12000, region: 'southern', label: 'Lintasan Drake / Samudra Selatan', surveyBasis: 'Antarctic Survey Baseline' },
];

export const OCEAN_CURRENT_CIRCUITS: OceanCurrentCircuit[] = [
  {
    id: 'cur-kuroshio',
    name: 'Kuroshio & North Pacific Drift',
    region: 'pacific',
    type: 'warm',
    baselineVelocityMs: 1.15,
    waypoints: [
      [18, 124],
      [28, 132],
      [35, 144],
      [39, 170],
      [38, -160],
      [34, -135],
    ],
    roleInPlasticTransport:
      'Mengangkut puing plastik dari pesisir Asia Timur melintasi Pasifik Utara menuju zona konvergensi GPGP dalam 1,5–3 tahun.',
  },
  {
    id: 'cur-california',
    name: 'California & North Equatorial Current',
    region: 'pacific',
    type: 'cold',
    baselineVelocityMs: 0.48,
    waypoints: [
      [40, -126],
      [28, -120],
      [17, -118],
      [13, -148],
      [15, 175],
      [17, 138],
    ],
    roleInPlasticTransport:
      'Menutup sisi timur dan selatan sirkulasi Pasifik Utara sehingga partikel mengapung terperangkap di dalam pusaran.',
  },
  {
    id: 'cur-gulf',
    name: 'Gulf Stream & North Atlantic Gyre',
    region: 'atlantic',
    type: 'warm',
    baselineVelocityMs: 1.45,
    waypoints: [
      [26, -79],
      [35, -72],
      [41, -52],
      [39, -28],
      [29, -20],
      [20, -40],
      [21, -68],
    ],
    roleInPlasticTransport:
      'Membawa limbah pesisir Amerika Utara dan Eropa Barat berputar menuju pusat akumulasi Laut Sargasso dan bercabang ke Arktik.',
  },
  {
    id: 'cur-south-pacific',
    name: 'Humboldt & South Equatorial Pacific',
    region: 'pacific',
    type: 'cold',
    baselineVelocityMs: 0.55,
    waypoints: [
      [-40, -76],
      [-22, -74],
      [-8, -86],
      [-10, -125],
      [-26, -155],
      [-34, -125],
    ],
    roleInPlasticTransport:
      'Mengalir sepanjang pesisir Amerika Selatan menuju garis khatulistiwa sebelum berbelok masuk ke pusaran Pasifik Selatan.',
  },
  {
    id: 'cur-indian',
    name: 'Indonesian Throughflow & Agulhas Loop',
    region: 'indian',
    type: 'warm',
    baselineVelocityMs: 0.85,
    waypoints: [
      [-4, 118],
      [-10, 112],
      [-14, 88],
      [-26, 68],
      [-31, 34],
      [-36, 20],
    ],
    roleInPlasticTransport:
      'Menyalurkan aliran air dari Samudra Pasifik melintasi kepulauan Indonesia menuju pusaran selatan Samudra Hindia.',
  },
  {
    id: 'cur-acc',
    name: 'Antarctic Circumpolar Current',
    region: 'southern',
    type: 'cold',
    baselineVelocityMs: 0.72,
    waypoints: [
      [-56, -170],
      [-58, -110],
      [-58, -60],
      [-55, 0],
      [-56, 70],
      [-57, 145],
    ],
    roleInPlasticTransport:
      'Arus terkuat di dunia yang mengalir tanpa terputus mengelilingi Antartika, membatasi masuknya sebagian besar plastik permukaan lintang tengah.',
  },
  {
    id: 'cur-arctic',
    name: 'North Atlantic Drift to Fram Strait',
    region: 'arctic',
    type: 'cold',
    baselineVelocityMs: 0.34,
    waypoints: [
      [54, -16],
      [63, -2],
      [71, 8],
      [77, 6],
    ],
    roleInPlasticTransport:
      'Membawa fraksi mikroplastik dari Atlantik Utara hingga perairan sub-Arktik dan es laut di Selat Fram.',
  },
];

export const OBSERVATION_STATIONS: ObservationStation[] = [
  {
    id: 'st-aloha',
    name: 'Station ALOHA / North Pacific Buoy',
    agency: 'NOAA / University of Hawaii / GOOS',
    region: 'pacific',
    lat: 22.75,
    lng: -158.0,
    baselineVelocityKmh: 0.92,
    baselineDirectionDeg: 265,
    baselineObservedYear: '1988–Present Time Series',
    microplasticIndexNote: 'Transisi tepi selatan menuju zona akumulasi GPGP.',
    measurementMethod: 'Neuston surface net & autonomous mooring telemetry',
  },
  {
    id: 'st-gpgp-core',
    name: 'North Pacific Convergence Transect',
    agency: 'NOAA Marine Debris Program',
    region: 'pacific',
    lat: 33.0,
    lng: -144.0,
    baselineVelocityKmh: 0.45,
    baselineDirectionDeg: 215,
    baselineObservedYear: '2015–2023 Survey Series',
    microplasticIndexNote: 'Zona konvergensi dengan kecepatan arus rendah sehingga partikel bertahan lama.',
    measurementMethod: 'Manta trawl (333 μm mesh) & aerial ortho-mosaic survey',
  },
  {
    id: 'st-makassar',
    name: 'ARLINDO Makassar / Banda Node',
    agency: 'UNESCO-IOC / Regional GOOS',
    region: 'indian',
    lat: -5.5,
    lng: 118.5,
    baselineVelocityKmh: 1.65,
    baselineDirectionDeg: 198,
    baselineObservedYear: '2019–2024 Regional Baseline',
    microplasticIndexNote: 'Koridor aliran utama antar-samudra dari Pasifik ke Hindia.',
    measurementMethod: 'ADCP current profiler & coastal visual transect',
  },
  {
    id: 'st-bengal',
    name: 'Bay of Bengal Pelagic Observatory',
    agency: 'GOOS / UNEP Regional Seas',
    region: 'indian',
    lat: 12.5,
    lng: 86.5,
    baselineVelocityKmh: 1.18,
    baselineDirectionDeg: 220,
    baselineObservedYear: '2020–2024 Monsoon Baseline',
    microplasticIndexNote: 'Dipengaruhi limpasan sungai besar saat puncak musim hujan muson.',
    measurementMethod: 'RAMA buoy array & river plume water sampling',
  },
  {
    id: 'st-sargasso',
    name: 'BATS / Sargasso Sea Station',
    agency: 'NOAA / SEA / Copernicus Marine',
    region: 'atlantic',
    lat: 31.67,
    lng: -64.17,
    baselineVelocityKmh: 0.68,
    baselineDirectionDeg: 145,
    baselineObservedYear: '1986–2023 Long-Term Series',
    microplasticIndexNote: 'Salah satu rekor pengamatan mikroplastik permukaan terpanjang di dunia.',
    measurementMethod: 'Monthly pelagic surface plankton & neuston tow',
  },
  {
    id: 'st-med',
    name: 'Central Mediterranean Sentinel Node',
    agency: 'Copernicus Marine / UNEP MAP',
    region: 'atlantic',
    lat: 37.5,
    lng: 14.5,
    baselineVelocityKmh: 0.84,
    baselineDirectionDeg: 112,
    baselineObservedYear: '2019–2024 Basin Assessment',
    microplasticIndexNote: 'Cekungan semi-tertutup dengan kepadatan mikroplastik pantai tinggi.',
    measurementMethod: 'Satellite altimetry + coastal microplastic manta net',
  },
  {
    id: 'st-galapagos',
    name: 'Galápagos Equatorial Upwelling Buoy',
    agency: 'NOAA Tropical Atmosphere Ocean',
    region: 'pacific',
    lat: -1.5,
    lng: -91.0,
    baselineVelocityKmh: 1.48,
    baselineDirectionDeg: 278,
    baselineObservedYear: '2018–2024 Sanctuary Watch',
    microplasticIndexNote: 'Arus Humboldt membawa puing pesisir Amerika Selatan mendekati cagar laut.',
    measurementMethod: 'TAO mooring sensors & shoreline debris audit',
  },
  {
    id: 'st-agulhas',
    name: 'Cape Basin / Agulhas Retroflection',
    agency: 'GOOS / South Atlantic Network',
    region: 'atlantic',
    lat: -36.5,
    lng: 17.5,
    baselineVelocityKmh: 1.92,
    baselineDirectionDeg: 295,
    baselineObservedYear: '2020–2024 Eddy Corridor',
    microplasticIndexNote: 'Pusaran Agulhas Rings memindahkan air dan mikropartikel dari Hindia ke Atlantik.',
    measurementMethod: 'Drifter buoys & NASA Earthdata ocean color tracking',
  },
  {
    id: 'st-fram',
    name: 'Hausgarten / Fram Strait Arctic Node',
    agency: 'GOOS / Alfred Wegener / UNESCO-IOC',
    region: 'arctic',
    lat: 77.2,
    lng: 4.5,
    baselineVelocityKmh: 0.42,
    baselineDirectionDeg: 15,
    baselineObservedYear: '2016–2023 Arctic Series',
    microplasticIndexNote: 'Mikroplastik terangkut ke utara melalui cabang akhir arus Atlantik.',
    measurementMethod: 'Deep-sea sediment traps & sea-ice core micro-spectroscopy',
  },
  {
    id: 'st-drake',
    name: 'Drake Passage / Southern Boundary',
    agency: 'GOOS / SOOS Southern Ocean',
    region: 'southern',
    lat: -58.5,
    lng: -62.0,
    baselineVelocityKmh: 1.75,
    baselineDirectionDeg: 85,
    baselineObservedYear: '2018–2023 Polar Survey',
    microplasticIndexNote: 'Arus Sirkumpolar kuat; fokus pemantauan serat sintetis dan mikroplastik pesisir.',
    measurementMethod: 'Underway research vessel filtration (100 μm)',
  },
];

export const MARINE_PROTECTED_AREAS: MarineProtectedArea[] = [
  {
    id: 'mpa-papahan',
    name: 'Papahānaumokuākea Marine National Monument',
    region: 'pacific',
    lat: 25.7,
    lng: -171.7,
    protectedAreaKm2: 1510000,
    yearEstablished: 2006,
    designation: 'UNESCO World Heritage & NOAA Marine Monument',
    keyProtectedSpecies: 'Anjing Laut Biarawan Hawaii, Penyu Hijau, Albatros Laysan',
    attribution: 'NOAA / Protected Planet (UNEP-WCMC)',
  },
  {
    id: 'mpa-rajaampat',
    name: 'Kawasan Konservasi Raja Ampat (Coral Triangle)',
    region: 'pacific',
    lat: -0.5,
    lng: 130.5,
    protectedAreaKm2: 20000,
    yearEstablished: 2007,
    designation: 'Network of Marine Protected Areas — Episentrum Terumbu Dunia',
    keyProtectedSpecies: 'Pari Manta Karang, Hiu Berjalan, 75% Spesies Karang Dunia',
    attribution: 'UNEP-WCMC / Konservasi Perairan Indonesia',
  },
  {
    id: 'mpa-gbr',
    name: 'Great Barrier Reef Marine Park',
    region: 'pacific',
    lat: -18.2,
    lng: 147.7,
    protectedAreaKm2: 344400,
    yearEstablished: 1975,
    designation: 'UNESCO World Heritage Reef Sanctuary',
    keyProtectedSpecies: 'Dugong, Penyu Hijau, Hiu Karang, 1.500+ Spesies Ikan',
    attribution: 'GBRMPA / UNEP-WCMC',
  },
  {
    id: 'mpa-galapagos',
    name: 'Galápagos Marine Reserve & Hermandad Corridor',
    region: 'pacific',
    lat: -0.8,
    lng: -90.5,
    protectedAreaKm2: 198000,
    yearEstablished: 1998,
    designation: 'UNESCO Biosphere & Marine Reserve',
    keyProtectedSpecies: 'Iguana Laut, Hiu Martil, Hiu Paus, Penguin Galápagos',
    attribution: 'UNESCO-IOC / Protected Planet',
  },
  {
    id: 'mpa-chagos',
    name: 'Chagos / Central Indian Ocean Sanctuary',
    region: 'indian',
    lat: -6.3,
    lng: 71.8,
    protectedAreaKm2: 640000,
    yearEstablished: 2010,
    designation: 'Large Pelagic & Atoll No-Take Reserve',
    keyProtectedSpecies: 'Penyu Sisik, Tuna Sirip Kuning, Karang Atol Murni',
    attribution: 'Protected Planet / UNEP-WCMC',
  },
  {
    id: 'mpa-sargasso',
    name: 'Sargasso Sea Conservation Area',
    region: 'atlantic',
    lat: 28.0,
    lng: -62.0,
    protectedAreaKm2: 4100000,
    yearEstablished: 2014,
    designation: 'High Seas Ecological Stewardship Initiative',
    keyProtectedSpecies: 'Sidat Eropa & Amerika (tempat pemijahan), Penyu Muda',
    attribution: 'Sargasso Sea Commission / UNESCO-IOC',
  },
  {
    id: 'mpa-ross',
    name: 'Ross Sea Region Marine Protected Area',
    region: 'southern',
    lat: -74.0,
    lng: 175.0,
    protectedAreaKm2: 1550000,
    yearEstablished: 2017,
    designation: 'CCAMLR High-Seas Polar Sanctuary',
    keyProtectedSpecies: 'Penguin Kaisar, Paus Minke Antartika, Krill & Toothfish',
    attribution: 'CCAMLR / Protected Planet',
  },
];

export const PLASTIC_JOURNEY_ORIGINS: PlasticJourneyOrigin[] = [
  {
    id: 'origin-java',
    name: 'Muara Sungai Jawa & Selat Sunda',
    countryOrCoast: 'Indonesia (Laut Jawa)',
    region: 'indian',
    startLat: -6.0,
    startLng: 106.5,
    targetZoneId: 'iog',
    targetZoneName: 'Zona Akumulasi Samudra Hindia',
    waypoints: [
      [-6.0, 106.5],
      [-7.2, 104.5],
      [-12.0, 96.0],
      [-19.5, 86.0],
      [-26.0, 76.0],
    ],
    estimatedTransitMonths: '14–28 bulan (model konseptual)',
    primaryCurrentPath: 'Arus Khatulistiwa Selatan Hindia (South Equatorial Current)',
    ecologicalRiskSummary:
      'Berpotensi melewati jalur migrasi penyu belimbing dan area makan tuna di Samudra Hindia timur sebelum terfragmentasi oleh UV menjadi mikroplastik.',
    methodologyNote:
      'SIMULATION: Jalur melengkung ini mengilustrasikan arah transport arus utama berdasarkan klimatologi permukaan laut dan tidak memprediksi posisi partikel tunggal di dunia nyata.',
  },
  {
    id: 'origin-eastasia',
    name: 'Estuari Sungai Yangtze & Laut Tiongkok Timur',
    countryOrCoast: 'Asia Timur',
    region: 'pacific',
    startLat: 31.2,
    startLng: 122.2,
    targetZoneId: 'gpgp',
    targetZoneName: 'North Pacific Subtropical Gyre (GPGP)',
    waypoints: [
      [31.2, 122.2],
      [33.5, 136.0],
      [37.0, 158.0],
      [36.5, -172.0],
      [32.5, -145.0],
    ],
    estimatedTransitMonths: '18–36 bulan (model konseptual)',
    primaryCurrentPath: 'Arus Kuroshio → North Pacific Drift',
    ecologicalRiskSummary:
      'Polimer ringan (PE/PP) terbawa arus Kuroshio berkecepatan tinggi melintasi Pasifik utara, terpapar radiasi UV dan berisiko ditelan burung albatros maupun ikan pelagik.',
    methodologyNote:
      'SIMULATION: Ilustrasi konseptual lintasan arus Kuroshio berdasarkan model transport permukaan Lebreton et al.',
  },
  {
    id: 'origin-california',
    name: 'Pesisir California Selatan',
    countryOrCoast: 'Amerika Utara Bagian Barat',
    region: 'pacific',
    startLat: 33.7,
    startLng: -118.4,
    targetZoneId: 'gpgp',
    targetZoneName: 'North Pacific Subtropical Gyre (GPGP)',
    waypoints: [
      [33.7, -118.4],
      [30.0, -124.5],
      [27.0, -133.0],
      [30.5, -141.0],
      [32.5, -145.0],
    ],
    estimatedTransitMonths: '8–16 bulan (model konseptual)',
    primaryCurrentPath: 'Arus California → Konvergensi Pasifik Utara',
    ecologicalRiskSummary:
      'Partikel bergerak ke selatan bersama Arus California lalu berbelok ke barat ke zona tekanan tinggi subtropis di antara Hawaii dan California.',
    methodologyNote:
      'SIMULATION: Jalur konseptual ilustratif berdasarkan pola umum angin pasat dan arus permukaan.',
  },
  {
    id: 'origin-northsea',
    name: 'Muara Rhine–Meuse & Laut Utara',
    countryOrCoast: 'Eropa Barat',
    region: 'atlantic',
    startLat: 51.9,
    startLng: 3.9,
    targetZoneId: 'nag',
    targetZoneName: 'North Atlantic Subtropical Gyre',
    waypoints: [
      [51.9, 3.9],
      [48.5, -6.0],
      [39.0, -14.5],
      [29.5, -24.0],
      [29.0, -54.0],
    ],
    estimatedTransitMonths: '20–40 bulan (model konseptual)',
    primaryCurrentPath: 'Arus Canary → North Equatorial Current → Laut Sargasso',
    ecologicalRiskSummary:
      'Sebagian fraksi terbawa ke utara menuju Selat Fram Arktik, sementara sisanya turun mengikuti Arus Canary menuju Laut Sargasso yang menjadi pembibitan sidat dan penyu muda.',
    methodologyNote:
      'SIMULATION: Rute konseptual; dinamika pasang surut Selat Inggris menyebabkan retensi pantai yang tinggi sebelum masuk laut lepas.',
  },
  {
    id: 'origin-brazil',
    name: 'Teluk Santos & Pesisir Tenggara Brasil',
    countryOrCoast: 'Amerika Selatan',
    region: 'atlantic',
    startLat: -24.0,
    startLng: -46.2,
    targetZoneId: 'sag',
    targetZoneName: 'South Atlantic Subtropical Gyre',
    waypoints: [
      [-24.0, -46.2],
      [-31.0, -44.0],
      [-34.0, -32.0],
      [-29.5, -23.0],
      [-26.5, -18.0],
    ],
    estimatedTransitMonths: '12–24 bulan (model konseptual)',
    primaryCurrentPath: 'Arus Brasil → Arus Atlantik Selatan',
    ecologicalRiskSummary:
      'Limbah polimer dari daerah urban pesisir terdorong ke arah tenggara sebelum berputar memasuki zona konvergensi tengah Atlantik Selatan.',
    methodologyNote:
      'SIMULATION: Model ilustratif berdasarkan sirkulasi siklonik terbalik belahan bumi selatan.',
  },
  {
    id: 'origin-chile',
    name: 'Pesisir Tengah Cile (Valparaíso)',
    countryOrCoast: 'Amerika Selatan Bagian Barat',
    region: 'pacific',
    startLat: -33.0,
    startLng: -71.7,
    targetZoneId: 'spg',
    targetZoneName: 'South Pacific Subtropical Gyre',
    waypoints: [
      [-33.0, -71.7],
      [-24.0, -76.0],
      [-16.0, -86.0],
      [-22.0, -104.0],
      [-28.0, -118.0],
    ],
    estimatedTransitMonths: '15–30 bulan (model konseptual)',
    primaryCurrentPath: 'Arus Humboldt → South Pacific Gyre',
    ecologicalRiskSummary:
      'Arus dingin Humboldt mengangkut puing ke utara menuju perairan produktif Peru-Galápagos sebelum berbelok ke barat ke pusaran Pasifik Selatan.',
    methodologyNote:
      'SIMULATION: Model lintasan ilustratif; upwelling pantai memengaruhi kedalaman suspensi plastik.',
  },
];

export function degreesToCompass(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  const idx = Math.round(normalized / 45) % 8;
  return dirs[idx];
}

export function kmhToMs(kmh: number): number {
  return Number((kmh / 3.6).toFixed(2));
}

export function buildBaselineStationCurrents(): Record<string, LiveStationCurrent> {
  const result: Record<string, LiveStationCurrent> = {};
  for (const st of OBSERVATION_STATIONS) {
    result[st.id] = {
      stationId: st.id,
      velocityKmh: st.baselineVelocityKmh,
      velocityMs: kmhToMs(st.baselineVelocityKmh),
      directionDeg: st.baselineDirectionDeg,
      compassBearing: degreesToCompass(st.baselineDirectionDeg),
      observedAtIso: st.baselineObservedYear,
      provenance: 'HISTORICAL_BASELINE',
    };
  }
  return result;
}

/**
 * Queries Open-Meteo Marine Weather API in a single batched coordinate request
 * to obtain live ocean_current_velocity and ocean_current_direction for all
 * observation stations. Gracefully falls back to documented baselines if offline.
 */
export async function fetchLiveOceanCurrents(
  signal?: AbortSignal
): Promise<{
  currents: Record<string, LiveStationCurrent>;
  isLive: boolean;
  fetchedAt: string;
}> {
  const baseline = buildBaselineStationCurrents();

  try {
    const lats = OBSERVATION_STATIONS.map((s) => s.lat.toFixed(2)).join(',');
    const lngs = OBSERVATION_STATIONS.map((s) => s.lng.toFixed(2)).join(',');
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}&current=ocean_current_velocity,ocean_current_direction&timezone=UTC`;

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo Marine HTTP ${response.status}`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : [payload];

    const updated: Record<string, LiveStationCurrent> = { ...baseline };
    let liveCount = 0;

    OBSERVATION_STATIONS.forEach((st, idx) => {
      const entry = items[idx];
      const currentBlock = entry?.current;
      const vel = currentBlock?.ocean_current_velocity;
      const dir = currentBlock?.ocean_current_direction;

      if (typeof vel === 'number' && !Number.isNaN(vel) && typeof dir === 'number' && !Number.isNaN(dir)) {
        liveCount += 1;
        updated[st.id] = {
          stationId: st.id,
          velocityKmh: Number(vel.toFixed(2)),
          velocityMs: kmhToMs(vel),
          directionDeg: Math.round(dir),
          compassBearing: degreesToCompass(dir),
          observedAtIso: typeof currentBlock.time === 'string' ? `${currentBlock.time} UTC` : 'UTC Live',
          provenance: 'LIVE_OBSERVATION',
        };
      }
    });

    if (liveCount === 0) {
      return { currents: baseline, isLive: false, fetchedAt: 'Baseline Klimatologi' };
    }

    return {
      currents: updated,
      isLive: true,
      fetchedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    };
  } catch {
    return {
      currents: baseline,
      isLive: false,
      fetchedAt: 'Baseline Klimatologi',
    };
  }
}
