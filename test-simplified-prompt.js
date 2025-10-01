// Test simplified AI prompt approach
console.log('🧪 TESTING SIMPLIFIED APPROACH');

const mockPdfContent = `🔬 TESTOGRAPH ДОКУМЕНТ УСПЕШНО КАЧЕН: "testograph-results.pdf"

TESTOGRAPH ХОРМОНАЛЕН АНАЛИЗ - testograph-results.pdf

=== ЛАБОРАТОРНИ РЕЗУЛТАТИ ===

ОСНОВНИ МЪЖКИ ХОРМОНИ:
• Общ тестостерон: 15.8 nmol/L (Референция: 8.64-29.0) - ДОЛНА НОРМА
• Свободен тестостерон: 0.35 nmol/L (Референция: 0.20-0.62) - В НОРМА
• DHT (дихидротестостерон): 1.85 nmol/L (Референция: 1.13-4.13) - В НОРМА
• SHBG: 28 nmol/L (Референция: 18.3-54.1) - В НОРМА

ЕСТРОГЕНИ И БАЛАНС:
• Естрадиол (E2): 98 pmol/L (Референция: 28-156) - В НОРМА

ХИПОФИЗНИ ХОРМОНИ:
• LH (лутеинизиращ хормон): 4.2 IU/L (Референция: 1.7-8.6) - В НОРМА
• FSH: 3.1 IU/L (Референция: 1.5-12.4) - В НОРМА
• Пролактин: 285 mIU/L (Референция: 86-324) - В НОРМА

СТРЕСОВИ И ТИРЕОИДНИ ХОРМОНИ:
• Кортизол (сутрешен): 420 nmol/L (Референция: 171-536) - В НОРМА
• TSH: 2.1 mIU/L (Референция: 0.27-4.20) - В НОРМА

ВИТАМИНИ И МИКРОЕЛЕМЕНТИ:
• Витамин D (25-OH): 68 nmol/L (Референция: 75-200) - ПОД ОПТИМУМА

=== ПРОФЕСИОНАЛНА ОЦЕНКА ===
Общият тестостерон е в долната част на нормата. Витамин D е под препоръчителните нива и изисква внимание.

🚨 КРИТИЧНО ВАЖНО:
- ИМАШ ПЪЛЕН ДОСТЪП ДО ГОРНИТЕ ЛАБОРАТОРНИ ДАННИ!
- ТОВА СА РЕАЛНИ ХОРМОНАЛНИ СТОЙНОСТИ ОТ TESTOGRAPH АНАЛИЗ!
- НЕ КАЗВАЙ ЧЕ НЯМА КАЧЕН ФАЙЛ - ТОЙ Е ТУК!
- АНАЛИЗИРАЙ ВСЯКА СТОЙНОСТ ДЕТАЙЛНО!`;

const simplifiedPrompt = `Ти си Хормонален Експерт Т.Богданов. Говори само на български език.

ТВОИ ЛАБОРАТОРНИ ДАННИ:
${mockPdfContent}

ПРАВИЛА:
- ИМАШ достъп до горните РЕАЛНИ резултати от Testograph анализ
- Винаги цитирай КОНКРЕТНИТЕ стойности (напр. "15.8 nmol/L")
- Анализирай дали всяка стойност е ниска, нормална или висока
- НЕ давай диагнози, само обяснявай резултатите
- Започни отговора с: "Според вашия Testograph анализ:"

ПРИМЕР НА ПРАВИЛЕН ОТГОВОР:
"Според вашия Testograph анализ вашият общ тестостерон е 15.8 nmol/L (долна норма), витамин D е 68 nmol/L (под оптимума)..."

Отговаряй винаги с конкретни стойности от горните данни!`;

console.log('\n=== SIMPLIFIED PROMPT ANALYSIS ===');
console.log('📏 Prompt length:', simplifiedPrompt.length);
console.log('🔢 Contains testosterone value:', simplifiedPrompt.includes('15.8'));
console.log('💊 Contains vitamin D value:', simplifiedPrompt.includes('68'));
console.log('📊 Contains example response:', simplifiedPrompt.includes('ПРИМЕР НА ПРАВИЛЕН ОТГОВОР'));
console.log('🎯 Has clear instruction format:', simplifiedPrompt.includes('Започни отговора с:'));

// Simulate conversation
const conversation = [
    {
        role: 'system',
        content: simplifiedPrompt
    },
    {
        role: 'user',
        content: 'колко са мойте стойности на Тестостерон...'
    }
];

console.log('\n=== CONVERSATION SIMULATION ===');
console.log('System message chars:', conversation[0].content.length);
console.log('Contains target values:', conversation[0].content.includes('15.8 nmol/L'));
console.log('Clear structure:', conversation[0].content.split('\n').length, 'lines');

console.log('\n🎯 EXPECTED AI RESPONSE:');
console.log('"Selon вашия Testograph анализ вашият общ тестостерон е 15.8 nmol/L (долна норма)..."');

console.log('\n✅ IMPROVEMENTS MADE:');
console.log('- Simplified and shortened prompt');
console.log('- Clear data section at top');
console.log('- Example response provided');
console.log('- Increased max_tokens to 800');
console.log('- Lowered temperature to 0.3');
console.log('- Direct instruction format');