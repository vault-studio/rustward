// Reproduce el reporte: Mundo 2, fase en curso (boss aún no alcanzado en
// este intento), comprueba que el camino se ve (opacidad/color visibles).
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

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    // Mundo2 (screens 51-100), fase3 (screens 71-80), en curso: screen75,
    // bestScreen tambien 75 (nunca llegaste al boss screen80 de esta fase).
    const save = {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 75, gold: 200, goldEarned: 200, emeraldsRun: 0, kills: 74,
        levels: { attack: 8, defense: 4, speed: 3, luck: 1, gold: 1, emerald: 0, execution: 0 },
        playerHP: 60, foe: { kind: 'scavenger', maxHP: 999999, isBoss: false }, foeHP: 999999,
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
    orig('rustward-meta', JSON.stringify({ state: { bestScreen: 75, emeralds: 10 }, version: 0 }));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
  await page.evaluate(() =>
    document.querySelector('.hud-world-btn').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/path-visibility-fixed.png` });

  const pathInfo = await page.evaluate(() => {
    const path = document.querySelector('.worldmap-path');
    const style = getComputedStyle(path);
    return {
      className: path.getAttribute('class'),
      stroke: style.stroke,
      opacity: style.opacity,
    };
  });

  console.log(JSON.stringify({ pathInfo, errors }, null, 2));
} finally {
  await browser.close();
}
