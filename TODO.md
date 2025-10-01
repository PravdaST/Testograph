# TODO List - Testograph Chat Assistant Fixes

## 🚨 Критични проблеми

### 1. ACTION_BUTTON не се визуализира в чата
**Проблем:** AI-ят не генерира ACTION_BUTTON синтакс за безплатния анализ при general въпроси

**Причина:** Промените в системния промпт са направени локално, но **НЕ СА deploy-нати** към Supabase Edge Function

**Решение:**
```bash
cd D:\Automation\Testograph\testo-insight
npx supabase functions deploy chat-assistant
```

**Файл с промени:** `supabase/functions/chat-assistant/index.ts` (редове 351-373)

**Какво направихме:**
- Добавена секция "6. ДВАТА ПРОДУКТА - КОГА КОЙ ДА ПРЕПОРЪЧАШ"
- Ясни инструкции за безплатен анализ при симптоми БЕЗ PDF
- Ясни инструкции за платена програма след анализ на PDF

**Тестване след deploy:**
1. Отвори чата
2. Напиши: "имам пъпки по гърба"
3. Очакван резултат: AI-ът трябва да даде кратък съвет + ACTION_BUTTON бутон за безплатен анализ

---

### 2. Lovable линкове в кода
**Проблем:** Има hardcoded Lovable upload пътища които може да не работят в production

**Засегнати файлове:**

#### `index.html`
- **Ред 10:** `msapplication-TileImage` сочи към `/lovable-uploads/490334c5-823a-47c0-b4ff-9fb6112ee0ee.png`
- **Ред 23:** Twitter meta tag има `@lovable_dev`

#### `src/pages/Index.tsx`
- **Ред 44:** Logo: `/lovable-uploads/7f610a27-06bc-4bf8-9951-7f52e40688ba.png`
- **Ред 163:** Hero image: `/lovable-uploads/2bcd22a3-0894-400b-950c-c10f8b23bb76.png`

**Решение:**

**Опция 1: Замени с правилни asset пътища**
```tsx
// В Index.tsx
- <img src="/lovable-uploads/7f610a27-..."
+ <img src="/assets/logo.png"

- <img src="/lovable-uploads/2bcd22a3-..."
+ <img src="/assets/hero-image.png"
```

**Опция 2: Провери дали файловете съществуват**
```bash
cd D:\Automation\Testograph\testo-insight
ls public/lovable-uploads/
```
Резултат: Файловете **СЪЩЕСТВУВАТ** в `public/lovable-uploads/`, така че текущите пътища **СА ВАЛИДНИ**

**Препоръка:**
- Ако работи в production → **НЕ ПРОМЕНЯЙ**
- Ако има проблеми → Премести файловете в `/public/assets/` и обнови пътищата

---

### 3. Twitter meta tag с @lovable_dev
**Проблем:** Twitter site tag сочи към `@lovable_dev` вместо твоя brand

**Файл:** `index.html` (ред 23)

**Решение:**
```html
<!-- Стар код -->
<meta name="twitter:site" content="@lovable_dev" />

<!-- Нов код -->
<meta name="twitter:site" content="@testograph" />
<!-- ИЛИ премахни напълно ако нямаш Twitter -->
```

---

## ✅ Работещи компоненти (не пипай!)

### Frontend button rendering
**Файл:** `src/components/ChatAssistant.tsx`

- **Редове 19-33:** `parseFormattedMessage()` - работи перфектно
- **Редове 537-552:** Button visualization - работи перфектно
- **Ред 21:** Regex pattern `/\[ACTION_BUTTON:([^:]+):([^\]]+)\]/g` - правилен

**Не променяй нищо тук!** Frontend-ът е готов, проблемът е в backend промпта.

---

## 📋 Следващи стъпки (по приоритет)

### Приоритет 1: Deploy промените
```bash
# 1. Login в Supabase (ако не си logged in)
npx supabase login

# 2. Deploy функцията
npx supabase functions deploy chat-assistant

# 3. Тества
# Отвори сайта и тествай с въпрос за симптоми
```

### Приоритет 2: Фиксни Twitter meta tag
```bash
# Редактирай index.html ред 23
# Замени @lovable_dev с твоя Twitter handle или премахни
```

### Приоритет 3: (Опционално) Провери Lovable assets
```bash
# Само ако има проблеми в production
# Провери дали сайтът зарежда правилно всички изображения
# Ако не - премести в /public/assets/ и обнови пътищата
```

---

## 🔍 Инспекция на рендериране

### Как да тестваш ACTION_BUTTON
1. Отвори Developer Tools (F12)
2. Напиши в чата: "имам пъпки"
3. Виж в Console дали има грешки
4. Инспектирай HTML на съобщението от асистента
5. Търси за `<button>` елемент с класове `bg-primary/10` и `border-primary/30`

### Очакван HTML след fix:
```html
<div class="max-w-[85%] p-3 rounded-lg bg-muted">
  <p class="text-sm">Съвети за пъпките...</p>
  <div class="mt-3 flex flex-wrap gap-2">
    <button class="text-xs bg-primary/10 hover:bg-primary/20 border-primary/30">
      <svg>...</svg> <!-- ExternalLink icon -->
      Направи безплатен анализ
    </button>
  </div>
</div>
```

---

## 📝 Забележки

### Защо frontend-ът е OK?
- `parseFormattedMessage()` вече parse-ва правилно `[ACTION_BUTTON:Label:URL]`
- Regex-ът е правилен: `/\[ACTION_BUTTON:([^:]+):([^\]]+)\]/g`
- Button rendering с `ExternalLink` иконка работи

### Къде е истинският проблем?
- Backend AI prompt не генерира ACTION_BUTTON формат при general въпроси
- Промените са направени локално в `index.ts` но не са deploy-нати
- След deploy всичко ще работи автоматично

---

## ✨ След завършване на всички точки

Очаквани резултати:
- ✅ Бутони се визуализират при въпроси за симптоми
- ✅ Безплатен анализ се промотира правилно
- ✅ Платена програма се промотира след PDF анализ
- ✅ Всички meta tags са коректни
- ✅ Всички assets се зареждат правилно