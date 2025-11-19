-- MIGRATION: Load Testograph Keywords Research Data
-- Date: 2025-01-19
-- Description: Import ~100 high-priority keywords from research
-- Dependencies: Requires target_keywords table and target_url column

-- Step 1: Add target_url column if not exists (from previous migration)
ALTER TABLE target_keywords
ADD COLUMN IF NOT EXISTS target_url TEXT;

CREATE INDEX IF NOT EXISTS idx_target_keywords_target_url ON target_keywords(target_url);

COMMENT ON COLUMN target_keywords.target_url IS 'The specific page/URL this keyword should target (e.g., /learn/testosterone-boost, https://testograph.eu/app/nutrition)';

-- Step 2: Insert keywords (adapted to match existing schema)
-- Note: created_by is nullable, focus_score mapping:
-- HIGH priority + high/medium volume = 85
-- HIGH priority + low volume = 75
-- MEDIUM priority = 55
-- LOW priority = 35

-- BRAND KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('testograph', 'high', 'Brand', 85, 'Primary brand keyword - build awareness. Search intent: Navigational'),
('testograph тест', 'high', 'Brand', 85, 'Brand + service - highest conversion potential. Search intent: Commercial'),
('testograph цена', 'high', 'Brand', 85, 'Price-conscious brand searches. Search intent: Commercial'),
('testograph мнения', 'high', 'Brand', 85, 'Review-seeking users - social proof critical. Search intent: Commercial'),
('testograph софия', 'high', 'Brand + Location', 85, 'Sofia-specific brand searches. Search intent: Local')
ON CONFLICT (keyword) DO NOTHING;

-- TESTOSTERONE CORE KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('тестостерон', 'high', 'Core Topic', 85, 'Main topic keyword - educational content. Volume: HIGH, Competition: HIGH'),
('нисък тестостерон', 'high', 'Core Topic', 85, 'Problem awareness keyword. Volume: Medium, Competition: Medium'),
('тестостерон при мъже', 'high', 'Core Topic', 85, 'Gender-specific searches. Volume: Medium, Competition: Medium'),
('слаб тестостерон', 'medium', 'Core Topic', 55, 'Colloquial variant. Volume: Low, Competition: Low')
ON CONFLICT (keyword) DO NOTHING;

-- SYMPTOM KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('симптоми на нисък тестостерон', 'high', 'Symptoms', 85, 'Primary symptom search - create comprehensive guide. Volume: Medium'),
('признаци за нисък тестостерон', 'high', 'Symptoms', 75, 'Synonym variant - include in symptom content. Volume: Low'),
('нисък тестостерон либидо', 'high', 'Symptoms', 75, 'Sexual health symptom - sensitive topic. Volume: Low'),
('умора от нисък тестостерон', 'medium', 'Symptoms', 55, 'Specific symptom - fatigue. Volume: Low'),
('загуба на мускули тестостерон', 'medium', 'Symptoms', 55, 'Physical symptom - muscle loss. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- TESTING KEYWORDS (MONEY KEYWORDS)
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes, target_url) VALUES
('тест за тестостерон', 'high', 'Testing', 95, 'PRIMARY testing keyword - money page. Volume: Medium, High intent', '/'),
('изследване на тестостерон', 'high', 'Testing', 90, 'Medical variant of testing. Volume: Medium', '/'),
('тестостерон тест цена', 'high', 'Testing + Price', 90, 'Price-conscious searches - show value. Volume: Medium', '/'),
('къде да направя тест за тестостерон', 'high', 'Testing + Location', 85, 'High intent - location seeking. Volume: Low', '/'),
('тест за тестостерон софия', 'high', 'Testing + Location', 85, 'Sofia-specific - landing page needed. Volume: Low', '/'),
('тест за тестостерон пловдив', 'medium', 'Testing + Location', 55, 'Plovdiv-specific. Volume: Low', '/'),
('изследване на мъжки хормони', 'high', 'Testing', 75, 'Broader hormone testing. Volume: Low', '/'),
('кога да направя тест тестостерон', 'medium', 'Testing + Timing', 55, 'Educational - timing guidance. Volume: Low', NULL)
ON CONFLICT (keyword) DO NOTHING;

-- SOLUTION KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('как да увелича тестостерона', 'high', 'Solutions', 85, 'Primary solution search - comprehensive guide. Volume: Medium'),
('как да увелича тестостерона естествено', 'high', 'Solutions', 90, 'Natural methods preferred - our angle. Volume: Medium'),
('повишаване на тестостерон', 'high', 'Solutions', 85, 'General increase searches. Volume: Medium'),
('естествено повишаване на тестостерон', 'high', 'Solutions', 75, 'Natural emphasis - lifestyle content. Volume: Low'),
('как да повиша тестостерона', 'high', 'Solutions', 85, 'Variant of increase searches. Volume: Medium')
ON CONFLICT (keyword) DO NOTHING;

-- SUPPLEMENT KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('добавки за тестостерон', 'medium', 'Supplements', 55, 'High competition - informational angle. Volume: Medium, Competition: HIGH'),
('тестостерон бустер', 'medium', 'Supplements', 55, 'Commercial keyword - recommend testing first. Volume: Medium, Competition: HIGH'),
('добавки за тестостерон мнения', 'medium', 'Supplements + Reviews', 55, 'Review content opportunity. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- SEXUAL HEALTH KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('мъжка потентност', 'high', 'Sexual Health', 85, 'Core sexual health term. Volume: Medium'),
('потентност', 'high', 'Sexual Health', 85, 'General potency searches. Volume: Medium'),
('еректилна дисфункция', 'high', 'Sexual Health', 85, 'Medical term ED - educational content. Volume: Medium'),
('проблеми с потентност', 'high', 'Sexual Health', 75, 'Problem awareness. Volume: Low'),
('потентност след 40', 'high', 'Sexual Health + Age', 85, 'Age-specific concerns. Volume: Low'),
('либидо мъже', 'high', 'Sexual Health', 75, 'Male libido searches. Volume: Low'),
('намалено либидо при мъже', 'high', 'Sexual Health', 75, 'Specific libido problem. Volume: Low'),
('как да повиша либидото', 'high', 'Sexual Health', 85, 'Solution-seeking. Volume: Medium')
ON CONFLICT (keyword) DO NOTHING;

-- FITNESS KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('фитнес мъже 40', 'high', 'Fitness', 75, 'Age-specific fitness - our demographic. Volume: Low'),
('тренировки мъже над 40', 'high', 'Fitness', 75, '40+ workout content. Volume: Low'),
('мускули след 40', 'high', 'Fitness + Age', 85, 'Muscle building 40+. Volume: Low'),
('загуба на мускулна маса', 'high', 'Fitness', 75, 'Muscle loss concern. Volume: Low'),
('покачване на мускулна маса', 'high', 'Fitness', 85, 'Muscle gain searches. Volume: Medium'),
('силови тренировки мъже 40', 'high', 'Fitness + Age', 75, 'Strength training 40+. Volume: Low'),
('тестостерон и мускули', 'high', 'Fitness + Hormones', 75, 'T & muscle connection. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- NUTRITION KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('храни за тестостерон', 'high', 'Nutrition', 85, 'Food-based solutions - popular. Volume: Medium, Competition: Low'),
('хранене за тестостерон', 'high', 'Nutrition', 75, 'Diet-based approach. Volume: Low'),
('храни повишават тестостерон', 'high', 'Nutrition', 85, 'T-boosting foods. Volume: Medium, Competition: Low'),
('витамин д тестостерон', 'high', 'Nutrition + Vitamins', 75, 'Vitamin D connection - scientific. Volume: Low'),
('цинк тестостерон', 'high', 'Nutrition + Minerals', 75, 'Zinc & T relationship. Volume: Low'),
('цинк за мъже', 'high', 'Nutrition + Minerals', 75, 'Zinc for men. Volume: Low'),
('магнезий тестостерон', 'medium', 'Nutrition + Minerals', 55, 'Magnesium connection. Volume: Low'),
('омега 3 мъже', 'medium', 'Nutrition + Fats', 55, 'Omega-3 for men. Volume: Low'),
('хранене за потентност', 'high', 'Nutrition', 75, 'Nutrition for potency. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- ADAPTOGEN KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('ашваганда', 'medium', 'Supplements + Adaptogens', 55, 'Ashwagandha general. Volume: Low, Competition: Medium'),
('ашваганда тестостерон', 'medium', 'Supplements + Adaptogens', 55, 'Ashwagandha & T. Volume: Low'),
('ашваганда за мъже', 'medium', 'Supplements + Adaptogens', 55, 'Male-specific ashwagandha. Volume: Low'),
('трибулус', 'medium', 'Supplements + Adaptogens', 55, 'Tribulus searches. Volume: Low, Competition: Medium'),
('трибулус мнения', 'medium', 'Supplements + Adaptogens', 55, 'Tribulus reviews. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- AGE-RELATED KEYWORDS (HIGH OPPORTUNITY)
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('андропауза', 'high', 'Men''s Health + Age', 85, 'Male menopause - untapped topic, LOW competition. Volume: Low'),
('мъжка менопауза', 'high', 'Men''s Health + Age', 75, 'Colloquial andropause term. Volume: Low'),
('андропауза симптоми', 'high', 'Men''s Health + Age', 75, 'Andropause symptoms. Volume: Low'),
('мъжко здраве след 40', 'high', 'Men''s Health + Age', 75, 'Men''s health 40+. Volume: Low'),
('мъжко здраве 40+', 'high', 'Men''s Health + Age', 75, 'Plus symbol variant. Volume: Low'),
('анти ейдж мъже', 'medium', 'Men''s Health + Age', 55, 'Anti-aging men. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- GENERAL MEN'S HEALTH
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('мъжко здраве', 'high', 'Men''s Health', 85, 'General men''s health. Volume: Medium'),
('мъжки хормони', 'high', 'Men''s Health', 85, 'Male hormones general. Volume: Medium'),
('хормонален баланс мъже', 'high', 'Men''s Health', 75, 'Hormonal balance. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- LIFESTYLE KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('стрес тестостерон', 'high', 'Lifestyle', 75, 'Stress & T connection. Volume: Low'),
('кортизол тестостерон', 'medium', 'Lifestyle', 55, 'Cortisol antagonist. Volume: Low'),
('сън тестостерон', 'high', 'Lifestyle', 75, 'Sleep & T relationship. Volume: Low'),
('липса на сън тестостерон', 'high', 'Lifestyle', 75, 'Sleep deprivation impact. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- FERTILITY KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('мъжка фертилност', 'high', 'Fertility', 75, 'Male fertility topic. Volume: Low'),
('мъжки фактор забременяване', 'high', 'Fertility', 75, 'Male conception factor. Volume: Low'),
('проблемно забременяване мъж', 'high', 'Fertility', 75, 'Male conception problems. Volume: Low'),
('спермограма', 'medium', 'Fertility', 55, 'Sperm analysis. Volume: Medium, Competition: Medium'),
('качество на сперма', 'medium', 'Fertility', 55, 'Sperm quality. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- LONG-TAIL QUESTION KEYWORDS (HIGH CONVERSION)
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('защо тестостеронът е нисък', 'high', 'Questions', 75, 'Why question - causes. Volume: Low'),
('защо губя мускулна маса', 'medium', 'Questions', 55, 'Why muscle loss. Volume: Low'),
('защо имам слаба потентност', 'high', 'Questions', 75, 'Why potency problems. Volume: Low'),
('какво е андропауза', 'high', 'Questions', 75, 'What is andropause. Volume: Low'),
('как да подобря либидото си', 'high', 'Questions', 75, 'How to improve libido. Volume: Low'),
('как да запазя мускулна маса след 40', 'high', 'Questions', 75, 'How to preserve muscle 40+. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- LOCAL SEO KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes, target_url) VALUES
('тест за тестостерон варна', 'medium', 'Testing + Location', 55, 'Varna-specific. Volume: Low', '/'),
('тест за тестостерон бургас', 'low', 'Testing + Location', 35, 'Burgas-specific. Volume: Low', '/'),
('уролог софия', 'medium', 'Medical Services + Location', 55, 'Urologist Sofia - informational content. Volume: Medium, Competition: HIGH', NULL),
('андролог софия', 'medium', 'Medical Services + Location', 55, 'Andrologist Sofia. Volume: Low, Competition: Medium', NULL)
ON CONFLICT (keyword) DO NOTHING;

-- ADVANCED TREATMENT KEYWORDS
INSERT INTO target_keywords (keyword, priority, category, focus_score, notes) VALUES
('ТРТ терапия', 'medium', 'Advanced Treatment', 55, 'TRT therapy - trending. Volume: Low'),
('заместителна терапия тестостерон', 'medium', 'Advanced Treatment', 55, 'Testosterone replacement. Volume: Low')
ON CONFLICT (keyword) DO NOTHING;

-- Summary comment
COMMENT ON TABLE target_keywords IS 'Manually curated keywords for SEO targeting. Loaded from Testograph keyword research 2025-01-19. Total: ~100 high-priority keywords.';

-- Verify import
SELECT
  COUNT(*) as total_keywords,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
  COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
  COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
  COUNT(DISTINCT category) as unique_categories
FROM target_keywords;
