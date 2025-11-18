import { chromium } from 'playwright';

async function openPages() {
  console.log('Opening browser...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();

  // Open guide page
  const guidePage = await context.newPage();
  console.log('Opening guide page...');
  await guidePage.goto('http://localhost:3000/learn/testosterone/testosteron-guide-za-mizhe');
  await guidePage.waitForLoadState('networkidle');

  // Wait a bit to see the page
  await guidePage.waitForTimeout(2000);

  // Open listing page in new tab
  const listingPage = await context.newPage();
  console.log('Opening listing page...');
  await listingPage.goto('http://localhost:3000/learn');
  await listingPage.waitForLoadState('networkidle');

  console.log('✅ Pages opened successfully!');
  console.log('Browser will stay open for inspection. Press Ctrl+C to close.');

  // Keep the browser open
  await new Promise(() => {});
}

openPages().catch(console.error);
