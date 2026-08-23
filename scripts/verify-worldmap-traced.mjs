// Captura las 5 fases una por una (screen = boss de esa fase - 5, a mitad
// de camino) para comparar visualmente contra el trazo original.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT =
  'C:/Users/caffo/AppData/Local/Temp/claude/C--Users-caffo-Documents-VAULT-STUDIO-Webs-Kaggle-Wins/eec8effc-7d1f-4532-aecb-600ba35bdfc4/scratchpad';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=390,1400'],
  defaultViewport: { width: 390, height: 1400 },
});

async function plantAndReload(page, screen) {
  await page.evaluate((s) => {
    const save = {
      v: 1,
      savedAt: Date.now(),
      s: {
        screen: s, gold: 300, goldEarned: 300, emeraldsRun: 2, kills: 20,
        levels: { attack: 6, defense: 5, speed: 3, luck: 2, gold: 1, emerald: 1, execution: 0 },
        playerHP: 80, foe: { kind: 'scavenger', maxHP: 999999, isBoss: false }, foeHP: 999999,
        status: 'playing', runTimeMs: 60000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
    orig('rustward-meta', JSON.stringify({ state: { bestScreen: s + 5, emeralds: 40 }, version: 0 }));
  }, screen);
  await page.reload({ waitUntil: 'networkidle0' });
}

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  // fase1: screen 5, fase2: screen15, fase3: screen25, fase4: screen35, fase5: screen45
  for (let phase = 1; phase <= 5; phase++) {
    const screen = (phase - 1) * 10 + 5;
    await plantAndReload(page, screen);
    await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
    await page.evaluate(() =>
      document
        .querySelector('.hud-world-btn')
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
    );
    await new Promise((r) => setTimeout(r, 500));
    // recortar solo la zona del mapa
    const stage = await page.$('.worldmap-stage');
    await stage.screenshot({ path: `${OUT}/traced-phase${phase}.png` });
    await page.evaluate(() =>
      document
        .querySelector('.map-close')
        ?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
    );
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(JSON.stringify({ errors }, null, 2));
} finally {
  await browser.close();
}
