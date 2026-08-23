// Verifica: el mapa se abre como panel mecánico (no bloquea), el juego
// sigue corriendo debajo (HP/gold cambian con el mapa abierto), tap-to-
// attack sigue funcionando con el mapa abierto, y el cierre desmonta tras
// la animación.
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
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });

  // Estado ANTES de abrir el mapa
  const before = await page.evaluate(() => ({
    gold: document.querySelector('.hud-currency.gold span')?.textContent,
    enemyHpWidth: document.querySelector('.enemy-wrap .hpbar-fill')?.style.width,
    stageVisible: !!document.querySelector('.stage'),
    stageRect: document.querySelector('.stage')?.getBoundingClientRect(),
  }));

  await page.evaluate(() =>
    document.querySelector('.hud-world-btn').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );

  // Justo tras el click: ¿ya está montado con la clase is-open (o a punto)?
  await new Promise((r) => setTimeout(r, 80));
  const justOpened = await page.evaluate(() => ({
    mapClass: document.querySelector('.worldmap-inline')?.getAttribute('class'),
    stageStillThere: !!document.querySelector('.stage'),
  }));

  // Tras la animación de apertura (~500ms)
  await new Promise((r) => setTimeout(r, 550));
  await page.screenshot({ path: `${OUT}/mechanical-map-open.png` });
  const afterOpen = await page.evaluate(() => ({
    mapClass: document.querySelector('.worldmap-inline')?.getAttribute('class'),
    stageVisible: !!document.querySelector('.stage'),
    stageRect: document.querySelector('.stage')?.getBoundingClientRect(),
    charVisible: !!document.querySelector('.char-wrap'),
    enemyVisible: !!document.querySelector('.enemy-wrap'),
    hasBackdrop: !!document.querySelector('.worldmap-inline')?.closest('.overlay'),
  }));

  // ¿El juego sigue avanzando con el mapa abierto? Esperamos 3s y comparamos.
  const goldBeforeWait = await page.evaluate(
    () => document.querySelector('.hud-currency.gold span')?.textContent,
  );
  await new Promise((r) => setTimeout(r, 3000));
  const goldAfterWait = await page.evaluate(
    () => document.querySelector('.hud-currency.gold span')?.textContent,
  );
  const enemyHpAfterWait = await page.evaluate(
    () => document.querySelector('.enemy-wrap .hpbar-fill')?.style.width,
  );

  // Tap en el stage MIENTRAS el mapa sigue abierto — ¿responde?
  const stageBox = await page.evaluate(() => {
    const r = document.querySelector('.stage').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  const dmgBefore = await page.evaluate(() => document.querySelectorAll('.dmg').length);
  await page.mouse.click(stageBox.x, stageBox.y);
  await new Promise((r) => setTimeout(r, 150));
  const dmgAfter = await page.evaluate(() => document.querySelectorAll('.dmg').length);

  // Comprar una mejora MIENTRAS el mapa sigue abierto
  const attackLvlBefore = await page.evaluate(
    () => document.querySelectorAll('.upg-lvl')[0]?.textContent,
  );
  await page.evaluate(() =>
    document.querySelector('.upg')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 150));
  const attackLvlAfter = await page.evaluate(
    () => document.querySelectorAll('.upg-lvl')[0]?.textContent,
  );

  // Cerrar el mapa: comprobar animación de cierre y desmontaje final
  await page.evaluate(() =>
    document.querySelector('.map-close')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 100));
  const justClosing = await page.evaluate(
    () => document.querySelector('.worldmap-inline')?.getAttribute('class'),
  );
  await new Promise((r) => setTimeout(r, 400));
  const afterCloseAnim = await page.evaluate(() => ({
    mapStillInDom: !!document.querySelector('.worldmap-inline'),
    stageRect: document.querySelector('.stage')?.getBoundingClientRect(),
  }));
  await page.screenshot({ path: `${OUT}/mechanical-map-closed.png` });

  console.log(
    JSON.stringify(
      {
        before,
        justOpened,
        afterOpen,
        gameKeepsRunning: { goldBeforeWait, goldAfterWait, enemyHpAfterWait },
        tapWorksWithMapOpen: { dmgBefore, dmgAfter },
        buyWorksWithMapOpen: { attackLvlBefore, attackLvlAfter },
        justClosing,
        afterCloseAnim,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
