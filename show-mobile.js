import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  console.log('📱 Opening mobile view (iPhone X - 375x812)...');
  await page.goto('http://localhost:3006');

  console.log('');
  console.log('✅ Browser is open!');
  console.log('');
  console.log('🔍 Scroll down to see all sections:');
  console.log('   - Hero section');
  console.log('   - Stats card');
  console.log('   - Navigation bar');
  console.log('   - Button touch areas');
  console.log('');
  console.log('⏰ Browser will stay open for 5 minutes for inspection');
  console.log('');

  // Keep open for 5 minutes
  await page.waitForTimeout(300000);

  await browser.close();
  console.log('Done!');
})();
