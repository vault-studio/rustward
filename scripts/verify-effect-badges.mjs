// Verifica los badges "+N" de las mejoras: valores correctos y zoom visual.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT =
  'C:/Users/caffo/AppData/Local/Temp/claude/C--Users-caffo-Documents-VAULT-STUDIO-Webs-Kaggle-Wins/eec8effc-7d1f-4532-aecb-600ba35bdfc4/scratchpad';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=375,812'],
  defaultViewport: { width: 375, height: 812 },
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.upg-effect', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/upgrade-bar-full.png` });

  const badges = await page.evaluate(() =>
    [...document.querySelectorAll('.upg')].map((btn) => ({
      name: btn.querySelector('.upg-name')?.textContent,
      effect: btn.querySelector('.upg-effect')?.textContent,
    })),
  );

  const upgBar = await page.$('.upgrade-bar');
  await upgBar.screenshot({ path: `${OUT}/upgrade-bar-zoom.png` });

  console.log(JSON.stringify({ badges, errors }, null, 2));
} finally {
  await browser.close();
}
