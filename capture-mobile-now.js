import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  await page.goto('http://localhost:3006');
  await page.waitForTimeout(3000);

  // Take full page screenshot
  await page.screenshot({ path: 'mobile-current-full.png', fullPage: true });

  // Take viewport screenshot
  await page.screenshot({ path: 'mobile-current-viewport.png' });

  console.log('Screenshots saved!');

  await page.waitForTimeout(5000);
  await browser.close();
})();
