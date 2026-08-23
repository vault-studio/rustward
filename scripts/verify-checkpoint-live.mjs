// Verifica en el navegador real: morir contra un boss de FASE checkpointea
// (vida a tope, oro/niveles intactos, sin pantalla de muerte); morir contra
// el boss de MUNDO sí muestra la pantalla de muerte / reinicio.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

async function plantAndReload(page, save) {
  await page.evaluate((s) => {
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(s));
  }, save);
  await page.reload({ waitUntil: 'networkidle0' });
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  // --- Boss de FASE (screen 20, boss2 — NO es boss de mundo) casi muerto,
  // jugador con 1 HP para que el próximo golpe del boss lo mate.
  await plantAndReload(page, {
    v: 1, savedAt: Date.now(),
    s: {
      screen: 20, gold: 500, goldEarned: 500, emeraldsRun: 1, kills: 19,
      levels: { attack: 5, defense: 0, speed: 3, luck: 0, gold: 0, emerald: 0, execution: 0 },
      playerHP: 1, foe: { kind: 'boss', maxHP: 99999, isBoss: true }, foeHP: 99999,
      status: 'playing', runTimeMs: 30000, attackTimer: 0, enemyTimer: 1150,
      advanceTimer: 0, revivedThisRun: false,
    },
  });
  await page.waitForSelector('.char-wrap', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 1600)); // esperar a que el boss golpee

  const phaseBossResult = await page.evaluate(() => ({
    deathScreenShown: !!document.querySelector('.death-overlay'),
    screen: document.querySelector('.hud-screen-num')?.textContent,
    progress: document.querySelector('.hud-boss-progress')?.textContent,
    gold: document.querySelector('.hud-currency.gold span')?.textContent,
    attackLvl: document.querySelectorAll('.upg-lvl')[0]?.textContent,
    hp: document.querySelector('.hpbar.player .hpbar-text')?.textContent.trim(),
  }));

  // --- Boss de MUNDO (screen 50) casi muerto, jugador con 1 HP.
  await plantAndReload(page, {
    v: 1, savedAt: Date.now(),
    s: {
      screen: 50, gold: 300, goldEarned: 300, emeraldsRun: 4, kills: 49,
      levels: { attack: 8, defense: 3, speed: 4, luck: 1, gold: 1, emerald: 0, execution: 0 },
      playerHP: 1, foe: { kind: 'boss', maxHP: 99999, isBoss: true }, foeHP: 99999,
      status: 'playing', runTimeMs: 90000, attackTimer: 0, enemyTimer: 1150,
      advanceTimer: 0, revivedThisRun: false,
    },
  });
  await page.waitForSelector('.char-wrap', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 1600));

  const worldBossResult = await page.evaluate(() => ({
    deathScreenShown: !!document.querySelector('.death-overlay'),
    screenReachedStat: document.querySelector('.panel-stats dd')?.textContent,
  }));

  console.log(JSON.stringify({ phaseBossResult, worldBossResult, errors }, null, 2));
} finally {
  await browser.close();
}
