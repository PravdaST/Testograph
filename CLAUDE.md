# Testograph Project Documentation

## IMPORTANT: Current User Journey (December 2024)

**НЕ използвай стари термини като "PRO достъп", "PRO users", "subscription" - те са ОСТАРЕЛИ!**

### Текуща Система (3 стъпки):

1. **Quiz** (`/quiz/*`)
   - Потребителят попълва quiz за тестостерон
   - Избира категория: `libido`, `muscle`, или `energy`
   - Получава score и персонализиран план
   - Данни в: `quiz_results_v2`

2. **Shopify Покупка** (`shop.testograph.eu`)
   - Купува TestoUp добавка
   - Данни в: `pending_orders`
   - Webhook автоматично записва поръчката

3. **App Регистрация** (`/app/*`)
   - Влиза в мобилното приложение
   - Следи тренировки, хранене, сън, добавки
   - Данни в: `app_users` + много други таблици

### Admin Pages Mapping:
- `/admin/users` - Quiz потребители (от стъпка 1) с pagination и filtering
- `/admin/shopify-orders` - Поръчки + Econt tracking + Sync to Shopify (от стъпка 2)
- `/admin/users` popup - 360° профил на потребител (всичко заедно)
- `/admin/quiz-analytics` - Quiz статистики и Session Explorer
- `/admin/learn-content` - AI Learn Content System

### НЯМА:
- ❌ PRO subscription система
- ❌ Платени планове в приложението
- ❌ Access control за features

---

## Project Overview

Testograph is a Next.js application for testosterone health assessment and personalized recommendations. It includes a quiz system, admin panel, Shopify integration, AI content generation, and user management.

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Supabase (Database & Auth & Storage)
- Tailwind CSS + shadcn/ui
- OpenRouter API (Google Gemini for AI content)
- Shopify Admin API integration

**Dev Server:** `npm run dev` runs on port 3006

---

## Admin Panel (`/admin`)

### Authentication
- Admin access controlled via `admin_users` table in Supabase
- Login at `/admin` redirects to `/admin/dashboard` after auth
- Layout component: `components/admin/AdminLayout.tsx`
- All admin API calls use `adminFetch()` from `lib/admin/api.ts`

### Admin Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin/dashboard` | Overview stats, recent activity |
| **Users** | `/admin/users` | Quiz потребители с pagination, filtering, popup детайли |
| Business Analytics | `/admin/business-analytics` | Revenue & operations |
| Quiz Analytics | `/admin/quiz-analytics` | Quiz stats, Session Explorer, CSV Export |
| **Shopify Orders** | `/admin/shopify-orders` | Orders + Econt tracking + Sync to Shopify |
| Chat Sessions | `/admin/chat-sessions` | AI chat logs |
| Affiliates | `/admin/affiliates` | Affiliate tracking |
| **Learn Content** | `/admin/learn-content` | AI Content Generation System |
| Audit Logs | `/admin/audit-logs` | System logs |
| Settings | `/admin/settings` | App configuration |
| Communication | `/admin/communication` | Email templates & sending |

---

## Learn Content System (`/admin/learn-content`)

### Cluster-Pillar Architecture

AI-powered educational content generation with SEO-optimized cluster/pillar model:

**Cluster (Hub Page):**
- 3,500+ words comprehensive overview
- Links to 8-12 related pillar articles
- Example: "Пълно ръководство за тестостерон"

**Pillar (Spoke Page):**
- 5,500+ words in-depth article
- Links back to parent cluster + sibling pillars
- Example: "Как да повишиш тестостерона естествено"

### Features
- **AI Content Generation** - Full articles with one click via Google Gemini
- **AI Image Generation** - Hero images via Gemini 2.5 Flash Image
- **Smart Internal Linking** - Auto-links to existing content
- **Dashboard** - Visual cluster/pillar tree
- **AI Cluster Suggestions** - Analyzes site and suggests new topics

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/learn-content/create-cluster` | POST | Generate cluster (3,500+ words) |
| `/api/admin/learn-content/create-pillar` | POST | Generate pillar (5,500+ words) |
| `/api/admin/learn-content/stats` | GET | Dashboard statistics |
| `/api/admin/learn-content/guides` | GET/PUT/DELETE | CRUD for guides |
| `/api/admin/learn-content/suggest-clusters` | POST | AI suggestions |

### Database Table: `blog_posts`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Article title |
| slug | text | URL slug (unique, Latin) |
| content | text | HTML content |
| guide_type | text | 'cluster' or 'pillar' |
| guide_category | text | testosterone/potency/fitness/nutrition/supplements/lifestyle |
| suggested_pillars | text[] | AI-suggested pillar topics |
| parent_cluster_slug | text | For pillars: parent cluster slug |
| featured_image_url | text | Hero image URL |
| is_published | boolean | Publication status |

### Key Files
- `app/admin/learn-content/page.tsx` - Admin page
- `components/admin/LearnContentTab.tsx` - Main tab container
- `components/admin/LearnContentDashboard.tsx` - Visual cluster/pillar tree
- `lib/ai/image-generation.ts` - AI image generation
- `lib/utils/slugify.ts` - Cyrillic → Latin transliteration

---

## Users System (`/admin/users`)

### Features
- **Pagination** - 50 users per page with navigation
- **Filtering** - By quiz status, payment status, activity
- **Search** - By email or name
- **User Popup** - Full 360° view when clicking a row
- **Admin Notes** - Notes per user stored in `admin_user_notes`
- **Export CSV** - Download user data

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/users` | GET | Paginated users with stats |
| `/api/admin/users/[email]` | GET | Single user details |
| `/api/admin/users/notes` | GET/POST | Admin notes for users |

### User Data Sources (All Time Counts)

| Data | Source Table |
|------|--------------|
| Quiz results | `quiz_results_v2` |
| Payment status | `pending_orders` |
| Capsules | `testoup_inventory` + `testoup_purchase_history` |
| Workouts | `workout_sessions` |
| Meals | `meal_completions` |
| Sleep | `sleep_tracking` |
| TestoUP tracking | `testoup_tracking` |
| Coach messages | `coach_messages` |
| Body measurements | `body_measurements` |
| Progress photos | `progress_photos` |

### Stats Cards

The users page shows aggregate stats:
- Total users (811+)
- With/Without Quiz
- Paid Orders (133) vs Pending Orders (488)
- Total Revenue (10,257 лв + 26,925 лв pending)
- Active users (last 7 days)

---

## Shopify Integration

### Environment Variables
```env
SHOPIFY_STORE_DOMAIN="shop.testograph.eu"
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxx"
SHOPIFY_WEBHOOK_SECRET="xxx"
```

### Webhook Endpoints
- `POST /api/webhooks/shopify` - Handles Order creation and Order payment events
- Webhooks receive full PII data (name, address, phone) on all Shopify plans

### Database Table: `pending_orders`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| order_id | text | Shopify order ID |
| order_number | text | Order number (#1234) |
| email | text | Customer email |
| customer_name | text | Full name |
| phone | text | Phone number |
| total_price | numeric | Order total |
| status | text | pending/paid |
| products | jsonb | Line items array |
| shipping_address | jsonb | Address object |
| paid_at | timestamp | Payment timestamp |
| tracking_number | text | Econt shipment number |
| tracking_company | text | Courier company (Econt) |
| fulfillment_status | text | Fulfillment status |

---

## Econt Integration (в `/admin/shopify-orders`)

### Overview
Real-time tracking of shipments through Econt courier API. Integrated directly into the Shopify Orders page.

### Features
- **Live Tracking** - Fetches current status from Econt API
- **Stats Dashboard** - Delivered, in transit, returned, no tracking counts
- **Order Details** - Expandable rows with tracking events history
- **Filters** - All, Delivered, In Transit, Returned, No Tracking
- **Sync to Shopify** - Mark delivered COD orders as "Paid" in Shopify
- **Export CSV** - Export returned orders for specific month

### Environment Variables
```env
ECONT_API_URL=https://ee.econt.com/services/Shipments/ShipmentService.getShipmentStatuses.json
ECONT_USERNAME=your_econt_username
ECONT_PASSWORD=your_econt_password
```

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/shopify-orders` | GET | Orders with Econt status |
| `/api/admin/sync-delivery-status` | POST | Sync delivered orders to Shopify as Paid |
| `/api/admin/export-returned-orders` | GET | CSV export of returned orders |

### Sync Delivery Status API

Marks COD orders as "Paid" in Shopify when Econt shows "Delivered":

```bash
# Dry run (preview only)
curl -X POST http://localhost:3006/api/admin/sync-delivery-status \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Actual sync
curl -X POST http://localhost:3006/api/admin/sync-delivery-status \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

**Technical Details:**
- Uses Shopify GraphQL API `orderMarkAsPaid` mutation
- Requires myshopify.com domain (not custom domain) for GraphQL
- Rate limited at ~500ms between requests
- Updates both fulfillment status and payment status

### Key Files
- `app/admin/shopify-orders/page.tsx` - Orders + Econt tracking page
- `app/api/admin/sync-delivery-status/route.ts` - Sync to Shopify API
- `app/api/admin/export-returned-orders/route.ts` - CSV export API

---

## Database Tables Overview

### Core Tables

| Table | Source | Description |
|-------|--------|-------------|
| `quiz_results_v2` | Quiz | Email, name, category, score, level |
| `quiz_step_events` | Quiz | Each step, answers, timing |
| `pending_orders` | Shopify | Orders, products, addresses |
| `app_users` | App | Registered app users |
| `admin_users` | Admin | Admin access list |
| `admin_user_notes` | Admin | Notes per user |
| `admin_audit_logs` | Admin | Action logs |
| `blog_posts` | Learn Content | Educational articles |

### App Activity Tables

| Table | Description |
|-------|-------------|
| `workout_sessions` | Completed workouts |
| `meal_completions` | Logged meals |
| `sleep_tracking` | Sleep records |
| `testoup_tracking` | Supplement tracking |
| `testoup_inventory` | Capsules remaining |
| `progress_photos` | Progress photos |
| `body_measurements` | Body measurements |
| `chat_sessions` | AI Coach conversations |
| `coach_messages` | Chat messages |

### User Connection
- **Email** is the primary key connecting quiz → shopify → app
- One user can have data in all 3 systems

---

## AI Integration (OpenRouter)

### Environment
```env
OPENROUTER_API_KEY="sk-or-v1-xxx"
```

### Models Used
| Model | Purpose | Cost |
|-------|---------|------|
| `google/gemini-2.5-pro` | Long content generation | ~$0.02-0.03 |
| `google/gemini-2.5-flash-lite` | Quick suggestions, metadata | ~$0.001 |
| `google/gemini-2.5-flash-image` | Image generation | ~$0.02 |

### AI Features
1. **Learn Content** - Full article generation (3,500-5,500 words)
2. **Cluster Suggestions** - Analyze site, suggest new topics
3. **Image Generation** - Hero images for articles
4. **Smart Linking** - Auto-link to related content

---

## Key Files Reference

### Admin Components
```
components/admin/
├── AdminLayout.tsx          # Sidebar navigation
├── LearnContentTab.tsx      # Learn content main UI
├── LearnContentDashboard.tsx # Cluster/pillar tree
├── CreateClusterDialog.tsx  # Create cluster modal
└── PublishScheduler.tsx     # Schedule publishing
```

### API Routes
```
app/api/admin/
├── users/route.ts              # Users list with pagination
├── users/notes/route.ts        # Admin notes CRUD
├── shopify-orders/route.ts     # Orders + Econt status
├── shopify-sync/route.ts       # Shopify sync logic
├── sync-delivery-status/       # Sync delivered orders to Shopify as Paid
├── export-returned-orders/     # CSV export of returned orders
├── learn-content/
│   ├── create-cluster/         # AI cluster generation
│   ├── create-pillar/          # AI pillar generation
│   ├── stats/                  # Dashboard stats
│   ├── guides/                 # Guides CRUD
│   └── suggest-clusters/       # AI suggestions
└── webhooks/shopify/           # Shopify webhooks
```

### Utilities
```
lib/
├── admin/api.ts             # adminFetch() helper
├── ai/image-generation.ts   # AI image generation
├── utils/slugify.ts         # Cyrillic → Latin
├── utils/insert-images.ts   # Insert images in HTML
└── utils/smart-linking.ts   # Internal linking
```

---

## Development

### Running the Project
```bash
cd Testograph
npm run dev  # Starts on port 3006
```

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Shopify
SHOPIFY_STORE_DOMAIN=shop.testograph.eu
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx
SHOPIFY_WEBHOOK_SECRET=xxx

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-xxx

# Econt Courier
ECONT_API_URL=https://ee.econt.com/services/Shipments/ShipmentService.getShipmentStatuses.json
ECONT_USERNAME=xxx
ECONT_PASSWORD=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3006
```

### Common Commands

**Sync Shopify Orders:**
```bash
curl -X POST http://localhost:3006/api/admin/shopify-sync \
  -H "Content-Type: application/json" \
  -d '{"action": "sync-missing"}'
```

**Generate Learn Content Cluster:**
```bash
curl -X POST http://localhost:3006/api/admin/learn-content/create-cluster \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Тестостерон - пълно ръководство", "category": "testosterone"}'
```

---

## Recent Changes Log

### 2024-12-10: Sync Delivered Orders to Shopify as Paid
- Added `/api/admin/sync-delivery-status` API using GraphQL `orderMarkAsPaid` mutation
- Marks COD orders as "Paid" in Shopify when Econt shows "Delivered"
- Added "Sync to Shopify" button in `/admin/shopify-orders` page
- Added `/api/admin/export-returned-orders` for CSV export of returned orders
- Added VAT invoice download scripts using Playwright persistent browser
- Initial sync: 226 orders marked as paid, 0 failures

### 2024-12-09: Econt Tracking Integration
- Integrated Econt API into `/admin/shopify-orders` page
- Real-time delivery status from Econt courier
- Added stats: total, delivered, in transit, returned, no tracking
- Expandable rows with tracking event history
- Added Econt environment variables

### 2024-12-09: Users Page Pagination & Learn Content Export
- Added pagination to /admin/users (50 users per page)
- Changed activity counts from 7-day to ALL TIME
- Added body measurements and progress photos tracking
- Fixed production issue with pagination response
- Exported Learn Content System to standalone folder (`learn-content-export/`)
- Added comprehensive documentation for Learn Content adaptation

### 2024-12-08: User Details Popup & Admin Notes
- Implemented user details popup (click row to see full profile)
- Added admin_user_notes table for per-user notes
- Added 7 new features to user details popup
- Fixed data consistency between Shopify Orders and Users pages

### 2024-12-02: Shopify Webhook Integration
- Implemented webhook solution for full PII data on Basic plan
- Created webhook endpoint: `app/api/webhooks/shopify/route.ts`
- Webhooks now automatically capture full customer info

### 2024-12-01: Shipping Address Feature
- Added `shipping_address` and `phone` columns to `pending_orders`
- Updated Shopify sync to capture shipping data
