import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const CHROME = 'C:\\Users\\innocent.oko\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe';

const pages = [
  { name: 'home', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'shop', path: '/shop' },
  { name: 'cart', path: '/cart' },
];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

for (const { name, path } of pages) {
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: `screenshot-${name}.png`, fullPage: false });
    console.log(`✓ screenshot-${name}.png`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

await browser.close();
console.log('Done.');
