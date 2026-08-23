// Verifica: morir contra un enemigo NORMAL (no boss) o un boss de FASE ahora
// también muestra la pantalla de elección (Revivir / Mundo X / Primer
// Mundo), y el juego NO se reagrupa solo.
import puppeteer from 'puppeteer-core';

const OUT =
  'C:/Users/caffo/AppData/Local/Temp/claude/C--Users-caffo-Documents-VAULT-STUDIO-Webs-Kaggle-Wins/eec8effc-7d1f-4532-aecb-600ba35bdfc4/scratchpad';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=390,844'],
  defaultViewport: { width: 390, height: 844 },
});

async function plantAndReload(page, save, meta) {
  await page.evaluate(
    (s, m) => {
      const orig = localStorage.setItem.bind(localStorage);
      Storage.prototype.setItem = function (k, v) {
        if (k === 'rustward-run') return;
        orig(k, v);
      };
      orig('rustward-run', JSON.stringify(s));
      if (m) orig('rustward-meta', JSON.stringify({ state: m, version: 0 }));
    },
    save,
    meta,
  );
  await page.reload({ waitUntil: 'networkidle0' });
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  // Screen 5 = enemigo NORMAL en Mundo 1, Fase 1 (no es boss, BOSS_EVERY=10).
  // playerHP=1 y status='playing': el próximo golpe del bicho debe matar.
  await plantAndReload(
    page,
    {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 5, gold: 20, goldEarned: 20, emeraldsRun: 0, kills: 4,
        levels: { attack: 0, defense: 0, speed: 0, luck: 0, gold: 0, emerald: 0, execution: 0 },
        playerHP: 1, foe: { kind: 'grunt', maxHP: 100, isBoss: false }, foeHP: 100,
        status: 'playing', runTimeMs: 30000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    },
    { bestScreen: 5, emeralds: 10 },
  );

  // Esperar suficiente para que el enemigo golpee y mate al jugador.
  await new Promise((r) => setTimeout(r, 2500));
  const afterHit = await page.evaluate(() => ({
    deathOverlay: !!document.querySelector('.death-overlay'),
    screen: document.querySelector('.hud-screen-num')?.textContent,
    buttons: [...document.querySelectorAll('.death-panel .panel-btn')].map((b) =>
      b.textContent.trim(),
    ),
  }));
  await page.screenshot({ path: `${OUT}/death-normal-enemy.png` });

  // Screen 60 = boss de FASE en Mundo 2 (fin de fase1, no el boss final de
  // mundo, que sería screen 100). Debe mostrar también Revivir/Mundo2/Primer
  // Mundo, y NO reagrupar sola en la fase.
  await page.evaluate(() => localStorage.clear());
  await plantAndReload(
    page,
    {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 60, gold: 500, goldEarned: 800, emeraldsRun: 2, kills: 59,
        levels: { attack: 5, defense: 2, speed: 1, luck: 0, gold: 0, emerald: 0, execution: 0 },
        playerHP: 1, foe: { kind: 'boss', maxHP: 600, isBoss: true }, foeHP: 300,
        status: 'playing', runTimeMs: 90000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    },
    { bestScreen: 60, emeralds: 30 },
  );
  await new Promise((r) => setTimeout(r, 2500));
  const afterPhaseBossHit = await page.evaluate(() => ({
    deathOverlay: !!document.querySelector('.death-overlay'),
    screen: document.querySelector('.hud-screen-num')?.textContent,
    buttons: [...document.querySelectorAll('.death-panel .panel-btn')].map((b) =>
      b.textContent.trim(),
    ),
  }));
  await page.screenshot({ path: `${OUT}/death-phase-boss.png` });

  console.log(JSON.stringify({ afterHit, afterPhaseBossHit, errors }, null, 2));
} finally {
  await browser.close();
}
