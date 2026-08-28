/**
 * Seed script — loads demo accounts + 15+ realistic Pakistani listings so the
 * app is usable immediately after setup (Section 10).
 *
 * Run: npm run db:seed
 *
 * NOTE: the property photos below are free Unsplash placeholders for the DEMO
 * only. Real listings must use the dealer's own uploaded photos (Section 3.5).
 */
import { PrismaClient, type AreaUnit, type PropertyType, type ListingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SQFT_PER_MARLA = 272.25;
const toSqft = (v: number, u: AreaUnit) => (u === 'marla' ? v * SQFT_PER_MARLA : v);

// City centres — each listing gets a small random jitter around these.
const CITIES: Record<string, { lat: number; lng: number }> = {
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
};

const jitter = () => (Math.random() - 0.5) * 0.06; // ~±3km spread within a city

// A few free Unsplash house/interior photos reused as demo placeholders.
const PHOTOS = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
];
const photoFor = (i: number) => PHOTOS[i % PHOTOS.length];

interface Listing {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  areaValue: number;
  areaUnit: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  city: keyof typeof CITIES;
  areaName: string;
  address: string;
  verified?: boolean;
  featured?: boolean;
}

const LISTINGS: Listing[] = [
  {
    title: 'Modern 1 Kanal House in DHA Phase 6',
    description:
      'A beautifully designed 1 kanal house with a spacious lawn, double-height lounge, imported fittings and a home theatre. Prime location, close to parks and commercial area.',
    propertyType: 'house',
    listingType: 'sale',
    price: 85_000_000,
    areaValue: 20,
    areaUnit: 'marla',
    bedrooms: 6,
    bathrooms: 7,
    city: 'Lahore',
    areaName: 'DHA Phase 6',
    address: 'House 123, Street 12, Sector C, DHA Phase 6, Lahore',
    verified: true,
    featured: true,
  },
  {
    title: '10 Marla House for Sale in Bahria Town',
    description:
      'Well-maintained 10 marla house in a secure gated community. Three bedrooms with attached baths, modern kitchen, car porch and a small garden.',
    propertyType: 'house',
    listingType: 'sale',
    price: 32_000_000,
    areaValue: 10,
    areaUnit: 'marla',
    bedrooms: 4,
    bathrooms: 4,
    city: 'Lahore',
    areaName: 'Bahria Town Sector E',
    address: 'House 45, Block E, Bahria Town, Lahore',
    verified: true,
  },
  {
    title: 'Cosy 5 Marla House in Model Town',
    description:
      'Ideal starter home in a peaceful neighbourhood. Two storeys, three bedrooms, roof-top terrace and a car space. Walking distance to schools and market.',
    propertyType: 'house',
    listingType: 'sale',
    price: 18_500_000,
    areaValue: 5,
    areaUnit: 'marla',
    bedrooms: 3,
    bathrooms: 3,
    city: 'Lahore',
    areaName: 'Model Town',
    address: 'House 8, Block J, Model Town, Lahore',
  },
  {
    title: 'Luxury Apartment in Clifton with Sea View',
    description:
      'Fully renovated 3-bed apartment on a high floor with an open sea view, imported kitchen, standby generator and covered parking. 24/7 security.',
    propertyType: 'flat',
    listingType: 'sale',
    price: 45_000_000,
    areaValue: 2200,
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    city: 'Karachi',
    areaName: 'Clifton Block 2',
    address: 'Flat 14-B, Seaview Tower, Clifton Block 2, Karachi',
    verified: true,
    featured: true,
  },
  {
    title: '2 Bed Flat for Rent in Gulshan-e-Iqbal',
    description:
      'Bright and airy 2-bedroom flat, second floor, with a small balcony. Family building, water and gas available. Close to university and main road.',
    propertyType: 'flat',
    listingType: 'rent',
    price: 55_000,
    areaValue: 1100,
    areaUnit: 'sqft',
    bedrooms: 2,
    bathrooms: 2,
    city: 'Karachi',
    areaName: 'Gulshan-e-Iqbal Block 10',
    address: 'Flat 6, Al-Habib Arcade, Block 10, Gulshan-e-Iqbal, Karachi',
  },
  {
    title: '500 Sq Yd Residential Plot in DHA City',
    description:
      'Level, litigation-free residential plot in a developing sector. Good investment with rising demand. Utilities reaching the area soon.',
    propertyType: 'plot',
    listingType: 'sale',
    price: 27_500_000,
    areaValue: 4500,
    areaUnit: 'sqft',
    city: 'Karachi',
    areaName: 'DHA City Sector 4',
    address: 'Plot 210, Sector 4, DHA City, Karachi',
    verified: true,
  },
  {
    title: '1 Kanal Corner Plot in F-11',
    description:
      'Prime corner plot in one of Islamabad’s most sought-after sectors. Flat, ready to build, with wide roads and full development.',
    propertyType: 'plot',
    listingType: 'sale',
    price: 62_000_000,
    areaValue: 20,
    areaUnit: 'marla',
    city: 'Islamabad',
    areaName: 'F-11/1',
    address: 'Plot 3, Street 24, F-11/1, Islamabad',
    featured: true,
  },
  {
    title: 'Elegant House for Rent in F-7',
    description:
      'Spacious 5-bedroom house in a premium sector, marble flooring, servant quarter, large lawn and double garage. Ideal for a large family or embassy staff.',
    propertyType: 'house',
    listingType: 'rent',
    price: 350_000,
    areaValue: 20, // 1 kanal = 20 marla
    areaUnit: 'marla',
    bedrooms: 5,
    bathrooms: 6,
    city: 'Islamabad',
    areaName: 'F-7/2',
    address: 'House 18, Street 5, F-7/2, Islamabad',
    verified: true,
  },
  {
    title: '7 Marla House in Bahria Town Phase 8',
    description:
      'Newly built 7 marla house with a modern facade, open kitchen and three good-sized bedrooms. Community park nearby, secure environment.',
    propertyType: 'house',
    listingType: 'sale',
    price: 24_000_000,
    areaValue: 7,
    areaUnit: 'marla',
    bedrooms: 3,
    bathrooms: 4,
    city: 'Rawalpindi',
    areaName: 'Bahria Town Phase 8',
    address: 'House 77, Street 3, Phase 8, Bahria Town, Rawalpindi',
  },
  {
    title: 'Commercial Shop for Rent on Main Boulevard',
    description:
      'Ground-floor commercial shop on a busy road with heavy footfall. Suitable for retail, cafe or office. Front on main boulevard, ample parking.',
    propertyType: 'commercial',
    listingType: 'rent',
    price: 220_000,
    areaValue: 1200,
    areaUnit: 'sqft',
    city: 'Lahore',
    areaName: 'Gulberg III',
    address: 'Shop 4, MM Alam Road, Gulberg III, Lahore',
    verified: true,
  },
  {
    title: 'Commercial Plaza for Sale in Blue Area',
    description:
      'Fully rented commercial plaza generating steady income. Four floors plus basement parking. Excellent long-term investment in the city’s business hub.',
    propertyType: 'commercial',
    listingType: 'sale',
    price: 320_000_000,
    areaValue: 8000,
    areaUnit: 'sqft',
    city: 'Islamabad',
    areaName: 'Blue Area',
    address: 'Plaza 12, Jinnah Avenue, Blue Area, Islamabad',
    featured: true,
  },
  {
    title: '4 Kanal Agricultural Land near Bosan Road',
    description:
      'Fertile agricultural land with a tube well and road access. Good for farming or future development. Clear title, motivated seller.',
    propertyType: 'agricultural',
    listingType: 'sale',
    price: 15_000_000,
    areaValue: 43_560,
    areaUnit: 'sqft',
    city: 'Multan',
    areaName: 'Bosan Road',
    address: 'Mauza Shah Rukn-e-Alam, Bosan Road, Multan',
  },
  {
    title: '3 Marla House for Sale in Johar Town',
    description:
      'Compact and affordable 3 marla house, freshly painted, two bedrooms, ideal for a small family or rental investment. Near main market.',
    propertyType: 'house',
    listingType: 'sale',
    price: 12_500_000,
    areaValue: 3,
    areaUnit: 'marla',
    bedrooms: 2,
    bathrooms: 2,
    city: 'Lahore',
    areaName: 'Johar Town',
    address: 'House 29, Block G1, Johar Town, Lahore',
  },
  {
    title: '10 Marla House for Rent in Wapda City',
    description:
      'Double-storey 10 marla house available for rent. Four bedrooms, drawing and dining, car porch, and a small lawn. Well-connected location.',
    propertyType: 'house',
    listingType: 'rent',
    price: 85_000,
    areaValue: 10,
    areaUnit: 'marla',
    bedrooms: 4,
    bathrooms: 4,
    city: 'Faisalabad',
    areaName: 'Wapda City',
    address: 'House 51, Block B, Wapda City, Faisalabad',
  },
  {
    title: '1 Bed Studio Apartment for Rent in DHA',
    description:
      'Modern furnished studio, perfect for a single professional or couple. Includes kitchen appliances, AC and lift access. Bills separate.',
    propertyType: 'flat',
    listingType: 'rent',
    price: 65_000,
    areaValue: 650,
    areaUnit: 'sqft',
    bedrooms: 1,
    bathrooms: 1,
    city: 'Karachi',
    areaName: 'DHA Phase 5',
    address: 'Studio 3, The Residency, DHA Phase 5, Karachi',
  },
  {
    title: '1 Kanal Farmhouse Plot in Bedian Road',
    description:
      'Peaceful farmhouse plot surrounded by greenery, ideal for a weekend retreat. Wide access road, boundary wall possible. Rapidly appreciating area.',
    propertyType: 'plot',
    listingType: 'sale',
    price: 21_000_000,
    areaValue: 20,
    areaUnit: 'marla',
    city: 'Lahore',
    areaName: 'Bedian Road',
    address: 'Plot 9, Green Acres, Bedian Road, Lahore',
    verified: true,
  },
];

async function main() {
  console.info('🌱 Seeding Estada database...');

  // Clear existing data in FK-safe order (dev convenience).
  await prisma.priceHistory.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyDocument.deleteMany();
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.property.deleteMany();
  await prisma.dealerProfile.deleteMany();
  await prisma.user.deleteMany();

  const [adminPass, dealerPass, buyerPass] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Dealer@123', 10),
    bcrypt.hash('Buyer@123', 10),
  ]);

  await prisma.user.create({
    data: {
      name: 'Estada Admin',
      email: 'admin@estada.app',
      passwordHash: adminPass,
      role: 'admin',
      isVerified: true,
    },
  });

  const dealer = await prisma.user.create({
    data: {
      name: 'Ahmed Real Estate',
      email: 'dealer@estada.app',
      passwordHash: dealerPass,
      phone: '03001234567',
      role: 'dealer',
      cnicNumber: '35202-1234567-1',
      isVerified: true,
      dealerProfile: {
        create: {
          businessName: 'Ahmed Estate & Builders',
          bio: 'Trusted property dealer in Lahore & Islamabad with 12+ years of experience.',
          verificationStatus: 'verified',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Sara Khan',
      email: 'buyer@estada.app',
      passwordHash: buyerPass,
      phone: '03007654321',
      role: 'buyer',
    },
  });

  // Create listings owned by the demo dealer.
  let i = 0;
  for (const l of LISTINGS) {
    const base = CITIES[l.city];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.property.create({
      data: {
        dealerId: dealer.id,
        title: l.title,
        description: l.description,
        propertyType: l.propertyType,
        listingType: l.listingType,
        price: l.price,
        areaValue: l.areaValue,
        areaUnit: l.areaUnit,
        areaSqft: toSqft(l.areaValue, l.areaUnit),
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        address: l.address,
        city: l.city,
        areaName: l.areaName,
        lat: base.lat + jitter(),
        lng: base.lng + jitter(),
        status: 'active',
        isDocumentVerified: !!l.verified,
        isFeatured: !!l.featured,
        expiresAt,
        images: {
          create: [
            { imageUrl: photoFor(i), isPrimary: true, sortOrder: 0 },
            { imageUrl: photoFor(i + 1), isPrimary: false, sortOrder: 1 },
            { imageUrl: photoFor(i + 2), isPrimary: false, sortOrder: 2 },
          ],
        },
      },
    });
    i++;
  }

  console.info(`✅ Seeded ${LISTINGS.length} listings + 3 demo accounts.`);
  console.info('   admin@estada.app / Admin@123');
  console.info('   dealer@estada.app / Dealer@123');
  console.info('   buyer@estada.app / Buyer@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
