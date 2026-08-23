// Verifica en vivo que matar un boss de fase del Mundo 3 (screen130) da
// exactamente 3 esmeraldas.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const save = {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 130, gold: 500, goldEarned: 500, emeraldsRun: 0, kills: 129,
        levels: { attack: 20, defense: 5, speed: 3, luck: 0, gold: 0, emerald: 0, execution: 0 },
        playerHP: 200, foe: { kind: 'boss', maxHP: 2, isBoss: true }, foeHP: 2,
        status: 'playing', runTimeMs: 60000, attackTimer: 900, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
    orig('rustward-meta', JSON.stringify({ state: { bestScreen: 130, emeralds: 0 }, version: 0 }));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.char-wrap', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 1200)); // boss (2hp) muere casi al instante

  const emeralds = await page.evaluate(
    () => document.querySelector('.hud-currency.emerald span')?.textContent,
  );
  console.log(JSON.stringify({ emeraldsAfterWorld3BossKill: emeralds, errors }));
} finally {
  await browser.close();
}
