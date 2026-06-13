import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const pages = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'cart', path: '/cart' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

for (const { name, path } of pages) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `screenshot-${name}.png`, fullPage: false });
  console.log(`✓ screenshot-${name}.png`);
}

await browser.close();
console.log('Done.');
