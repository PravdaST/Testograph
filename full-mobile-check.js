import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    console.log('📱 Зареждам страницата...');
    await page.goto('http://localhost:3006/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    console.log('📝 Fonts loaded');

    await page.waitForTimeout(3000);

    // Full page screenshot
    console.log('📸 Правя full page screenshot...');
    await page.screenshot({
      path: 'mobile-full-page.png',
      fullPage: true
    });

    console.log('✅ Full page screenshot: mobile-full-page.png');

    // Hero viewport only
    await page.screenshot({
      path: 'mobile-viewport-hero.png',
      fullPage: false
    });

    console.log('✅ Hero viewport screenshot: mobile-viewport-hero.png');

  } catch (error) {
    console.error('❌ Грешка:', error.message);
  } finally {
    await browser.close();
  }
})();
