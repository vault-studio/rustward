// Reproduce una muerte REAL (no forzada) contra el boss de MUNDO 2, con el
// jugador debilitado a propósito (vida mínima, defensa 0) para que el boss
// lo mate en el próximo golpe de verdad — y observa, fotograma a fotograma,
// si la pantalla de muerte aparece y se queda, o si algo la resetea sola.
import puppeteer from 'puppeteer-core';

const OUT =
  'C:/Users/caffo/AppData/Local/Temp/claude/C--Users-caffo-Documents-VAULT-STUDIO-Webs-Kaggle-Wins/eec8effc-7d1f-4532-aecb-600ba35bdfc4/scratchpad';

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
  const consoleLogs = [];
  page.on('console', (m) => consoleLogs.push(`${m.type()}: ${m.text()}`));

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    // Mundo 2 (screen 100 = su boss), jugador con 1 HP, boss con vida real
    // (no ficticia) para que el combate avance de forma natural.
    const save = {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 100, gold: 500, goldEarned: 500, emeraldsRun: 3, kills: 99,
        levels: { attack: 5, defense: 0, speed: 3, luck: 0, gold: 0, emerald: 0, execution: 0 },
        playerHP: 1, foe: { kind: 'boss', maxHP: 2000, isBoss: true }, foeHP: 2000,
        status: 'playing', runTimeMs: 60000, attackTimer: 0, enemyTimer: 1150,
        advanceTimer: 0, revivedThisRun: false,
      },
    };
    const orig = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (k, v) {
      if (k === 'rustward-run') return;
      orig(k, v);
    };
    orig('rustward-run', JSON.stringify(save));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.char-wrap', { timeout: 8000 });

  // Observa cada 150ms durante 8s: ¿aparece death-overlay? ¿se queda? ¿qué
  // botones tiene en cada instante?
  const timeline = [];
  for (let t = 0; t < 8000; t += 200) {
    await new Promise((r) => setTimeout(r, 200));
    const snapshot = await page.evaluate(() => {
      const overlay = document.querySelector('.death-overlay');
      const buttons = overlay
        ? [...overlay.querySelectorAll('.panel-btn')].map((b) => b.textContent.trim())
        : null;
      return {
        deathOverlayVisible: !!overlay,
        buttons,
        screenPhase: document.querySelector('.hud-screen-num')?.textContent,
        worldName: document.querySelector('.hud-world-name')?.textContent,
        hp: document.querySelector('.hpbar.player .hpbar-text')?.textContent?.trim(),
      };
    });
    timeline.push({ t, ...snapshot });
  }

  await page.screenshot({ path: `${OUT}/repro-final-state.png` });
  console.log(JSON.stringify({ timeline, errors, consoleLogs: consoleLogs.slice(-10) }, null, 2));
} finally {
  await browser.close();
}
