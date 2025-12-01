import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Стартирам Playwright в mobile режим...');

  const browser = await chromium.launch({
    headless: false, // Отваря видим browser
    slowMo: 100       // Забавя действията за по-добра видимост
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X/11/12/13 Pro
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Зареждам http://localhost:3006/ в mobile режим (375x812)...');
    await page.goto('http://localhost:3006/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Страницата е заредена!');
    console.log('');
    console.log('🎯 Можеш да видиш Mobile First оптимизацията:');
    console.log('   - Компактен hero layout');
    console.log('   - Пълно видими CTA бутони');
    console.log('   - Оптимизиран spacing');
    console.log('   - Скъсено описание за mobile');
    console.log('');
    console.log('👆 Скролни надолу, за да видиш останалата част от страницата');
    console.log('');
    console.log('⏸️  Browser прозорецът ще остане отворен.');
    console.log('❌ Натисни Ctrl+C в терминала, за да затвориш browser-а.');

    // Чакаме докато потребителят не затвори процеса
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Грешка:', error.message);
    await browser.close();
  }
})();
