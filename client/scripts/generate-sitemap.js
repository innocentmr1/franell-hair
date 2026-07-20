// Generates public/sitemap.xml at build time: static routes always included,
// product routes fetched from the API best-effort (build must not fail if
// the backend is briefly unreachable).
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plain Node script — Vite's automatic .env.production loading doesn't apply
// here, so read whichever env file the build is using ourselves.
function loadEnvFile(name) {
  const path = join(__dirname, '..', name);
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      })
  );
}

const fileEnv = { ...loadEnvFile('.env'), ...loadEnvFile('.env.production') };

const SITE_URL = 'https://www.franellhair.com';
const API_URL = process.env.VITE_API_URL || fileEnv.VITE_API_URL || 'http://localhost:5000/api';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/shop', priority: '0.9' },
  { path: '/about', priority: '0.5' },
  { path: '/contact', priority: '0.5' },
  { path: '/faq', priority: '0.4' },
  { path: '/shipping', priority: '0.4' },
];

async function fetchProductPaths() {
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const { products } = await res.json();
    return (products || []).map((p) => ({ path: `/product/${p._id}`, priority: '0.7' }));
  } catch (err) {
    console.warn('[sitemap] Could not fetch products, generating static-only sitemap:', err.message);
    return [];
  }
}

const productRoutes = await fetchProductPaths();
const routes = [...STATIC_ROUTES, ...productRoutes];
const today = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(__dirname, '../public/sitemap.xml'), xml);
console.log(`[sitemap] Wrote ${routes.length} URLs (${productRoutes.length} products) to public/sitemap.xml`);
