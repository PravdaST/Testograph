# Facebook Pixel Configuration Backup

**Дата на деактивиране:** 2024-12-13

## Pixel Информация

| Параметър | Стойност |
|-----------|----------|
| **Pixel ID** | `9450560195068576` |
| **Платформа** | Facebook Meta Pixel |
| **Версия** | 2.0 |

---

## Код за инициализация

Оригиналният код от `components/AnalyticsScripts.tsx`:

```javascript
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '9450560195068576');
fbq('track', 'PageView');
```

---

## Tracking Events (от lib/facebook-pixel.ts)

### Standard Events:
- **Lead** - При попълване на форма
- **ViewContent** - При преглед на страница/стъпка
- **AddToCart** - При преглед на оферта за продукт
- **InitiateCheckout** - При натискане на "Поръчай сега"
- **PageView** - Автоматично при всяко зареждане на страница

### Helper Functions:
```typescript
// Track standard event
fbqTrack(event: string, params?: Record<string, any>)

// Track custom event
fbqTrackCustom(event: string, params?: Record<string, any>)

// Convenience functions
trackLead(contentName: string, value?: number)
trackViewContent(contentName: string, contentType?: string)
trackAddToCart(productName: string, value: number, currency?: string)
trackInitiateCheckout(productName: string, value: number, currency?: string)
```

---

## Файлове свързани с Facebook Pixel

1. `components/AnalyticsScripts.tsx` - Основна инициализация
2. `lib/facebook-pixel.ts` - Helper функции за tracking
3. `components/CookieConsent.tsx` - Cookie consent управление
4. `app/layout.tsx` - Включване на AnalyticsScripts компонента

---

## За възстановяване

За да активираш отново Facebook Pixel:

1. Отвори `components/AnalyticsScripts.tsx`
2. Разкоментирай секцията `{/* Facebook Meta Pixel */}`
3. Rebuild и deploy

---

## Други активни Analytics

| Услуга | ID | Статус |
|--------|-----|--------|
| Google Analytics | `G-88D9NGJX4M` | Активен |
| Microsoft Clarity | `ud65qrvwsn` | Активен |
| Facebook Pixel | `9450560195068576` | **ДЕАКТИВИРАН** |
