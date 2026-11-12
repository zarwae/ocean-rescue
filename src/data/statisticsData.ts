export interface OceanStatItem {
  id: string;
  metricValue: number;
  metricPrefix?: string;
  metricSuffix: string;
  decimals?: number;
  label: string;
  description: string;
  source: string;
  year: string;
  contextUrl?: string;
}

export const OCEAN_STATISTICS: OceanStatItem[] = [
  {
    id: 'ocean-coverage',
    metricValue: 70.8,
    metricSuffix: '%',
    decimals: 1,
    label: 'Cakupan Permukaan Bumi',
    description: 'Samudra mencakup sekitar 361 juta kilometer persegi permukaan planet dan menampung 96,5% seluruh air di bumi.',
    source: 'NOAA (National Oceanic and Atmospheric Administration)',
    year: '2023',
  },
  {
    id: 'marine-species',
    metricValue: 242000,
    metricPrefix: '>',
    metricSuffix: '',
    decimals: 0,
    label: 'Spesies Laut Teridentifikasi',
    description: 'Spesies laut yang telah terdaftar secara taksonomi dalam basis data sains global, dengan perkiraan jutaan lainnya belum teridentifikasi.',
    source: 'WoRMS (World Register of Marine Species)',
    year: '2024',
  },
  {
    id: 'mpa-coverage',
    metricValue: 8.3,
    metricSuffix: '%',
    decimals: 1,
    label: 'Kawasan Konservasi Laut (MPA)',
    description: 'Cakupan kawasan konservasi perairan global saat ini dari target minimal 30% pada tahun 2030 (Kesepakatan Kunming-Montreal 30x30).',
    source: 'UNEP-WCMC & Protected Planet Report',
    year: '2024',
  },
  {
    id: 'plastic-annual-leakage',
    metricValue: 11.2,
    metricSuffix: ' Juta Ton',
    decimals: 1,
    label: 'Sampah Plastik Masuk Laut/Tahun',
    description: 'Perkiraan massa sampah plastik daratan yang bocor ke perairan laut setiap tahun jika pola konsumsi bisnis-seperti-biasa berlanjut.',
    source: 'UNEP (United Nations Environment Programme) Assessment',
    year: '2022',
  },
  {
    id: 'oxygen-contribution',
    metricValue: 50.0,
    metricPrefix: '≥',
    metricSuffix: '%',
    decimals: 0,
    label: 'Produksi Oksigen Atmosfer',
    description: 'Lebih dari separuh pasokan oksigen di atmosfer bumi dihasilkan oleh fitoplankton, alga, dan lamun laut melalui fotosintesis.',
    source: 'UNESCO-IOC (Intergovernmental Oceanographic Commission)',
    year: '2023',
  },
  {
    id: 'heat-absorption',
    metricValue: 90.0,
    metricPrefix: '>',
    metricSuffix: '%',
    decimals: 0,
    label: 'Penyerap Panas Ekstra Bumi',
    description: 'Persentase akumulasi panas berlebih dalam sistem iklim bumi yang diserap dan diredam oleh samudra sejak era pra-industri.',
    source: 'IPCC (Intergovernmental Panel on Climate Change) AR6',
    year: '2023',
  },
];
