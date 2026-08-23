import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=375,812'],
  defaultViewport: { width: 375, height: 812 },
});
const page = await browser.newPage();
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
await page.waitForSelector('.hud-world-btn', { timeout: 8000 });
await page.evaluate(() =>
  document
    .querySelector('.hud-world-btn')
    .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
);
await new Promise((r) => setTimeout(r, 400));
const overflow = await page.evaluate(() => ({
  bodyScrollWidth: document.body.scrollWidth,
  viewportWidth: window.innerWidth,
  overflow: document.body.scrollWidth > window.innerWidth,
}));
console.log(JSON.stringify(overflow));
await browser.close();
