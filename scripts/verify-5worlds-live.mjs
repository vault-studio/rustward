// Verifica en el navegador real que los mundos 2 y 4 renderizan sin errores
// (HUD mundo/fase correctos, mapa abre, boss con HP sano) — no solo el
// motor headless.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

async function plantAndReload(page, screen) {
  await page.evaluate((s) => {
    const save = {
      v: 1, savedAt: Date.now(),
      s: {
        screen: s, gold: 500, goldEarned: 500, emeraldsRun: 2, kills: 10,
        levels: { attack: 8, defense: 5, speed: 3, luck: 1, gold: 1, emerald: 0, execution: 0 },
        playerHP: 80, foe: { kind: 'boss', maxHP: 0, isBoss: true }, foeHP: 0,
        status: 'playing', runTimeMs: 30000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
  }, screen);
  await page.reload({ waitUntil: 'networkidle0' });
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  const results = {};
  for (const screen of [50, 100, 150, 200, 250]) {
    await plantAndReload(page, screen);
    await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 400));
    const info = await page.evaluate(() => ({
      world: document.querySelector('.hud-world-name')?.textContent,
      phase: document.querySelector('.hud-screen-num')?.textContent,
      bossHpText: document.querySelector('.hpbar.enemy.boss .hpbar-text')?.textContent,
      isBossVisible: !!document.querySelector('.enemy-wrap.boss'),
    }));
    results[`screen${screen}`] = info;
  }

  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
