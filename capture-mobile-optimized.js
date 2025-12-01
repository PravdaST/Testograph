import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X/11/12/13 Pro
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Зареждам страницата...');
    await page.goto('http://localhost:3006/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for hero section to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Small delay for animations
    await page.waitForTimeout(2000);

    console.log('📸 Правя screenshot на hero секцията...');
    await page.screenshot({
      path: 'mobile-hero-optimized.png',
      fullPage: false // Only visible viewport
    });

    console.log('✅ Screenshot запазен като mobile-hero-optimized.png');

  } catch (error) {
    console.error('❌ Грешка:', error.message);
  } finally {
    await browser.close();
  }
})();
