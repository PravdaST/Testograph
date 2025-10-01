// Comprehensive debugging script to track PDF data flow
console.log('🔍 DEBUGGING PDF DATA FLOW');

// Simulate the exact data flow from our Edge Functions
const mockSessionData = {
  id: 'test-session-123',
  email: 'test@example.com',
  pdf_filename: 'testograph-results.pdf',
  pdf_content: `TESTOGRAPH ХОРМОНАЛЕН АНАЛИЗ - testograph-results.pdf

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
Общият тестостерон е в долната част на нормата. Витамин D е под препоръчителните нива и изисква внимание.`
};

// Test 1: Check if data exists
console.log('\n=== TEST 1: DATA VALIDATION ===');
console.log('✅ Session ID exists:', !!mockSessionData.id);
console.log('✅ PDF filename exists:', !!mockSessionData.pdf_filename);
console.log('✅ PDF content exists:', !!mockSessionData.pdf_content);
console.log('📊 PDF content length:', mockSessionData.pdf_content.length);

// Test 2: Check content parsing
console.log('\n=== TEST 2: CONTENT PARSING ===');
const hasTestosteronData = mockSessionData.pdf_content.includes('тестостерон');
const hasHormoneValues = mockSessionData.pdf_content.includes('15.8 nmol/L');
const hasReferences = mockSessionData.pdf_content.includes('Референция');

console.log('🔬 Contains testosterone data:', hasTestosteronData);
console.log('📊 Contains hormone values:', hasHormoneValues);
console.log('📋 Contains references:', hasReferences);

// Test 3: Simulate hasPdfContent logic
console.log('\n=== TEST 3: LOGIC SIMULATION ===');
const sessionWithPdf = mockSessionData;
let hasPdfContent = false;
let pdfAnalysisInfo = 'Още не са качени резултати...';

if (sessionWithPdf && sessionWithPdf.pdf_content && sessionWithPdf.pdf_filename) {
    hasPdfContent = true;
    pdfAnalysisInfo = `🔬 TESTOGRAPH ДОКУМЕНТ УСПЕШНО КАЧЕН: "${sessionWithPdf.pdf_filename}"

${sessionWithPdf.pdf_content}

🚨 КРИТИЧНО ВАЖНО:
- ИМАШ ПЪЛЕН ДОСТЪП ДО ГОРНИТЕ ЛАБОРАТОРНИ ДАННИ!
- ТОВА СА РЕАЛНИ ХОРМОНАЛНИ СТОЙНОСТИ ОТ TESTOGRAPH АНАЛИЗ!
- НЕ КАЗВАЙ ЧЕ НЯМА КАЧЕН ФАЙЛ - ТОЙ Е ТУК!
- АНАЛИЗИРАЙ ВСЯКА СТОЙНОСТ ДЕТАЙЛНО!`;
}

console.log('🤖 hasPdfContent flag:', hasPdfContent);
console.log('📄 pdfAnalysisInfo length:', pdfAnalysisInfo.length);
console.log('🔍 Analysis info includes testosterone:', pdfAnalysisInfo.includes('15.8'));

// Test 4: System prompt construction
console.log('\n=== TEST 4: SYSTEM PROMPT SIMULATION ===');
const systemPrompt = `Ти си Хормонален Експерт Т.Богданов - виртуален AI коуч и експерт ендокринолог.

## НАЛИЧНИ РЕЗУЛТАТИ ОТ АНАЛИЗА
${pdfAnalysisInfo}

## ПРАВИЛА
${hasPdfContent ? '⚠️ ВНИМАНИЕ: ИМАШ ДОСТЪП ДО РЕАЛНИ TESTOGRAPH ДАННИ!' : 'НЯМА PDF'}`;

console.log('🚀 System prompt includes values:', systemPrompt.includes('15.8'));
console.log('📋 System prompt includes critical warning:', systemPrompt.includes('КРИТИЧНО ВАЖНО'));
console.log('🔍 System prompt total length:', systemPrompt.length);

// Test 5: Extract specific values for verification
console.log('\n=== TEST 5: VALUE EXTRACTION ===');
const testosteronMatch = mockSessionData.pdf_content.match(/Общ тестостерон: ([\d.]+) nmol\/L/);
const vitaminDMatch = mockSessionData.pdf_content.match(/Витамин D.*?: (\d+) nmol\/L/);

if (testosteronMatch) {
    console.log('🎯 Found testosterone value:', testosteronMatch[1], 'nmol/L');
} else {
    console.log('❌ Could not extract testosterone value');
}

if (vitaminDMatch) {
    console.log('🎯 Found vitamin D value:', vitaminDMatch[1], 'nmol/L');
} else {
    console.log('❌ Could not extract vitamin D value');
}

// Test 6: Simulate AI message construction
console.log('\n=== TEST 6: AI MESSAGE SIMULATION ===');
const conversationMessages = [
    {
        role: 'system',
        content: systemPrompt
    },
    {
        role: 'user',
        content: 'колко са мойте стойности на Тестостерон...'
    }
];

console.log('📤 Messages to be sent to AI:');
console.log('- System message length:', conversationMessages[0].content.length);
console.log('- User message:', conversationMessages[1].content);
console.log('- System includes testosterone data:', conversationMessages[0].content.includes('15.8'));

console.log('\n🔥 SUMMARY:');
console.log('All data looks correct. The issue might be:');
console.log('1. AI model not following instructions properly');
console.log('2. System prompt too complex/long');
console.log('3. Need more explicit instructions for AI');
console.log('4. Max tokens too low (current: 500)');