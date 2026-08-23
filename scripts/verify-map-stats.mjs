// Verifica el HUD Mundo/Fase, el mapa desplegable y el panel de stats.
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

async function plantAndReload(page, save, meta) {
  await page.evaluate(
    (s, m) => {
      const orig = localStorage.setItem.bind(localStorage);
      Storage.prototype.setItem = function (k, v) {
        if (k === 'rustward-run') return;
        orig(k, v);
      };
      orig('rustward-run', JSON.stringify(s));
      if (m) {
        const existing = JSON.parse(localStorage.getItem('rustward-meta') || '{}');
        existing.state = { ...(existing.state || {}), ...m };
        existing.version = existing.version ?? 0;
        orig('rustward-meta', JSON.stringify(existing));
      }
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
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  // Screen 47: mundo 1 (fases 1-15 = screens 1-150), fase = ceil(47/10) = 5,
  // screenInPhase = 47 % 10 = 7. bestScreen alto para ver dorado en el mapa.
  await plantAndReload(
    page,
    {
      v: 1,
      savedAt: Date.now(),
      s: {
        screen: 47, gold: 500, goldEarned: 500, emeraldsRun: 3, kills: 40,
        levels: { attack: 8, defense: 6, speed: 4, luck: 2, gold: 2, emerald: 1, execution: 1 },
        playerHP: 90, foe: { kind: 'scavenger', maxHP: 20, isBoss: false }, foeHP: 20,
        status: 'playing', runTimeMs: 90000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    },
    { bestScreen: 83, emeralds: 25 },
  );

  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: `${OUT}/hud-phase.png` });

  const hudInfo = await page.evaluate(() => ({
    world: document.querySelector('.hud-world-name')?.textContent,
    phaseLabel: document.querySelector('.hud-screen-label')?.textContent,
    phaseNum: document.querySelector('.hud-screen-num')?.textContent,
    progress: document.querySelector('.hud-boss-progress')?.textContent,
  }));

  // Abrir mapa de mundo
  await page.evaluate(() =>
    document.querySelector('.hud-world-btn').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    ),
  );
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: `${OUT}/world-map.png` });

  const mapInfo = await page.evaluate(() => {
    const phases = document.querySelectorAll('.map-phase');
    const current = document.querySelector('.map-phase.is-current');
    return {
      phaseCount: phases.length,
      hasCurrent: !!current,
      currentNum: current?.querySelector('.map-phase-num')?.textContent,
      doneDots: document.querySelectorAll('.map-dot.done').length,
      currentDots: document.querySelectorAll('.map-dot.current').length,
      lockedDots: document.querySelectorAll('.map-dot.locked').length,
      doneBossDots: document.querySelectorAll('.map-boss-dot.done').length,
      trackBg: document.querySelector('.map-track')?.style.backgroundImage?.slice(0, 30),
    };
  });

  // Cerrar mapa, abrir stats
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
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: `${OUT}/stats-panel.png` });

  const statsInfo = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('.stats-row')].map((r) => ({
      label: r.querySelector('.stats-label')?.textContent,
      value: r.querySelector('.stats-value')?.textContent,
      note: r.querySelector('.stats-note')?.textContent ?? null,
    })),
  }));

  console.log(JSON.stringify({ hudInfo, mapInfo, statsInfo, errors }, null, 2));
} finally {
  await browser.close();
}
