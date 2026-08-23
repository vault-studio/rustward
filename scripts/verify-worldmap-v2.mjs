// Verifica el mapa de mundo v2: imagen real, camino curvo, zonas de boss,
// auto-scroll a la fase actual, coincidencia matemática de estados.
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
      orig('rustward-meta', JSON.stringify({ state: m, version: 0 }));
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
  const failed = [];
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });

  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());

  // Screen 23: fase 3 (ceil(23/10)=3), pantalla 3 dentro de fase.
  // bestScreen 34: fase 1 y 2 completas (bosses en 10 y 20 superados),
  // fase 3 en curso (boss en 30 aún no).
  await plantAndReload(
    page,
    {
      v: 1,
      savedAt: Date.now(),
      s: {
        screen: 23, gold: 300, goldEarned: 300, emeraldsRun: 2, kills: 20,
        levels: { attack: 6, defense: 5, speed: 3, luck: 2, gold: 1, emerald: 1, execution: 0 },
        playerHP: 80, foe: { kind: 'scavenger', maxHP: 999999, isBoss: false }, foeHP: 999999,
        status: 'playing', runTimeMs: 60000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    },
    { bestScreen: 34, emeralds: 40, language: 'es' },
  );

  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
  await page.evaluate(() =>
    document
      .querySelector('.hud-world-btn')
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/worldmap-v2-top.png` });

  const info = await page.evaluate(() => {
    const zones = [...document.querySelectorAll('.worldmap-zone')];
    return {
      worldName: document.querySelector('.map-title')?.textContent,
      zoneCount: zones.length,
      zoneStatuses: zones.map((z) => z.className),
      pathCount: document.querySelectorAll('.worldmap-path').length,
      pathStatuses: [...document.querySelectorAll('.worldmap-path')].map((p) => p.className.baseVal),
      dotCount: document.querySelectorAll('.worldmap-dot').length,
      doneDots: document.querySelectorAll('.worldmap-dot.done').length,
      currentDots: document.querySelectorAll('.worldmap-dot.current').length,
      lockedDots: document.querySelectorAll('.worldmap-dot.locked').length,
      scrollTop: document.querySelector('.worldmap-scroll')?.scrollTop,
      imgSrc: document.querySelector('.worldmap-img')?.getAttribute('src'),
    };
  });

  // Scroll manual hasta abajo para ver la fase 5 (zona granero) también.
  await page.evaluate(() => {
    const el = document.querySelector('.worldmap-scroll');
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${OUT}/worldmap-v2-bottom.png` });

  console.log(JSON.stringify({ info, failed, errors }, null, 2));
} finally {
  await browser.close();
}
