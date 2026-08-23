// Verifica que al matar un bicho aparece un flotante de oro (icono +N) que
// desaparece pasado un rato, igual que los números de daño.
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
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
    // enemigo muy débil para forzar un kill rápido y observable
    const save = {
      v: 1,
      savedAt: Date.now(),
      s: {
        screen: 1, gold: 0, goldEarned: 0, emeraldsRun: 0, kills: 0,
        levels: { attack: 5, defense: 0, speed: 3, luck: 0, gold: 0, emerald: 0, execution: 0 },
        playerHP: 60, foe: { kind: 'scavenger', maxHP: 3, isBoss: false }, foeHP: 3,
        status: 'playing', runTimeMs: 0, attackTimer: 0, enemyTimer: 0,
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

  // Sondea cada 60ms durante 1.2s buscando el flotante de oro y confirmando
  // que luego desaparece (mismo ciclo de vida que el daño, LIFETIME_MS=900).
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const seen = { goldFloatAppeared: false, hadIcon: false, textSample: null };
        let goldGoneAfterAppear = null;
        let appearedAt = null;
        const poll = setInterval(() => {
          const goldEl = document.querySelector('.dmg-gold');
          if (goldEl && !seen.goldFloatAppeared) {
            seen.goldFloatAppeared = true;
            seen.hadIcon = !!goldEl.querySelector('svg');
            seen.textSample = goldEl.textContent;
            appearedAt = performance.now();
          }
          if (appearedAt && goldGoneAfterAppear === null && performance.now() - appearedAt > 1000) {
            goldGoneAfterAppear = !document.querySelector('.dmg-gold');
            clearInterval(poll);
            resolve({ ...seen, goldGoneAfterAppear });
          }
        }, 40);
        setTimeout(() => {
          clearInterval(poll);
          resolve({ ...seen, goldGoneAfterAppear, timedOut: true });
        }, 3000);
      }),
  );

  await page.screenshot({ path: `${OUT}/gold-float.png` });
  console.log(JSON.stringify({ result, errors }, null, 2));
} finally {
  await browser.close();
}
