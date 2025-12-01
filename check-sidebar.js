import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to a learn article
  await page.goto('http://localhost:3006/learn/lifestyle/stresat-mazko-zdrave');
  await page.waitForTimeout(3000); // Wait for content to load

  // Take screenshot of the sidebar
  const sidebar = await page.locator('aside').first();
  await sidebar.screenshot({ path: 'sidebar-screenshot.png' });

  console.log('Screenshot saved to sidebar-screenshot.png');

  // Keep browser open to inspect
  await page.waitForTimeout(10000);

  await browser.close();
})();
