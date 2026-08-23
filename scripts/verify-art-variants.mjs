// Comprueba dron y boss (vía save plantado) + estado muerto.
// El handler `pagehide` de la app resalva su propio estado en curso al
// recargar, sobrescribiendo cualquier save plantado por localStorage —
// hay que bloquear ese write en la página moribunda antes de reload().
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

async function plantAndReload(page, save) {
  await page.evaluate((s) => {
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return; // bloquea el resave de pagehide
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(s));
  }, save);
  // reload() carga un documento nuevo: el parche vivía solo en el realm JS
  // de la página moribunda, así que la página recargada ya tiene el
  // Storage.prototype nativo intacto — no hace falta "restaurarlo".
  await page.reload({ waitUntil: 'networkidle0' });
}

try {
  const page = await browser.newPage();
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  // --- DRON (pantalla 2) ---
  await plantAndReload(page, {
    v: 1,
    savedAt: Date.now(),
    s: {
      screen: 2, gold: 20, goldEarned: 20, emeraldsRun: 0, kills: 1,
      levels: { attack: 0, defense: 0, speed: 0, luck: 0, gold: 0, emerald: 0, execution: 0 },
      playerHP: 60, foe: { kind: 'drone', maxHP: 14.2, isBoss: false }, foeHP: 14.2,
      status: 'playing', runTimeMs: 5000, attackTimer: 0, enemyTimer: 0,
      advanceTimer: 0, revivedThisRun: false,
    },
  });
  await page.waitForSelector('.enemy-wrap.drone img', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${OUT}/art-drone.png` });

  // --- BOSS (pantalla 10) ---
  await plantAndReload(page, {
    v: 1,
    savedAt: Date.now(),
    s: {
      screen: 10, gold: 20, goldEarned: 20, emeraldsRun: 0, kills: 9,
      levels: { attack: 5, defense: 4, speed: 2, luck: 1, gold: 1, emerald: 0, execution: 0 },
      playerHP: 90, foe: { kind: 'boss', maxHP: 180, isBoss: true }, foeHP: 180,
      status: 'playing', runTimeMs: 30000, attackTimer: 0, enemyTimer: 0,
      advanceTimer: 0, revivedThisRun: false,
    },
  });
  await page.waitForSelector('.enemy-wrap.boss img', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${OUT}/art-boss.png` });

  // --- MUERTO ---
  await plantAndReload(page, {
    v: 1,
    savedAt: Date.now(),
    s: {
      screen: 3, gold: 0, goldEarned: 20, emeraldsRun: 0, kills: 2,
      levels: { attack: 0, defense: 0, speed: 0, luck: 0, gold: 0, emerald: 0, execution: 0 },
      playerHP: 0, foe: { kind: 'scavenger', maxHP: 15, isBoss: false }, foeHP: 5,
      status: 'dead', runTimeMs: 20000, attackTimer: 0, enemyTimer: 0,
      advanceTimer: 0, revivedThisRun: false,
    },
  });
  await page.waitForSelector('.char-wrap.dead img', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: `${OUT}/art-dead.png` });

  console.log('done');
} finally {
  await browser.close();
}
