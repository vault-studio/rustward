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
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => {
    const save = {
      v: 1,
      savedAt: Date.now(),
      s: {
        screen: 47, gold: 500, goldEarned: 500, emeraldsRun: 3, kills: 40,
        levels: { attack: 8, defense: 6, speed: 4, luck: 2, gold: 2, emerald: 1, execution: 1 },
        playerHP: 90, foe: { kind: 'scavenger', maxHP: 999999, isBoss: false }, foeHP: 999999,
        status: 'playing', runTimeMs: 90000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
    const metaWrap = { state: { bestScreen: 83, emeralds: 25, language: 'en' }, version: 0 };
    orig('rustward-meta', JSON.stringify(metaWrap));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/en-hud-narrow.png` });

  const en = await page.evaluate(() => ({
    world: document.querySelector('.hud-world-name')?.textContent,
    phaseLabel: document.querySelector('.hud-screen-label')?.textContent,
  }));

  await page.evaluate(() =>
    document.querySelector('.hud-world-btn').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    ),
  );
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: `${OUT}/en-map-narrow.png` });

  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    horizontalOverflow: document.body.scrollWidth > window.innerWidth,
  }));

  await page.evaluate(() =>
    document.querySelector('.map-close')?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    ),
  );
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() =>
    document.querySelector('.stats-btn').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    ),
  );
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/en-stats-narrow.png` });

  console.log(JSON.stringify({ en, overflow, errors }, null, 2));
} finally {
  await browser.close();
}
