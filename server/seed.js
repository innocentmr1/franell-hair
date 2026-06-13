require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');
const User     = require('./models/User');
const Category = require('./models/Category');

const SEED_CATEGORIES = [
  { name: 'Wigs',          description: 'Full lace, HD lace & glueless wigs' },
  { name: 'Bundles',       description: 'Raw, virgin & Remy hair bundles' },
  { name: 'Closures',      description: '4x4, 5x5 & 6x6 lace closures' },
  { name: 'Frontals',      description: '13x4 & 13x6 lace frontals' },
  { name: 'Extensions',    description: 'Clip-ins, tape-ins & weave extensions' },
  { name: 'Accessories',   description: 'Hair tools, bands & styling accessories' },
  { name: 'Braiding Hair', description: 'Box braids, knotless & cornrow hair' },
  { name: 'Crochet Hair',  description: 'Pre-twisted, pre-looped crochet styles' },
  { name: 'Locs',          description: 'Faux locs, butterfly & goddess locs' },
  { name: 'Twists',        description: 'Senegalese & passion twists' },
];

const U = (id, w = 700, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const products = [
  /* ── WIGS ─────────────────────────────────────────────── */
  {
    name: 'HD Lace Front Wig Body Wave 13×4 24"',
    slug: 'hd-lace-front-wig-body-wave-24',
    description: 'Premium HD lace front wig with silky body wave texture. Invisible hairline, pre-plucked baby hairs and bleached knots for a seamless, natural look. 150% density.',
    price: 189.99, comparePrice: 249.99,
    category: 'Wigs', hairType: 'Wavy',
    lengths: ['18', '20', '22', '24', '26'],
    colors: ['Natural Black', 'Dark Brown', '1B Off Black'],
    stock: 30,
    images: [U('1522337360788-8b13dee7a37e'), U('1594736797933-d0501ba2fe65'), U('1531746020798-e6953c6e8e04')],
    videos: [], video: '',
    isFeatured: true, isNewArrival: true,
  },
  {
    name: 'Glueless Straight Bob Lace Wig 13×6',
    slug: 'glueless-straight-bob-lace-wig',
    description: 'Ready-to-wear glueless wig with an adjustable strap and combs. Sleek straight hair with a natural bounce. No glue, no gel — just put it on and go.',
    price: 159.99, comparePrice: 199.99,
    category: 'Wigs', hairType: 'Straight',
    lengths: ['12', '14', '16', '18'],
    colors: ['Natural Black', 'Jet Black'],
    stock: 25,
    images: [U('1519699047748-de8e457a634e'), U('1562322140-8baeececf3df'), U('1522337360788-8b13dee7a37e')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Curly Lace Closure Wig 4×4 20"',
    slug: 'curly-lace-closure-wig-4x4-20',
    description: 'Stunning curly wig with a 4×4 HD lace closure. Bouncy, defined curls with a natural-looking parting. Great for any occasion.',
    price: 145.99, comparePrice: 185.99,
    category: 'Wigs', hairType: 'Curly',
    lengths: ['16', '18', '20', '22'],
    colors: ['Natural Black', '1B/30 Ombre'],
    stock: 20,
    images: [U('1580618672591-eb180b1a973f'), U('1557804506-669a67965ba0'), U('1519699047748-de8e457a634e')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── BUNDLES ──────────────────────────────────────────── */
  {
    name: 'Brazilian Body Wave Hair Bundles 3pcs',
    slug: 'brazilian-body-wave-bundles-3pcs',
    description: 'Soft, lustrous Brazilian body wave bundles. 100% virgin, unprocessed hair. Minimum shedding, tangle-free and can be dyed or bleached. Sold as a 3-bundle deal.',
    price: 129.99, comparePrice: 169.99,
    category: 'Bundles', hairType: 'Wavy',
    lengths: ['12', '14', '16', '18', '20', '22', '24'],
    colors: ['Natural Black', '1B Off Black', 'Dark Brown'],
    stock: 50,
    images: [U('1534528741775-53994a69daeb'), U('1522337360788-8b13dee7a37e'), U('1594736797933-d0501ba2fe65')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Peruvian Deep Wave Bundles 4pcs',
    slug: 'peruvian-deep-wave-bundles-4pcs',
    description: 'Thick, rich Peruvian deep wave bundles with a beautiful S-pattern curl. 100% virgin hair — soft to touch, full from root to tip. Great for a lush, full sew-in.',
    price: 149.99, comparePrice: 199.99,
    category: 'Bundles', hairType: 'Wavy',
    lengths: ['14', '16', '18', '20', '22', '24', '26'],
    colors: ['Natural Black', 'Dark Brown'],
    stock: 40,
    images: [U('1503951914875-452162b0f3f1'), U('1562322140-8baeececf3df'), U('1531746020798-e6953c6e8e04')],
    videos: [], video: '',
    isFeatured: true,
  },

  /* ── CLOSURES ─────────────────────────────────────────── */
  {
    name: '4×4 HD Lace Closure Body Wave',
    slug: '4x4-hd-lace-closure-body-wave',
    description: 'Crystal clear HD lace closure that melts into any skin tone. Pre-plucked hairline with baby hairs. Pairs perfectly with our Brazilian bundles for a flawless finish.',
    price: 79.99, comparePrice: 99.99,
    category: 'Closures', hairType: 'Wavy',
    lengths: ['10', '12', '14', '16', '18'],
    colors: ['Natural Black', '1B Off Black'],
    stock: 45,
    images: [U('1580618672591-eb180b1a973f'), U('1519699047748-de8e457a634e'), U('1557804506-669a67965ba0')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: '5×5 Transparent Lace Closure Straight',
    slug: '5x5-transparent-lace-closure-straight',
    description: 'Wider 5×5 parting space transparent lace closure with silky straight texture. Bleached knots and pre-plucked for an effortlessly natural look.',
    price: 89.99, comparePrice: 115.99,
    category: 'Closures', hairType: 'Straight',
    lengths: ['10', '12', '14', '16'],
    colors: ['Natural Black', 'Jet Black'],
    stock: 30,
    images: [U('1562322140-8baeececf3df'), U('1522337360788-8b13dee7a37e'), U('1534528741775-53994a69daeb')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── FRONTALS ─────────────────────────────────────────── */
  {
    name: '13×4 HD Lace Frontal Straight 14"',
    slug: '13x4-hd-lace-frontal-straight-14',
    description: 'Full 13×4 HD lace frontal for a seamless hairline from ear to ear. Pre-plucked with baby hairs, bleached knots and silky straight hair for the perfect install.',
    price: 109.99, comparePrice: 139.99,
    category: 'Frontals', hairType: 'Straight',
    lengths: ['10', '12', '14', '16', '18'],
    colors: ['Natural Black', '1B Off Black'],
    stock: 25,
    images: [U('1503951914875-452162b0f3f1'), U('1594736797933-d0501ba2fe65'), U('1519699047748-de8e457a634e')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: '13×6 HD Lace Frontal Body Wave',
    slug: '13x6-hd-lace-frontal-body-wave',
    description: 'Extra-deep 13×6 parting space with an HD lace frontal and luxurious body wave. Gives a natural hairline with maximum styling versatility.',
    price: 129.99, comparePrice: 164.99,
    category: 'Frontals', hairType: 'Wavy',
    lengths: ['10', '12', '14', '16', '18', '20'],
    colors: ['Natural Black', 'Dark Brown', '1B/30 Ombre'],
    stock: 20,
    images: [U('1531746020798-e6953c6e8e04'), U('1557804506-669a67965ba0'), U('1580618672591-eb180b1a973f')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── EXTENSIONS ───────────────────────────────────────── */
  {
    name: 'Kinky Curly Clip-In Hair Extensions 7pcs',
    slug: 'kinky-curly-clip-in-extensions-7pcs',
    description: 'Full set of 7 clip-in wefts with kinky curly texture. Blends perfectly with natural coily hair. Clip in and out in under 5 minutes — no heat, no glue.',
    price: 89.99, comparePrice: 119.99,
    category: 'Extensions', hairType: 'Curly',
    lengths: ['14', '16', '18', '20'],
    colors: ['Natural Black', '1B Off Black', 'Dark Brown'],
    stock: 35,
    images: [U('1562322140-8baeececf3df'), U('1503951914875-452162b0f3f1'), U('1534528741775-53994a69daeb')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Tape-In Straight Hair Extensions 20pcs',
    slug: 'tape-in-straight-hair-extensions-20pcs',
    description: 'Seamless tape-in extensions for a professional, flat finish. Ultra-thin wefts with medical-grade adhesive. Lasts 6–8 weeks and can be repositioned.',
    price: 79.99, comparePrice: 99.99,
    category: 'Extensions', hairType: 'Straight',
    lengths: ['16', '18', '20', '22', '24'],
    colors: ['Natural Black', 'Dark Brown', 'Light Brown'],
    stock: 45,
    images: [U('1519699047748-de8e457a634e'), U('1522337360788-8b13dee7a37e'), U('1562322140-8baeececf3df')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── ACCESSORIES ──────────────────────────────────────── */
  {
    name: 'Professional Edge Control & Braid Spray Set',
    slug: 'edge-control-braid-spray-set',
    description: 'Complete styling kit: mega hold edge control, moisturising braid spray and a fine-tooth edge brush. Keeps flyaways smooth all day without flaking or stiffness.',
    price: 24.99, comparePrice: 0,
    category: 'Accessories', hairType: 'Braids',
    lengths: [], colors: [],
    stock: 100,
    images: [U('1557804506-669a67965ba0'), U('1534528741775-53994a69daeb')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Satin-Lined Silk Bonnet & Scrunchie Set',
    slug: 'satin-silk-bonnet-scrunchie-set',
    description: 'Protect your styles overnight with our premium satin-lined bonnet. Includes 3 matching satin scrunchies. Reduces frizz, retains moisture and extends style life.',
    price: 18.99, comparePrice: 0,
    category: 'Accessories', hairType: 'Locs',
    lengths: [], colors: ['Black', 'Pink', 'Gold'],
    stock: 150,
    images: [U('1580618672591-eb180b1a973f'), U('1503951914875-452162b0f3f1')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── LOCS ─────────────────────────────────────────────── */
  {
    name: 'Goddess Faux Locs with Curly Ends 24"',
    slug: 'goddess-faux-locs-curly-ends-24',
    description: 'Stunning goddess faux locs with soft, flowing curly ends. Pre-twisted crochet hair — lightweight and ready to install in under 2 hours.',
    price: 45.99, comparePrice: 59.99,
    category: 'Locs', hairType: 'Locs',
    lengths: ['18', '20', '24'],
    colors: ['Natural Black', 'T30 Honey Brown', '1B Off Black'],
    stock: 60,
    images: ['local:0', U('1594736797933-d0501ba2fe65'), U('1531746020798-e6953c6e8e04')],
    videos: [], video: '',
    isFeatured: true, isNewArrival: true,
  },
  {
    name: 'Butterfly Locs with Curly Ends 20"',
    slug: 'butterfly-locs-curly-ends-20',
    description: 'Trendy butterfly locs with gorgeous curly ends. Dark brown base fading to T30 honey tips. Lightweight, no frizz, and long-lasting.',
    price: 48.99, comparePrice: 62.99,
    category: 'Locs', hairType: 'Locs',
    lengths: ['16', '20', '24'],
    colors: ['T30 Honey Brown', 'Dark Brown', '1B/30 Ombre'],
    stock: 40,
    images: ['local:4', U('1531746020798-e6953c6e8e04'), U('1594736797933-d0501ba2fe65')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Soft Locs with Blonde Ombre 24"',
    slug: 'soft-locs-blonde-ombre-24',
    description: 'Eye-catching soft locs with a dramatic black-to-blonde ombre. Easy crochet installation — looks salon-done in hours.',
    price: 52.99, comparePrice: 68.99,
    category: 'Locs', hairType: 'Locs',
    lengths: ['20', '24', '28'],
    colors: ['Black to Blonde', 'T27 Ombre', '1B/613'],
    stock: 35,
    images: ['local:5', U('1519699047748-de8e457a634e'), U('1534528741775-53994a69daeb')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Distressed Butterfly Locs — Honey Brown 12"',
    slug: 'distressed-butterfly-locs-honey-brown-12',
    description: 'Short, chic distressed butterfly locs in honey brown with a boho-natural vibe. Pre-looped for quick installation.',
    price: 39.99, comparePrice: 52.99,
    category: 'Locs', hairType: 'Locs',
    lengths: ['10', '12', '14'],
    colors: ['Honey Brown', 'T30', 'Light Brown'],
    stock: 50,
    images: ['local:6', U('1503951914875-452162b0f3f1'), U('1580618672591-eb180b1a973f')],
    videos: [], video: '',
    isNewArrival: true,
  },

  /* ── BRAIDING HAIR ────────────────────────────────────── */
  {
    name: 'Boho Box Braids with Wavy Curly Ends',
    slug: 'boho-box-braids-wavy-curly-ends',
    description: 'Gorgeous boho box braids pre-looped for easy installation. Long-lasting, tangle-free with beautiful wavy curly tips. Ombre from dark roots to warm blonde tips.',
    price: 38.99, comparePrice: 52.99,
    category: 'Braiding Hair', hairType: 'Braids',
    lengths: ['20', '24', '28'],
    colors: ['T27 Blonde Ombre', 'T30 Honey Brown', 'Natural Black'],
    stock: 80,
    images: ['local:1', U('1519699047748-de8e457a634e'), U('1562322140-8baeececf3df')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Knotless Box Braids with Ombre Curly Ends',
    slug: 'knotless-box-braids-ombre-curly-ends',
    description: 'Elegant knotless box braids with smooth ombre fade and gorgeous curly ends. Less tension on the scalp. Perfect protective style that lasts for weeks.',
    price: 42.99, comparePrice: 56.99,
    category: 'Braiding Hair', hairType: 'Braids',
    lengths: ['20', '24', '28', '32'],
    colors: ['Black to Blonde', 'T27', 'Natural Black'],
    stock: 65,
    images: ['local:7', U('1522337360788-8b13dee7a37e'), U('1562322140-8baeececf3df')],
    videos: [], video: '',
    isFeatured: true,
  },

  /* ── CROCHET HAIR ─────────────────────────────────────── */
  {
    name: 'Passion Twist Crochet Hair 18"',
    slug: 'passion-twist-crochet-hair-18',
    description: 'Soft and bouncy passion twist crochet hair with dark roots blending into warm brown ends. Pre-twisted and ready to install — no prep needed.',
    price: 32.99, comparePrice: 42.99,
    category: 'Crochet Hair', hairType: 'Twists',
    lengths: ['14', '18', '22'],
    colors: ['Dark Brown Ombre', 'T30', 'Natural Black'],
    stock: 55,
    images: ['local:3', U('1557804506-669a67965ba0'), U('1522337360788-8b13dee7a37e')],
    videos: [], video: '',
    isFeatured: true, isNewArrival: true,
  },

  /* ── TWISTS ───────────────────────────────────────────── */
  {
    name: 'Senegalese Twists — Burgundy Red 26"',
    slug: 'senegalese-twists-burgundy-red-26',
    description: 'Vibrant burgundy Senegalese twists. Lightweight crochet twists that look stunning and install easily. Perfect for a bold, glamorous protective style.',
    price: 35.99, comparePrice: 48.99,
    category: 'Twists', hairType: 'Twists',
    lengths: ['22', '26', '30'],
    colors: ['Burgundy', 'Wine Red', '99J Dark Red'],
    stock: 45,
    images: ['local:2', U('1580618672591-eb180b1a973f'), U('1503951914875-452162b0f3f1')],
    videos: [], video: '',
    isFeatured: true,
  },
  {
    name: 'Senegalese Twists — Natural Black 18"',
    slug: 'senegalese-twists-natural-black-18',
    description: 'Classic Senegalese twists in jet black. Neat, defined twist texture with beautiful shine. Crochet-ready hair that installs in under 2 hours.',
    price: 29.99, comparePrice: 38.99,
    category: 'Twists', hairType: 'Twists',
    lengths: ['14', '18', '22', '26'],
    colors: ['Natural Black', 'Jet Black', '1B Off Black'],
    stock: 70,
    images: ['local:8', U('1557804506-669a67965ba0'), U('1531746020798-e6953c6e8e04')],
    videos: [], video: '',
    isFeatured: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear fake review data from any product that has no real reviews
  const cleaned = await Product.updateMany(
    { $expr: { $eq: [{ $size: '$reviews' }, 0] } },
    { $set: { rating: 0, numReviews: 0 } }
  );
  console.log(`Cleared fake review stats from ${cleaned.modifiedCount} products`);

  // Upsert products by slug — preserves _id so existing orders stay valid
  // Only update product info fields; never overwrite real reviews/rating/numReviews
  let upserted = 0;
  for (const p of products) {
    const { slug, ...fields } = p;
    await Product.findOneAndUpdate(
      { slug },
      { $set: fields, $setOnInsert: { slug, rating: 0, numReviews: 0, reviews: [] } },
      { upsert: true, new: true }
    );
    upserted++;
  }
  console.log(`Upserted ${upserted} products`);

  // Upsert categories by name
  for (const c of SEED_CATEGORIES) {
    const slug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    await Category.findOneAndUpdate({ name: c.name }, { ...c, slug }, { upsert: true, new: true });
  }
  console.log(`Upserted ${SEED_CATEGORIES.length} categories`);

  const admin = await User.findOne({ email: 'admin@franellhair.com' });
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@franellhair.com', password: 'admin123456', isAdmin: true });
    console.log('Admin created: admin@franellhair.com / admin123456');
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
