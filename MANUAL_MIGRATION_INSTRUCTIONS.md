# Ръководство за Зареждане на Keywords в Supabase

## Стъпка 1: Прилагане на Schema Changes (MANUAL)

Тези DDL команди трябва да се изпълнят **РЪЧНО** през Supabase Dashboard → SQL Editor:

```sql
-- Add target_url column
ALTER TABLE target_keywords
ADD COLUMN IF NOT EXISTS target_url TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_target_keywords_target_url ON target_keywords(target_url);

-- Add column comment
COMMENT ON COLUMN target_keywords.target_url IS 'The specific page/URL this keyword should target (e.g., /learn/testosterone-boost, https://testograph.eu/app/nutrition)';

-- Update table comment
COMMENT ON TABLE target_keywords IS 'Manually curated keywords for SEO targeting. Loaded from Testograph keyword research 2025-01-19. Total: ~100 high-priority keywords.';
```

## Стъпка 2: Зареждане на Keywords

След като schema промените са приложени, изпълни цялата миграция от файла:

**Файл:** `supabase/migrations/20250119_load_testograph_keywords.sql`

**Къде:** Supabase Dashboard → SQL Editor → Нов Query

**Съдържание:** Копирай целия файл и натисни "Run"

Или използвай тази съкратена версия само с INSERT statements (ако schema промените вече са направени):

```sql
-- BRAND KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('testograph', 'high', 'Brand', 85, 'Primary brand keyword - build awareness. Search intent: Navigational'),
('testograph тест', 'high', 'Brand', 85, 'Brand + service - highest conversion potential. Search intent: Commercial'),
('testograph цена', 'high', 'Brand', 85, 'Price-conscious brand searches. Search intent: Commercial'),
('testograph мнения', 'high', 'Brand', 85, 'Review-seeking users - social proof critical. Search intent: Commercial'),
('testograph софия', 'high', 'Brand + Location', 85, 'Sofia-specific brand searches. Search intent: Local')
ON CONFLICT (keyword) DO NOTHING;

-- [... и всички останали INSERT statements от файла ...]
```

## Стъпка 3: Verification

След зареждането, провери резултатите:

```sql
-- Summary query
SELECT
  COUNT(*) as total_keywords,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
  COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
  COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
  COUNT(DISTINCT category) as unique_categories
FROM target_keywords;

-- Show sample
SELECT keyword, priority, category, focus_score, target_url
FROM target_keywords
WHERE priority = 'high'
ORDER BY focus_score DESC
LIMIT 10;
```

## Очаквани Резултати:

- **Total keywords:** ~100
- **High priority:** ~70
- **Medium priority:** ~25
- **Low priority:** ~1
- **Unique categories:** ~20

## Алтернативен Метод: Import през UI

Ако предпочиташ да използваш UI на Keywords Manager:

1. Отвори `keywords_import_ready.csv`
2. Навигирай до `/admin/keywords`
3. Използвай "AI Keyword Suggestions" или импортирай ръчно top 20 priority keywords

---

**Статус:** Schema migration трябва да се приложи РЪЧНО поради DDL permission restrictions в Supabase API.
