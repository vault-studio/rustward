import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => {
    const save = {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 150, gold: 200, goldEarned: 300, emeraldsRun: 3, kills: 149,
        levels: { attack: 10, defense: 5, speed: 3, luck: 1, gold: 1, emerald: 0, execution: 0 },
        playerHP: 0, foe: { kind: 'boss', maxHP: 1000, isBoss: true }, foeHP: 500,
        status: 'dead', runTimeMs: 120000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
    orig('rustward-meta', JSON.stringify({ state: { bestScreen: 150, emeralds: 50 }, version: 0 }));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.death-overlay', { timeout: 8000 });
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.death-panel .panel-btn')];
    btns.find((b) => /MUNDO 3/i.test(b.textContent))
      ?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 5500)); // esperar el guardado periódico (5s)
  const raw = await page.evaluate(() => localStorage.getItem('rustward-run'));
  const parsed = JSON.parse(raw);
  console.log(JSON.stringify({ internalScreen: parsed.s.screen, status: parsed.s.status, gold: parsed.s.gold }));
} finally {
  await browser.close();
}
