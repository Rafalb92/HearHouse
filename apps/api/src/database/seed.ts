import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import slugify from 'slugify';

import { User } from '../users/entities/user.entity';
import { Account } from '../users/entities/account.entity';
import { Session } from '../users/entities/session.entity';
import { Verification } from '../users/entities/verification.entity';
import { CustomerProfile } from '@/customers/entities/customer-profile.entity';
import { Address } from '@/customers/entities/address.entity';
import {
  Product,
  ProductCategory,
  ProductStatus,
} from '../products/entities/product.entity';
import {
  ProductVariant,
  VariantFinish,
} from '../products/entities/product-variant.entity';
import { ProductImage } from '../products/entities/product-image.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Account,
    Session,
    Verification,
    CustomerProfile,
    Address,
    Product,
    ProductVariant,
    ProductImage,
  ],
  synchronize: false,
  logging: false,
});

// ─── Seed data ────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    slug: 'sony-wh-1000xm5',
    brand: 'Sony',
    model: 'WH-1000XM5',
    name: 'Sony WH-1000XM5',
    category: ProductCategory.OVER_EAR,
    shortDescription:
      'Flagowe nauszne z bardzo mocną aktywną redukcją hałasu i świetnym trybem rozmów.',
    description:
      'Nauszne słuchawki bezprzewodowe z aktywną redukcją hałasu, multipoint, wsparciem dla kodeków wysokiej jakości i bardzo dobrą jakością mikrofonów.',
    currency: 'PLN',
    basePriceCents: 169900,
    tags: ['anc', 'travel', 'multipoint', 'premium', 'wireless'],
    specs: {
      formFactor: 'over-ear',
      driver: { type: 'dynamic', sizeMm: 30 },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.2',
          codecs: ['SBC', 'AAC', 'LDAC'],
          multipoint: true,
        },
      },
      noiseCancellation: {
        active: true,
        transparencyMode: true,
        windReduction: true,
      },
      battery: {
        upToHours: 30,
        upToHoursWithAnc: 30,
        charging: {
          usb: 'USB-C',
          fastCharge: '3 min -> ~3 h',
          wireless: false,
        },
      },
      microphones: { count: 8, noiseReductionForCalls: true },
      controls: { type: ['touch', 'buttons'], voiceAssistant: true },
      weightGrams: 250,
      waterResistance: { rating: null },
      includedInBox: ['case', 'usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2022,
    },
    variants: [
      {
        sku: 'SONY-XM5-BLK',
        colorName: 'Black',
        colorHex: '#111111',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'synthetic leather' },
        priceDeltaCents: 0,
        stock: 25,
      },
      {
        sku: 'SONY-XM5-SIL',
        colorName: 'Silver',
        colorHex: '#C8C8C8',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'synthetic leather' },
        priceDeltaCents: 0,
        stock: 18,
      },
    ],
  },
  {
    slug: 'bose-quietcomfort-ultra-headphones',
    brand: 'Bose',
    model: 'QuietComfort Ultra Headphones',
    name: 'Bose QuietComfort Ultra Headphones',
    category: ProductCategory.OVER_EAR,
    shortDescription:
      'Bardzo komfortowe nauszne z mocną redukcją hałasu i profilem do długich odsłuchów.',
    description:
      'Nauszne bezprzewodowe z bardzo wygodnym pałąkiem i poduszkami. Świetne do podróży i pracy.',
    currency: 'PLN',
    basePriceCents: 189900,
    tags: ['anc', 'comfort', 'premium', 'wireless'],
    specs: {
      formFactor: 'over-ear',
      driver: { type: 'dynamic', sizeMm: null },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.3',
          codecs: ['SBC', 'AAC'],
          multipoint: true,
        },
      },
      noiseCancellation: { active: true, transparencyMode: true },
      battery: {
        upToHours: 24,
        upToHoursWithAnc: 24,
        charging: {
          usb: 'USB-C',
          fastCharge: '15 min -> ~2.5 h',
          wireless: false,
        },
      },
      microphones: { count: 6, noiseReductionForCalls: true },
      controls: { type: ['buttons'], voiceAssistant: true },
      weightGrams: 250,
      waterResistance: { rating: null },
      includedInBox: ['case', 'usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2023,
    },
    variants: [
      {
        sku: 'BOSE-QCU-BLK',
        colorName: 'Black',
        colorHex: '#0F0F10',
        finish: 'matte',
        materials: {
          earpads: 'protein leather',
          headband: 'synthetic leather',
        },
        priceDeltaCents: 0,
        stock: 14,
      },
      {
        sku: 'BOSE-QCU-WHT',
        colorName: 'White Smoke',
        colorHex: '#E9E9E7',
        finish: 'matte',
        materials: {
          earpads: 'protein leather',
          headband: 'synthetic leather',
        },
        priceDeltaCents: 0,
        stock: 9,
      },
    ],
  },
  {
    slug: 'sennheiser-momentum-4-wireless',
    brand: 'Sennheiser',
    model: 'MOMENTUM 4 Wireless',
    name: 'Sennheiser MOMENTUM 4 Wireless',
    category: ProductCategory.OVER_EAR,
    shortDescription:
      'Długi czas pracy baterii i brzmienie nastawione na przyjemny odsłuch.',
    description:
      'Nauszne bezprzewodowe z długim czasem pracy, aktywną redukcją hałasu i solidnym zestawem kodeków.',
    currency: 'PLN',
    basePriceCents: 129900,
    tags: ['anc', 'battery', 'wireless', 'hi-res'],
    specs: {
      formFactor: 'over-ear',
      driver: { type: 'dynamic', sizeMm: 42 },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.2',
          codecs: ['SBC', 'AAC', 'aptX', 'aptX Adaptive'],
          multipoint: true,
        },
      },
      noiseCancellation: { active: true, transparencyMode: true },
      battery: {
        upToHours: 60,
        upToHoursWithAnc: 60,
        charging: {
          usb: 'USB-C',
          fastCharge: '10 min -> ~6 h',
          wireless: false,
        },
      },
      microphones: { count: 4, noiseReductionForCalls: true },
      controls: { type: ['touch'], voiceAssistant: true },
      weightGrams: 293,
      waterResistance: { rating: null },
      includedInBox: ['case', 'usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2022,
    },
    variants: [
      {
        sku: 'SENN-M4-BLK',
        colorName: 'Black',
        colorHex: '#121212',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'synthetic leather' },
        priceDeltaCents: 0,
        stock: 20,
      },
      {
        sku: 'SENN-M4-WHT',
        colorName: 'White',
        colorHex: '#F2F2F2',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'synthetic leather' },
        priceDeltaCents: 0,
        stock: 7,
      },
    ],
  },
  {
    slug: 'audio-technica-ath-m50x',
    brand: 'Audio-Technica',
    model: 'ATH-M50x',
    name: 'Audio-Technica ATH-M50x',
    category: ProductCategory.OVER_EAR,
    shortDescription:
      'Klasyczny wybór przewodowy do pracy i odsłuchu, mocny bas i dobra izolacja pasywna.',
    description:
      'Przewodowe nauszne o studyjnej genezie. Solidna konstrukcja, wymienne kable i brzmienie.',
    currency: 'PLN',
    basePriceCents: 69900,
    tags: ['wired', 'studio', 'monitoring'],
    specs: {
      formFactor: 'over-ear',
      driver: { type: 'dynamic', sizeMm: 45 },
      connectivity: {
        wired: {
          jack: '3.5mm',
          adapter: '6.35mm',
          detachableCable: true,
          cableInBox: true,
        },
        wireless: null,
      },
      noiseCancellation: { active: false, transparencyMode: false },
      battery: null,
      microphones: { count: 0, noiseReductionForCalls: false },
      controls: { type: ['none'], voiceAssistant: false },
      weightGrams: 285,
      waterResistance: { rating: null },
      includedInBox: ['3 detachable cables', '6.35mm adapter', 'pouch'],
      warrantyMonths: 24,
      releaseYear: 2014,
    },
    variants: [
      {
        sku: 'ATM50X-BLK',
        colorName: 'Black',
        colorHex: '#101010',
        finish: 'matte',
        materials: {
          earpads: 'synthetic leather',
          headband: 'synthetic leather',
        },
        priceDeltaCents: 0,
        stock: 30,
      },
      {
        sku: 'ATM50X-BLUE',
        colorName: 'Deep Blue',
        colorHex: '#0E2A5A',
        finish: 'matte',
        materials: {
          earpads: 'synthetic leather',
          headband: 'synthetic leather',
        },
        priceDeltaCents: 2000,
        stock: 10,
      },
    ],
  },
  {
    slug: 'marshall-major-iv',
    brand: 'Marshall',
    model: 'Major IV',
    name: 'Marshall Major IV',
    category: ProductCategory.ON_EAR,
    shortDescription:
      'Nauszne na ucho, styl retro, długi czas pracy i prosta obsługa.',
    description:
      'Kompaktowe nauszne na ucho, lekkie i wygodne do miasta. Długi czas pracy na baterii.',
    currency: 'PLN',
    basePriceCents: 54900,
    tags: ['on-ear', 'wireless', 'street'],
    specs: {
      formFactor: 'on-ear',
      driver: { type: 'dynamic', sizeMm: 40 },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.0',
          codecs: ['SBC'],
          multipoint: false,
        },
      },
      noiseCancellation: { active: false, transparencyMode: false },
      battery: {
        upToHours: 80,
        upToHoursWithAnc: null,
        charging: {
          usb: 'USB-C',
          fastCharge: '15 min -> ~15 h',
          wireless: false,
        },
      },
      microphones: { count: 1, noiseReductionForCalls: false },
      controls: { type: ['joystick'], voiceAssistant: true },
      weightGrams: 165,
      waterResistance: { rating: null },
      includedInBox: ['usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2020,
    },
    variants: [
      {
        sku: 'MRSH-MJ4-BLK',
        colorName: 'Black',
        colorHex: '#1A1A1A',
        finish: 'matte',
        materials: { earpads: 'vinyl', headband: 'vinyl' },
        priceDeltaCents: 0,
        stock: 22,
      },
    ],
  },
  {
    slug: 'apple-airpods-pro-2-usb-c',
    brand: 'Apple',
    model: 'AirPods Pro (2nd gen, USB-C)',
    name: 'Apple AirPods Pro (2nd gen, USB-C)',
    category: ProductCategory.IN_EAR,
    shortDescription:
      'Dokanałowe z aktywną redukcją hałasu, wygodne do codziennego użycia.',
    description:
      'Dokanałowe true wireless stereo z aktywną redukcją hałasu, trybem kontaktu i etui ładującym.',
    currency: 'PLN',
    basePriceCents: 119900,
    tags: ['tws', 'anc', 'calls', 'portable'],
    specs: {
      formFactor: 'in-ear canal',
      driver: { type: 'dynamic', sizeMm: null },
      connectivity: {
        wired: null,
        wireless: {
          bluetoothVersion: '5.x',
          codecs: ['AAC'],
          multipoint: false,
        },
      },
      noiseCancellation: { active: true, transparencyMode: true },
      battery: {
        upToHours: 6,
        caseTotalHours: 30,
        charging: { usb: 'USB-C', fastCharge: '5 min -> ~1 h', wireless: true },
      },
      microphones: { count: 4, noiseReductionForCalls: true },
      controls: { type: ['stem-press', 'touch'], voiceAssistant: true },
      weightGrams: 5.3,
      waterResistance: { rating: 'IPX4' },
      includedInBox: ['charging case', 'usb-c cable', 'silicone tips (S/M/L)'],
      warrantyMonths: 24,
      releaseYear: 2023,
    },
    variants: [
      {
        sku: 'AP-PRO2-WHT',
        colorName: 'White',
        colorHex: '#F5F5F5',
        finish: 'glossy',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 40,
      },
    ],
  },
  {
    slug: 'samsung-galaxy-buds2-pro',
    brand: 'Samsung',
    model: 'Galaxy Buds2 Pro',
    name: 'Samsung Galaxy Buds2 Pro',
    category: ProductCategory.IN_EAR,
    shortDescription:
      'Dokanałowe true wireless stereo z aktywną redukcją hałasu i kompaktowym etui.',
    description:
      'Kompaktowe dokanałowe true wireless stereo z aktywną redukcją hałasu i trybem kontaktu.',
    currency: 'PLN',
    basePriceCents: 79900,
    tags: ['tws', 'anc', 'portable'],
    specs: {
      formFactor: 'in-ear canal',
      driver: { type: 'dynamic', sizeMm: null },
      connectivity: {
        wired: null,
        wireless: {
          bluetoothVersion: '5.3',
          codecs: ['SBC', 'AAC'],
          multipoint: false,
        },
      },
      noiseCancellation: { active: true, transparencyMode: true },
      battery: {
        upToHours: 5,
        caseTotalHours: 18,
        charging: { usb: 'USB-C', fastCharge: '5 min -> ~1 h', wireless: true },
      },
      microphones: { count: 6, noiseReductionForCalls: true },
      controls: { type: ['touch'], voiceAssistant: true },
      weightGrams: 5.5,
      waterResistance: { rating: 'IPX7' },
      includedInBox: ['charging case', 'usb-c cable', 'silicone tips (S/M/L)'],
      warrantyMonths: 24,
      releaseYear: 2022,
    },
    variants: [
      {
        sku: 'BUDS2P-GRY',
        colorName: 'Graphite',
        colorHex: '#3A3A3A',
        finish: 'matte',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 28,
      },
      {
        sku: 'BUDS2P-LAV',
        colorName: 'Lavender',
        colorHex: '#B9A6D6',
        finish: 'matte',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 12,
      },
    ],
  },
  {
    slug: 'shure-se215',
    brand: 'Shure',
    model: 'SE215',
    name: 'Shure SE215',
    category: ProductCategory.IN_EAR,
    shortDescription:
      'Dokanałowe przewodowe, mocna izolacja pasywna i konstrukcja pod odsłuch sceniczny.',
    description:
      'Przewodowe dokanałowe z odpinanym kablem. Bardzo dobra izolacja pasywna.',
    currency: 'PLN',
    basePriceCents: 49900,
    tags: ['wired', 'iem', 'stage', 'detachable-cable'],
    specs: {
      formFactor: 'in-ear canal',
      driver: { type: 'dynamic', sizeMm: null },
      connectivity: {
        wired: { connector: 'MMCX', jack: '3.5mm', detachableCable: true },
        wireless: null,
      },
      noiseCancellation: { active: false, transparencyMode: false },
      battery: null,
      microphones: { count: 0, noiseReductionForCalls: false },
      controls: { type: ['none'], voiceAssistant: false },
      weightGrams: 30,
      waterResistance: { rating: null },
      includedInBox: ['carry case', 'ear tips set', 'detachable cable'],
      warrantyMonths: 24,
      releaseYear: 2011,
    },
    variants: [
      {
        sku: 'SHURE-SE215-CLR',
        colorName: 'Clear',
        colorHex: '#DDE7F0',
        finish: 'glossy',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 16,
      },
      {
        sku: 'SHURE-SE215-BLK',
        colorName: 'Black',
        colorHex: '#141414',
        finish: 'glossy',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 10,
      },
    ],
  },
  {
    slug: 'aether-audio-orbit-anc',
    brand: 'Aether Audio',
    model: 'Orbit ANC',
    name: 'Aether Audio Orbit ANC',
    category: ProductCategory.OVER_EAR,
    shortDescription:
      'Wymyślony model premium: nauszne z aktywną redukcją hałasu, bardzo lekkie i wygodne.',
    description:
      'Nauszne bezprzewodowe o zbalansowanym brzmieniu i wygodnym pałąku. Model fikcyjny do seedowania.',
    currency: 'PLN',
    basePriceCents: 99900,
    tags: ['anc', 'fictional', 'wireless', 'calls'],
    specs: {
      formFactor: 'over-ear',
      driver: { type: 'dynamic', sizeMm: 40 },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.3',
          codecs: ['SBC', 'AAC'],
          multipoint: true,
        },
      },
      noiseCancellation: { active: true, transparencyMode: true },
      battery: {
        upToHours: 40,
        upToHoursWithAnc: 32,
        charging: {
          usb: 'USB-C',
          fastCharge: '10 min -> ~5 h',
          wireless: false,
        },
      },
      microphones: { count: 6, noiseReductionForCalls: true },
      controls: { type: ['buttons'], voiceAssistant: true },
      weightGrams: 235,
      waterResistance: { rating: null },
      includedInBox: ['case', 'usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2025,
    },
    variants: [
      {
        sku: 'AETH-ORBIT-BLK',
        colorName: 'Carbon Black',
        colorHex: '#101214',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'microfiber' },
        priceDeltaCents: 0,
        stock: 12,
      },
      {
        sku: 'AETH-ORBIT-SND',
        colorName: 'Sand',
        colorHex: '#D6C7AE',
        finish: 'matte',
        materials: { earpads: 'memory foam', headband: 'microfiber' },
        priceDeltaCents: 0,
        stock: 8,
      },
    ],
  },
  {
    slug: 'nova-sonics-pulse-in-ear',
    brand: 'Nova Sonics',
    model: 'Pulse In-Ear',
    name: 'Nova Sonics Pulse In-Ear',
    category: ProductCategory.IN_EAR,
    shortDescription:
      'Wymyślone douszne true wireless stereo do sportu z lekką konstrukcją.',
    description:
      'Douszne true wireless stereo do codziennego użycia i aktywności. Model fikcyjny do seedowania.',
    currency: 'PLN',
    basePriceCents: 24900,
    tags: ['tws', 'fictional', 'sport', 'budget'],
    specs: {
      formFactor: 'in-ear',
      driver: { type: 'dynamic', sizeMm: 12 },
      connectivity: {
        wired: null,
        wireless: {
          bluetoothVersion: '5.2',
          codecs: ['SBC', 'AAC'],
          multipoint: false,
        },
      },
      noiseCancellation: { active: false, transparencyMode: false },
      battery: {
        upToHours: 7,
        caseTotalHours: 28,
        charging: {
          usb: 'USB-C',
          fastCharge: '10 min -> ~2 h',
          wireless: false,
        },
      },
      microphones: { count: 2, noiseReductionForCalls: true },
      controls: { type: ['touch'], voiceAssistant: true },
      weightGrams: 4.2,
      waterResistance: { rating: 'IPX5' },
      includedInBox: ['charging case', 'usb-c cable'],
      warrantyMonths: 24,
      releaseYear: 2025,
    },
    variants: [
      {
        sku: 'NOVA-PULSE-BLK',
        colorName: 'Black',
        colorHex: '#161616',
        finish: 'matte',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 50,
      },
      {
        sku: 'NOVA-PULSE-MNT',
        colorName: 'Mint',
        colorHex: '#AEE8D3',
        finish: 'matte',
        materials: { shell: 'plastic' },
        priceDeltaCents: 0,
        stock: 22,
      },
    ],
  },
  {
    slug: 'echopeak-zen-on-ear',
    brand: 'EchoPeak',
    model: 'Zen On-Ear',
    name: 'EchoPeak Zen On-Ear',
    category: ProductCategory.ON_EAR,
    shortDescription:
      'Wymyślone lekkie nauszne na ucho do miasta, proste sterowanie i solidna bateria.',
    description:
      'Kompaktowe nauszne na ucho, lekkie i wygodne do codziennych dojazdów. Model fikcyjny.',
    currency: 'PLN',
    basePriceCents: 31900,
    tags: ['on-ear', 'fictional', 'wireless'],
    specs: {
      formFactor: 'on-ear',
      driver: { type: 'dynamic', sizeMm: 32 },
      connectivity: {
        wired: { jack: '3.5mm', cableInBox: true },
        wireless: {
          bluetoothVersion: '5.1',
          codecs: ['SBC'],
          multipoint: false,
        },
      },
      noiseCancellation: { active: false, transparencyMode: false },
      battery: {
        upToHours: 50,
        upToHoursWithAnc: null,
        charging: {
          usb: 'USB-C',
          fastCharge: '10 min -> ~6 h',
          wireless: false,
        },
      },
      microphones: { count: 1, noiseReductionForCalls: false },
      controls: { type: ['buttons'], voiceAssistant: true },
      weightGrams: 155,
      waterResistance: { rating: null },
      includedInBox: ['usb-c cable', '3.5mm audio cable'],
      warrantyMonths: 24,
      releaseYear: 2025,
    },
    variants: [
      {
        sku: 'ECHO-ZEN-GRY',
        colorName: 'Graphite',
        colorHex: '#2E2E2E',
        finish: 'matte',
        materials: { earpads: 'foam', headband: 'fabric' },
        priceDeltaCents: 0,
        stock: 35,
      },
      {
        sku: 'ECHO-ZEN-CRM',
        colorName: 'Cream',
        colorHex: '#E7DDCC',
        finish: 'matte',
        materials: { earpads: 'foam', headband: 'fabric' },
        priceDeltaCents: 0,
        stock: 15,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSlug(raw: string): string {
  return slugify(raw, { lower: true, strict: true });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to database…');
  await AppDataSource.initialize();

  const productsRepo = AppDataSource.getRepository(Product);
  const variantsRepo = AppDataSource.getRepository(ProductVariant);

  console.log(`🌱 Seeding ${PRODUCTS.length} products…\n`);

  for (const data of PRODUCTS) {
    // Sprawdź czy produkt już istnieje
    const existing = await productsRepo.findOne({
      where: { slug: data.slug },
    });

    if (existing) {
      console.log(`⏭  Skipping "${data.name}" — already exists`);
      continue;
    }

    // Utwórz produkt
    const product = await productsRepo.save(
      productsRepo.create({
        slug: data.slug ?? makeSlug(`${data.brand} ${data.model}`),
        brand: data.brand,
        model: data.model,
        name: data.name,
        category: data.category,
        status: ProductStatus.ACTIVE, // seed od razu jako ACTIVE
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        currency: data.currency,
        basePriceCents: data.basePriceCents,
        specs: data.specs ?? null,
        tags: data.tags ?? [],
        featured: false,
      }),
    );

    // Utwórz warianty
    for (const v of data.variants) {
      await variantsRepo.save(
        variantsRepo.create({
          productId: product.id,
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          finish: (v.finish as VariantFinish) ?? null,
          materials: v.materials ?? null,
          priceDeltaCents: v.priceDeltaCents ?? 0,
          stock: v.stock,
          isAvailable: v.stock > 0,
        }),
      );
    }

    console.log(
      `✅ Created "${product.name}" (${data.variants.length} variants)`,
    );
  }

  console.log('\n🎉 Seed complete!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
