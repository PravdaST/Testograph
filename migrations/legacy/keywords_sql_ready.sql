-- SQL Import Script for Testograph Keywords
-- Database: target_keywords table
-- Date: 2025-11-19
-- Total keywords: 150+ (high-priority subset)

-- Table structure (if not exists)
CREATE TABLE IF NOT EXISTS target_keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    search_intent VARCHAR(50),
    volume VARCHAR(20),
    competition VARCHAR(20),
    priority VARCHAR(20),
    category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert high-priority keywords
-- BRAND KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('testograph', 'Navigational', 'Low', 'Low', 'HIGH', 'Brand', 'Primary brand keyword - build awareness'),
('testograph тест', 'Commercial', 'Low', 'Low', 'HIGH', 'Brand', 'Brand + service - highest conversion potential'),
('testograph цена', 'Commercial', 'Low', 'Low', 'HIGH', 'Brand', 'Price-conscious brand searches'),
('testograph мнения', 'Commercial', 'Low', 'Low', 'HIGH', 'Brand', 'Review-seeking users - social proof critical'),
('testograph софия', 'Local', 'Low', 'Low', 'HIGH', 'Brand + Location', 'Sofia-specific brand searches');

-- TESTOSTERONE CORE KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('тестостерон', 'Informational', 'HIGH', 'HIGH', 'HIGH', 'Core Topic', 'Main topic keyword - educational content'),
('нисък тестостерон', 'Informational', 'Medium', 'Medium', 'HIGH', 'Core Topic', 'Problem awareness keyword'),
('тестостерон при мъже', 'Informational', 'Medium', 'Medium', 'HIGH', 'Core Topic', 'Gender-specific searches'),
('слаб тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Core Topic', 'Colloquial variant');

-- SYMPTOM KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('симптоми на нисък тестостерон', 'Informational', 'Medium', 'Medium', 'HIGH', 'Symptoms', 'Primary symptom search - create comprehensive guide'),
('признаци за нисък тестостерон', 'Informational', 'Medium', 'Low', 'HIGH', 'Symptoms', 'Synonym variant - include in symptom content'),
('нисък тестостерон либидо', 'Informational', 'Low', 'Low', 'HIGH', 'Symptoms', 'Sexual health symptom - sensitive topic'),
('умора от нисък тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Symptoms', 'Specific symptom - fatigue'),
('загуба на мускули тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Symptoms', 'Physical symptom - muscle loss');

-- TESTING KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('тест за тестостерон', 'Commercial', 'Medium', 'Medium', 'HIGH', 'Testing', 'PRIMARY testing keyword - money page'),
('изследване на тестостерон', 'Commercial', 'Medium', 'Medium', 'HIGH', 'Testing', 'Medical variant of testing'),
('тестостерон тест цена', 'Commercial', 'Medium', 'Medium', 'HIGH', 'Testing + Price', 'Price-conscious searches - show value'),
('къде да направя тест за тестостерон', 'Commercial', 'Low', 'Low', 'HIGH', 'Testing + Location', 'High intent - location seeking'),
('тест за тестостерон софия', 'Local', 'Low', 'Low', 'HIGH', 'Testing + Location', 'Sofia-specific - landing page needed'),
('тест за тестостерон пловдив', 'Local', 'Low', 'Low', 'MEDIUM', 'Testing + Location', 'Plovdiv-specific'),
('изследване на мъжки хормони', 'Commercial', 'Low', 'Low', 'HIGH', 'Testing', 'Broader hormone testing'),
('кога да направя тест тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Testing + Timing', 'Educational - timing guidance');

-- SOLUTION KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('как да увелича тестостерона', 'Informational', 'Medium', 'Medium', 'HIGH', 'Solutions', 'Primary solution search - comprehensive guide'),
('как да увелича тестостерона естествено', 'Informational', 'Medium', 'Medium', 'HIGH', 'Solutions', 'Natural methods preferred - our angle'),
('повишаване на тестостерон', 'Informational', 'Medium', 'Medium', 'HIGH', 'Solutions', 'General increase searches'),
('естествено повишаване на тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Solutions', 'Natural emphasis - lifestyle content'),
('как да повиша тестостерона', 'Informational', 'Medium', 'Medium', 'HIGH', 'Solutions', 'Variant of increase searches');

-- SUPPLEMENT KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('добавки за тестостерон', 'Commercial', 'Medium', 'HIGH', 'MEDIUM', 'Supplements', 'High competition - informational angle'),
('тестостерон бустер', 'Commercial', 'Medium', 'HIGH', 'MEDIUM', 'Supplements', 'Commercial keyword - recommend testing first'),
('добавки за тестостерон мнения', 'Commercial', 'Low', 'Medium', 'MEDIUM', 'Supplements + Reviews', 'Review content opportunity');

-- SEXUAL HEALTH KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('мъжка потентност', 'Informational', 'Medium', 'Medium', 'HIGH', 'Sexual Health', 'Core sexual health term'),
('потентност', 'Informational', 'Medium', 'Medium', 'HIGH', 'Sexual Health', 'General potency searches'),
('еректилна дисфункция', 'Informational', 'Medium', 'Medium', 'HIGH', 'Sexual Health', 'Medical term ED - educational content'),
('проблеми с потентност', 'Informational', 'Low', 'Low', 'HIGH', 'Sexual Health', 'Problem awareness'),
('потентност след 40', 'Informational', 'Low', 'Low', 'HIGH', 'Sexual Health + Age', 'Age-specific concerns'),
('либидо мъже', 'Informational', 'Low', 'Low', 'HIGH', 'Sexual Health', 'Male libido searches'),
('намалено либидо при мъже', 'Informational', 'Low', 'Low', 'HIGH', 'Sexual Health', 'Specific libido problem'),
('как да повиша либидото', 'Informational', 'Low', 'Medium', 'HIGH', 'Sexual Health', 'Solution-seeking');

-- FITNESS KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('фитнес мъже 40', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness', 'Age-specific fitness - our demographic'),
('тренировки мъже над 40', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness', '40+ workout content'),
('мускули след 40', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness + Age', 'Muscle building 40+'),
('загуба на мускулна маса', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness', 'Muscle loss concern'),
('покачване на мускулна маса', 'Informational', 'Medium', 'Medium', 'HIGH', 'Fitness', 'Muscle gain searches'),
('силови тренировки мъже 40', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness + Age', 'Strength training 40+'),
('тестостерон и мускули', 'Informational', 'Low', 'Low', 'HIGH', 'Fitness + Hormones', 'T & muscle connection');

-- NUTRITION KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('храни за тестостерон', 'Informational', 'Medium', 'Low', 'HIGH', 'Nutrition', 'Food-based solutions - popular'),
('хранене за тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Nutrition', 'Diet-based approach'),
('храни повишават тестостерон', 'Informational', 'Medium', 'Low', 'HIGH', 'Nutrition', 'T-boosting foods'),
('витамин д тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Nutrition + Vitamins', 'Vitamin D connection - scientific'),
('цинк тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Nutrition + Minerals', 'Zinc & T relationship'),
('цинк за мъже', 'Informational', 'Low', 'Low', 'HIGH', 'Nutrition + Minerals', 'Zinc for men'),
('магнезий тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Nutrition + Minerals', 'Magnesium connection'),
('омега 3 мъже', 'Informational', 'Low', 'Low', 'MEDIUM', 'Nutrition + Fats', 'Omega-3 for men'),
('хранене за потентност', 'Informational', 'Low', 'Low', 'HIGH', 'Nutrition', 'Nutrition for potency');

-- ADAPTOGEN KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('ашваганда', 'Informational', 'Low', 'Medium', 'MEDIUM', 'Supplements + Adaptogens', 'Ashwagandha general'),
('ашваганда тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Supplements + Adaptogens', 'Ashwagandha & T'),
('ашваганда за мъже', 'Informational', 'Low', 'Low', 'MEDIUM', 'Supplements + Adaptogens', 'Male-specific ashwagandha'),
('трибулус', 'Commercial', 'Low', 'Medium', 'MEDIUM', 'Supplements + Adaptogens', 'Tribulus searches'),
('трибулус мнения', 'Commercial', 'Low', 'Low', 'MEDIUM', 'Supplements + Adaptogens', 'Tribulus reviews');

-- AGE-RELATED KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('андропауза', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health + Age', 'Male menopause - untapped topic'),
('мъжка менопауза', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health + Age', 'Colloquial andropause term'),
('андропауза симптоми', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health + Age', 'Andropause symptoms'),
('мъжко здраве след 40', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health + Age', 'Men''s health 40+'),
('мъжко здраве 40+', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health + Age', 'Plus symbol variant'),
('анти ейдж мъже', 'Informational', 'Low', 'Low', 'MEDIUM', 'Men''s Health + Age', 'Anti-aging men');

-- GENERAL MEN'S HEALTH
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('мъжко здраве', 'Informational', 'Medium', 'Medium', 'HIGH', 'Men''s Health', 'General men''s health'),
('мъжки хормони', 'Informational', 'Medium', 'Medium', 'HIGH', 'Men''s Health', 'Male hormones general'),
('хормонален баланс мъже', 'Informational', 'Low', 'Low', 'HIGH', 'Men''s Health', 'Hormonal balance');

-- LIFESTYLE KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('стрес тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Lifestyle', 'Stress & T connection'),
('кортизол тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Lifestyle', 'Cortisol antagonist'),
('сън тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Lifestyle', 'Sleep & T relationship'),
('липса на сън тестостерон', 'Informational', 'Low', 'Low', 'HIGH', 'Lifestyle', 'Sleep deprivation impact');

-- FERTILITY KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('мъжка фертилност', 'Informational', 'Low', 'Low', 'HIGH', 'Fertility', 'Male fertility topic'),
('мъжки фактор забременяване', 'Informational', 'Low', 'Low', 'HIGH', 'Fertility', 'Male conception factor'),
('проблемно забременяване мъж', 'Informational', 'Low', 'Low', 'HIGH', 'Fertility', 'Male conception problems'),
('спермограма', 'Commercial', 'Medium', 'Medium', 'MEDIUM', 'Fertility', 'Sperm analysis'),
('качество на сперма', 'Informational', 'Low', 'Low', 'MEDIUM', 'Fertility', 'Sperm quality');

-- LONG-TAIL QUESTION KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('защо тестостеронът е нисък', 'Informational', 'Low', 'Low', 'HIGH', 'Questions', 'Why question - causes'),
('защо губя мускулна маса', 'Informational', 'Low', 'Low', 'MEDIUM', 'Questions', 'Why muscle loss'),
('защо имам слаба потентност', 'Informational', 'Low', 'Low', 'HIGH', 'Questions', 'Why potency problems'),
('какво е андропауза', 'Informational', 'Low', 'Low', 'HIGH', 'Questions', 'What is andropause'),
('как да подобря либидото си', 'Informational', 'Low', 'Low', 'HIGH', 'Questions', 'How to improve libido'),
('как да запазя мускулна маса след 40', 'Informational', 'Low', 'Low', 'HIGH', 'Questions', 'How to preserve muscle 40+');

-- LOCAL SEO KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('тест за тестостерон варна', 'Local', 'Low', 'Low', 'MEDIUM', 'Testing + Location', 'Varna-specific'),
('тест за тестостерон бургас', 'Local', 'Low', 'Low', 'LOW', 'Testing + Location', 'Burgas-specific'),
('уролог софия', 'Local', 'Medium', 'HIGH', 'MEDIUM', 'Medical Services + Location', 'Urologist Sofia - informational'),
('андролог софия', 'Local', 'Low', 'Medium', 'MEDIUM', 'Medical Services + Location', 'Andrologist Sofia');

-- TRENDING KEYWORDS
INSERT INTO target_keywords (keyword, search_intent, volume, competition, priority, category, notes) VALUES
('ТРТ терапия', 'Informational', 'Low', 'Low', 'MEDIUM', 'Advanced Treatment', 'TRT therapy - trending'),
('заместителна терапия тестостерон', 'Informational', 'Low', 'Low', 'MEDIUM', 'Advanced Treatment', 'Testosterone replacement');

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_keyword ON target_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_priority ON target_keywords(priority);
CREATE INDEX IF NOT EXISTS idx_category ON target_keywords(category);
CREATE INDEX IF NOT EXISTS idx_search_intent ON target_keywords(search_intent);

-- Sample query to get high-priority keywords by category
-- SELECT keyword, search_intent, volume, competition, notes
-- FROM target_keywords
-- WHERE priority = 'HIGH' AND category = 'Testing'
-- ORDER BY volume DESC;

-- Sample query to get all Sofia-specific keywords
-- SELECT keyword, search_intent, priority, notes
-- FROM target_keywords
-- WHERE keyword LIKE '%софия%'
-- ORDER BY priority DESC;

-- End of SQL import script
-- Total records: 100+ high-priority keywords
-- Remember to run keyword performance analysis after 3 months
