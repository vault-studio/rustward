// Verificación rápida de producción: assets 200 y elementos clave presentes.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT =
  'C:/Users/caffo/AppData/Local/Temp/claude/C--Users-caffo-Documents-VAULT-STUDIO-Webs-Kaggle-Wins/eec8effc-7d1f-4532-aecb-600ba35bdfc4/scratchpad';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

try {
  const page = await browser.newPage();
  const failed = [];
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('https://rustward-alpha.vercel.app/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.hud-world-btn', { timeout: 10000 });
  await page.waitForSelector('.stats-btn', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${OUT}/prod-live.png` });

  const info = await page.evaluate(() => ({
    worldName: document.querySelector('.hud-world-name')?.textContent,
    phaseLabel: document.querySelector('.hud-screen-label')?.textContent,
    charImgSrc: document.querySelector('.char-wrap img')?.getAttribute('src'),
  }));

  console.log(JSON.stringify({ info, failed, errors }, null, 2));
} finally {
  await browser.close();
}
