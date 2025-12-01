import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  console.log('📱 Opening homepage on iPhone X viewport (375x812)...');
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(3000);

  console.log('✅ Homepage loaded! Scroll to see the full page...');
  console.log('');
  console.log('🔍 Browser will stay open for 2 minutes for inspection');
  console.log('   - Check hero section');
  console.log('   - Check button layouts');
  console.log('   - Check card spacing');
  console.log('   - Test scrolling');
  console.log('');

  // Keep browser open for 2 minutes
  await page.waitForTimeout(120000);

  await browser.close();
  console.log('Done!');
})();
