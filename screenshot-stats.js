import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3006');
  await page.waitForTimeout(3000); // Wait for animations

  // Find the stats card
  const statsCard = await page.locator('.lg\\:col-span-4.lg\\:row-span-2').first();

  // Take screenshot
  await statsCard.screenshot({ path: 'stats-card-screenshot.png' });

  console.log('Screenshot saved to stats-card-screenshot.png');

  await browser.close();
})();
