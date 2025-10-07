# Funnel Analytics Tracking Documentation

## Преглед

Системата за analytics следи всяко действие на потребителите в 8-стъпковия funnel и записва данни в Supabase.

## Структура на данните

### Таблица: `funnel_sessions`

Следи цялото пътуване на всеки потребител.

| Колона | Тип | Описание |
|--------|-----|----------|
| `id` | UUID | Уникален идентификатор на записа |
| `session_id` | TEXT | Уникален session ID (генериран в browser) |
| `user_email` | TEXT | Email адрес (ако е предоставен) |
| `user_data` | JSONB | Данни от формата (firstName, age, weight и т.н.) |
| `entry_time` | TIMESTAMP | Кога потребителят влезе във funnel-а |
| `last_activity` | TIMESTAMP | Последна активност |
| `exit_step` | INTEGER | На коя стъпка напусна |
| `completed` | BOOLEAN | Дали завърши funnel-а успешно |
| `offer_tier` | TEXT | Коя оферта видя (premium/regular/digital) |

### Таблица: `funnel_events`

Следи всяко индивидуално действие.

| Колона | Тип | Описание |
|--------|-----|----------|
| `id` | UUID | Уникален идентификатор |
| `session_id` | TEXT | Връзка към session |
| `step_number` | INTEGER | Номер на стъпката (1-8) |
| `event_type` | TEXT | Тип събитие (вижте по-долу) |
| `metadata` | JSONB | Допълнителни данни за събитието |
| `timestamp` | TIMESTAMP | Кога се случи |

#### Типове събития (`event_type`):

- `step_entered` - Потребител влезе в стъпка
- `step_exited` - Потребител напусна стъпка
- `button_clicked` - Цъкнат бутон
- `skip_used` - Използван Skip бутон
- `offer_viewed` - Показана оферта
- `exit_intent` - Exit intent detected
- `choice_made` - Направен избор (Step 2c)

---

## SQL Заявки за Анализ

### 1. Conversion Funnel - Колко стигат до всяка стъпка?

```sql
SELECT
  step_number,
  COUNT(DISTINCT session_id) as unique_visitors,
  ROUND(100.0 * COUNT(DISTINCT session_id) /
    (SELECT COUNT(DISTINCT session_id) FROM funnel_events WHERE step_number = 1), 2) as conversion_percentage
FROM funnel_events
WHERE event_type = 'step_entered'
GROUP BY step_number
ORDER BY step_number;
```

**Резултат:** Виждаш колко процента от началните посетители стигат до всяка стъпка.

---

### 2. Drop-off Rate - Къде напускат най-много хора?

```sql
SELECT
  exit_step,
  COUNT(*) as exits,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM funnel_sessions WHERE exit_step IS NOT NULL), 2) as percentage
FROM funnel_sessions
WHERE exit_step IS NOT NULL AND completed = FALSE
GROUP BY exit_step
ORDER BY exits DESC;
```

**Резултат:** Стъпките с най-много напускания (drop-off points).

---

### 3. Среден time-on-page за всяка стъпка

```sql
WITH step_times AS (
  SELECT
    e1.session_id,
    e1.step_number,
    EXTRACT(EPOCH FROM (e2.timestamp - e1.timestamp)) as time_spent_seconds
  FROM funnel_events e1
  JOIN funnel_events e2
    ON e1.session_id = e2.session_id
    AND e1.step_number = e2.step_number
  WHERE e1.event_type = 'step_entered'
    AND e2.event_type = 'step_exited'
)
SELECT
  step_number,
  ROUND(AVG(time_spent_seconds), 2) as avg_seconds,
  ROUND(AVG(time_spent_seconds) / 60, 2) as avg_minutes
FROM step_times
GROUP BY step_number
ORDER BY step_number;
```

**Резултат:** Среден брой секунди/минути на всяка стъпка.

---

### 4. Offer Performance - Коя оферта конвертира най-добре?

```sql
SELECT
  s.offer_tier,
  COUNT(*) as total_views,
  COUNT(CASE WHEN e.event_type = 'button_clicked' AND e.metadata->>'buttonText' LIKE '%CTA:%' THEN 1 END) as cta_clicks,
  ROUND(100.0 * COUNT(CASE WHEN e.event_type = 'button_clicked' AND e.metadata->>'buttonText' LIKE '%CTA:%' THEN 1 END) / COUNT(*), 2) as click_through_rate
FROM funnel_sessions s
LEFT JOIN funnel_events e ON s.session_id = e.session_id
WHERE s.offer_tier IS NOT NULL
GROUP BY s.offer_tier
ORDER BY cta_clicks DESC;
```

**Резултат:** Click-through rate за всяка оферта (Premium/Regular/Digital).

---

### 5. Skip vs Proceed - Колко използват Skip?

```sql
SELECT
  e.step_number,
  COUNT(CASE WHEN e.event_type = 'skip_used' THEN 1 END) as skips,
  COUNT(CASE WHEN e.event_type = 'step_exited' AND e.metadata->>'timeSpentSeconds'::int > 5 THEN 1 END) as proceeds,
  ROUND(100.0 * COUNT(CASE WHEN e.event_type = 'skip_used' THEN 1 END) /
    COUNT(CASE WHEN e.event_type IN ('skip_used', 'step_exited') THEN 1 END), 2) as skip_percentage
FROM funnel_events e
WHERE e.step_number BETWEEN 1 AND 7
GROUP BY e.step_number
ORDER BY e.step_number;
```

**Резултат:** Skip rate за всяка стъпка (1-7).

---

### 6. Най-цъкани бутони

```sql
SELECT
  metadata->>'buttonText' as button_text,
  metadata->>'offerTier' as offer_tier,
  COUNT(*) as clicks
FROM funnel_events
WHERE event_type = 'button_clicked'
GROUP BY metadata->>'buttonText', metadata->>'offerTier'
ORDER BY clicks DESC
LIMIT 20;
```

**Резултат:** Топ 20 най-цъкани бутона.

---

### 7. Exit Intent Analysis - Колко пъти се показва exit popup?

```sql
SELECT
  COUNT(*) as total_exit_intents,
  COUNT(DISTINCT session_id) as unique_sessions,
  metadata->>'offerTier' as offer_tier
FROM funnel_events
WHERE event_type = 'exit_intent'
GROUP BY metadata->>'offerTier';
```

**Резултат:** Брой exit intents по tier.

---

### 8. Hourly Funnel Traffic - Peak hours

```sql
SELECT
  EXTRACT(HOUR FROM entry_time) as hour_of_day,
  COUNT(*) as sessions,
  COUNT(CASE WHEN completed = TRUE THEN 1 END) as completions,
  ROUND(100.0 * COUNT(CASE WHEN completed = TRUE THEN 1 END) / COUNT(*), 2) as completion_rate
FROM funnel_sessions
GROUP BY EXTRACT(HOUR FROM entry_time)
ORDER BY hour_of_day;
```

**Резултат:** Брой сесии и completion rate по часове на деня.

---

### 9. User Choices Distribution (Step 2c)

```sql
SELECT
  metadata->>'choiceValue' as choice,
  COUNT(*) as selections,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM funnel_events WHERE event_type = 'choice_made'), 2) as percentage
FROM funnel_events
WHERE event_type = 'choice_made'
GROUP BY metadata->>'choiceValue'
ORDER BY selections DESC;
```

**Резултат:** Разпределение на изборите в Step 2c.

---

### 10. Complete Session Journey

```sql
SELECT
  s.session_id,
  s.user_data->>'firstName' as first_name,
  s.entry_time,
  s.exit_step,
  s.offer_tier,
  s.completed,
  COUNT(e.id) as total_events
FROM funnel_sessions s
LEFT JOIN funnel_events e ON s.session_id = e.session_id
GROUP BY s.id
ORDER BY s.entry_time DESC
LIMIT 50;
```

**Резултат:** Последните 50 сесии с обща информация.

---

## Как да приложиш миграцията?

### Опция 1: Supabase Dashboard (препоръчвам)

1. Отвори [supabase.com](https://supabase.com)
2. Влез в твоя проект
3. SQL Editor → New Query
4. Copy-paste съдържанието на `supabase/migrations/20251007000001_create_funnel_analytics_tables.sql`
5. Run

### Опция 2: Supabase CLI

```bash
supabase db push
```

---

## Проверка дали работи

След като приложиш миграцията и някой премине през funnel-а, провери:

```sql
-- Провери сесии
SELECT COUNT(*) FROM funnel_sessions;

-- Провери събития
SELECT COUNT(*) FROM funnel_events;

-- Виж последните 10 събития
SELECT * FROM funnel_events ORDER BY timestamp DESC LIMIT 10;
```

---

## Консолни логове

Tracking системата извежда console logs заDebGginG:

- `✅ Funnel session initialized: {session_id}`
- `📊 Step {N} entered`
- `📊 Step {N} exited (Xs)`
- `🖱️ Button clicked: "{text}" on step {N}`
- `⏭️ Skip used on step {N}`
- `👁️ Offer viewed: {tier} on step {N}`
- `🚪 Exit intent on step {N}`
- `🏁 Funnel {completed/exited} at step {N}`
- `💎 Offer tier updated: {tier}`

---

## Забележки

- Tracking работи само в browser (typeof window !== 'undefined')
- Session ID се съхранява в `sessionStorage`
- За да изчистиш session при тестване: `clearFunnelSession()`
- RLS е enabled - anonymous users могат да пишат, authenticated users могат да четат

---

## Next Steps (Фаза 2)

След като съберем данни от първите 50-100 сесии, може да направим:

1. **Analytics Dashboard** (`/admin/analytics`)
   - Real-time conversion funnel visualization
   - Drop-off heatmap
   - Offer comparison charts
   - Time-on-page graphs

2. **A/B Testing**
   - Тестване на различни копи текстове
   - Тестване на offer ordering
   - Тестване на timer durations

3. **Alerts**
   - Email когато drop-off rate е >70% на дадена стъпка
   - Slack notification за нови високо-ангажирани сесии

---

**Готово! Сега имаш пълен контрол над funnel поведението.**
