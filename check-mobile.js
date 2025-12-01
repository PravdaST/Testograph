import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  console.log('Opening homepage on mobile viewport...');
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(3000);

  console.log('Taking screenshot of homepage mobile view...');
  await page.screenshot({ path: 'homepage-mobile.png', fullPage: true });

  console.log('Opening /learn page...');
  await page.goto('http://localhost:3006/learn');
  await page.waitForTimeout(3000);

  console.log('Taking screenshot of /learn mobile view...');
  await page.screenshot({ path: 'learn-mobile.png', fullPage: true });

  console.log('Screenshots saved! Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('Done!');
})();
