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
  await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
  await page.evaluate(() =>
    document
      .querySelector('.hud-world-btn')
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
  );
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/worldmap-fixed.png` });

  const info = await page.evaluate(() => {
    const scroll = document.querySelector('.worldmap-scroll');
    const path = document.querySelector('.worldmap-path.current');
    const start = document.querySelector('.worldmap-start');
    return {
      clientWidth: scroll.clientWidth,
      offsetWidth: scroll.offsetWidth,
      scrollbarGutter: scroll.offsetWidth - scroll.clientWidth, // ~2 si son solo los 2 bordes de 1px
      pathStroke: path ? getComputedStyle(path).stroke : null,
      startBg: start ? getComputedStyle(start).backgroundColor : null,
    };
  });

  console.log(JSON.stringify({ info, errors }, null, 2));
} finally {
  await browser.close();
}
