// Verificación puntual del arte pintado (personaje/enemigos): assets 200,
// tamaño natural correcto y capturas del ciclo de andar en dos instantes.
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

try {
  const page = await browser.newPage();
  const failed = [];
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.char-wrap img', { timeout: 10000 });

  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT}/art-1.png` });
  await new Promise((r) => setTimeout(r, 320));
  await page.screenshot({ path: `${OUT}/art-2.png` });

  const info = await page.evaluate(() => {
    const charImg = document.querySelector('.char-wrap img');
    const enemyImg = document.querySelector('.enemy-wrap .sprite img');
    return {
      charSrc: charImg?.getAttribute('src'),
      charNatural: charImg ? [charImg.naturalWidth, charImg.naturalHeight] : null,
      enemySrc: enemyImg?.getAttribute('src'),
      enemyWrapClass: document.querySelector('.enemy-wrap')?.className,
      hasCharShadow: !!document.querySelector('.char-shadow'),
      hasEnemyShadow: !!document.querySelector('.enemy-shadow'),
    };
  });

  console.log(JSON.stringify({ info, failed }, null, 2));
} finally {
  await browser.close();
}
