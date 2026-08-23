// Verifica en vivo: pantalla de muerte al morir contra el boss de mundo 3
// (debe mostrar Revivir + Mundo 3 + Primer Mundo), y que cada botón hace
// lo que promete. También verifica la tienda meta (números, no %).
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

  // Muerte en el boss de MUNDO 3 (screen150) — status ya 'dead'.
  await plantAndReload(
    page,
    {
      v: 1, savedAt: Date.now(),
      s: {
        screen: 150, gold: 200, goldEarned: 300, emeraldsRun: 3, kills: 149,
        levels: { attack: 10, defense: 5, speed: 3, luck: 1, gold: 1, emerald: 0, execution: 0 },
        playerHP: 0, foe: { kind: 'boss', maxHP: 1000, isBoss: true }, foeHP: 500,
        status: 'dead', runTimeMs: 120000, attackTimer: 0, enemyTimer: 0,
        advanceTimer: 0, revivedThisRun: false,
      },
    },
    { bestScreen: 150, emeralds: 50 },
  );
  await page.waitForSelector('.death-overlay', { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${OUT}/death-world3.png` });

  const deathInfo = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.death-panel .panel-btn')].map(
      (b) => b.textContent.trim(),
    );
    return { buttons };
  });

  // Pulsar "MUNDO 3" (segundo botón normalmente, tras Revivir) y comprobar
  // que el screen queda en 101 (inicio del mundo3), gold/niveles a 0.
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.death-panel .panel-btn')];
    const worldBtn = btns.find((b) => /MUNDO 3|WORLD 3/i.test(b.textContent));
    worldBtn?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 300));
  const afterWorldRestart = await page.evaluate(() => ({
    screen: document.querySelector('.hud-screen-num')?.textContent,
    worldName: document.querySelector('.hud-world-name')?.textContent,
    gold: document.querySelector('.hud-currency.gold span')?.textContent,
    attackLvl: document.querySelectorAll('.upg-lvl')[0]?.textContent,
    deathScreenGone: !document.querySelector('.death-overlay'),
  }));

  // Abrir tienda meta y comprobar que muestra números, no %.
  await page.evaluate(() =>
    document.querySelector('.shop-btn')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 300));
  const metaRows = await page.evaluate(() =>
    [...document.querySelectorAll('.meta-row')].map((r) => ({
      name: r.querySelector('.meta-name')?.textContent.trim(),
      desc: r.querySelector('.meta-desc')?.textContent.trim(),
    })),
  );
  await page.screenshot({ path: `${OUT}/meta-shop-numbers.png` });

  console.log(JSON.stringify({ deathInfo, afterWorldRestart, metaRows, errors }, null, 2));
} finally {
  await browser.close();
}
