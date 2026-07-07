// Verificación e2e headless con el Chrome del sistema (tiempo real, rAF vivo).
// Uso: node scripts/verify-live.mjs [url]
import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://localhost:5199/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=375,812'],
  defaultViewport: { width: 375, height: 812 },
});

try {
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.char-wrap', { timeout: 10000 });

  // Observa 12 s de juego real: flashes de daño al personaje, progreso
  // de pantalla y eventos de daño flotantes.
  const result = await page.evaluate(
    () =>
      new Promise((res) => {
        const flags = {
          charHitSightings: 0,
          enemyFlashSightings: 0,
          dmgNumbersSeen: 0,
          screenStart: document.querySelector('.hud-screen-num')?.textContent,
        };
        const poll = setInterval(() => {
          if (document.querySelector('.char-wrap.hit')) flags.charHitSightings += 1;
          if (document.querySelector('.enemy-wrap .sprite')) flags.enemyFlashSightings += 1;
          flags.dmgNumbersSeen = Math.max(
            flags.dmgNumbersSeen,
            document.querySelectorAll('.dmg').length,
          );
        }, 50);
        setTimeout(() => {
          clearInterval(poll);
          res({
            ...flags,
            screenEnd: document.querySelector('.hud-screen-num')?.textContent,
            playerHP: document.querySelector('.hpbar.player .hpbar-text')?.textContent.trim(),
          });
        }, 12000);
      }),
  );

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
