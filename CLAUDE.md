# Testograph Project Documentation

## Project Overview

Testograph is a Next.js application for testosterone health assessment and personalized recommendations. It includes a quiz system, admin panel, Shopify integration, and user management.

**Tech Stack:**
- Next.js 16 (App Router)
- TypeScript
- Supabase (Database & Auth)
- Tailwind CSS + shadcn/ui
- Shopify Admin API integration

**Dev Server:** `npm run dev` runs on port 3006

---

## Admin Panel (`/admin`)

### Authentication
- Admin access controlled via `admin_users` table in Supabase
- Login at `/admin` redirects to `/admin/dashboard` after auth
- Layout component: `components/admin/AdminLayout.tsx`

### Admin Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin/dashboard` | Overview stats, recent activity |
| Users | `/admin/users` | Quiz users management |
| App Users | `/admin/pro-users` | Mobile app users |
| Business Analytics | `/admin/business-analytics` | Revenue & operations |
| Quiz Analytics | `/admin/analytics` | Quiz completion stats |
| **Shopify Orders** | `/admin/shopify-orders` | Order management |
| Chat Sessions | `/admin/chat-sessions` | AI chat logs |
| Access Control | `/admin/access` | Admin permissions |
| App Data | `/admin/app-data` | App content management |
| Quiz Results | `/admin/quiz-results` | Individual quiz results |
| Affiliates | `/admin/affiliates` | Affiliate tracking |
| Learn Content | `/admin/learn-content` | Educational content |
| Audit Logs | `/admin/audit-logs` | System logs |
| Settings | `/admin/settings` | App configuration |

---

## Shopify Integration

### Environment Variables
```env
SHOPIFY_STORE_DOMAIN="shop.testograph.eu"
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxx"
SHOPIFY_WEBHOOK_SECRET="xxx"
```

### API Routes

#### GET `/api/admin/shopify-sync`
Compares Shopify orders with database, returns:
- Missing orders in DB
- Missing orders in Shopify
- Status mismatches

#### POST `/api/admin/shopify-sync`
Actions:
- `sync-missing` - Import missing orders from Shopify
- `fix-status` - Update payment status mismatches
- `update-shipping` - Backfill shipping addresses for existing orders

#### GET `/api/admin/shopify-orders`
Returns paginated orders from `pending_orders` table with:
- Order details
- Customer info
- Products
- Shipping address
- Phone number

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
| currency | text | BGN |
| status | text | pending/paid |
| products | jsonb | Line items array |
| shipping_address | jsonb | Address object |
| paid_at | timestamp | Payment timestamp |
| created_at | timestamp | Order creation |

### Shopify Webhooks (Recommended)

**Why Webhooks:** Shopify Basic plan restricts PII (Personally Identifiable Information) access via API. However, webhooks **DO receive full PII data** including customer names, addresses, emails, and phone numbers - even on Basic plan.

**Webhook Endpoints:**
- `POST /api/webhooks/shopify` - Handles both Order creation and Order payment events
- `POST /api/webhooks/shopify/order-created` - Re-exports from parent route

**Registered Webhooks in Shopify Admin:**
- Event: "Order creation" → `https://www.testograph.eu/api/webhooks/shopify`
- Event: "Order payment" → `https://www.testograph.eu/api/webhooks/shopify`

**Webhook Data Flow:**
1. Customer places order on shop.testograph.eu
2. Shopify sends webhook with FULL order data (including PII)
3. Webhook endpoint verifies HMAC signature
4. Order is inserted/updated in `pending_orders` table with complete customer info

**Security:**
- All webhooks are verified using HMAC-SHA256 signature
- Secret stored in `SHOPIFY_WEBHOOK_SECRET` environment variable

### Known Issue: Shopify API PII Restriction

**Problem:** Shopify Admin API on Basic plan returns `shipping_address` with only `country: "Bulgaria"` - no street address, city, phone, or customer name.

**Cause:** Protected Customer Data Access (PII) is restricted on Shopify Basic plan. API scopes don't help - this is a plan-level restriction.

**Solution:** Use Shopify Webhooks instead of API polling. Webhooks receive full PII data on all plans. The webhook endpoints (`/api/webhooks/shopify`) are now configured and registered in Shopify Admin.

---

## Database Tables (Supabase)

### Core Tables
- `quiz_results_v2` - Quiz completions with scores
- `pending_orders` - Shopify orders
- `testoup_purchase_history` - Completed purchases
- `admin_users` - Admin access list
- `app_users` - Mobile app registrations
- `chat_sessions` - AI coach conversations

### Quiz Results Schema (`quiz_results_v2`)
- `email`, `first_name`
- `category` (libido/muscle/energy)
- `total_score`
- `determined_level` (low/moderate/good/optimal)
- `workout_location` (home/gym)
- `breakdown_*` scores (symptoms, nutrition, training, sleep_recovery, context)

---

## Key Files Reference

### Admin Components
- `app/admin/shopify-orders/page.tsx` - Shopify orders UI with Sheet details view
- `components/admin/AdminLayout.tsx` - Sidebar navigation

### API Routes
- `app/api/admin/shopify-sync/route.ts` - Shopify sync logic
- `app/api/admin/shopify-orders/route.ts` - Orders CRUD
- `app/api/analytics/funnel-stats/route.ts` - Quiz analytics
- `app/api/webhooks/shopify/route.ts` - Shopify webhook handler (order creation & payment)
- `app/api/webhooks/shopify/order-created/route.ts` - Re-exports from parent

### Integrations
- `integrations/supabase/client.ts` - Supabase browser client
- Uses service role key for API routes to bypass RLS

---

## Development Notes

### Running the Project
```bash
cd Testograph
npm run dev  # Starts on port 3006
```

### Common Tasks

**Sync Shopify Orders:**
```bash
curl -X POST http://localhost:3006/api/admin/shopify-sync \
  -H "Content-Type: application/json" \
  -d '{"action": "sync-missing"}'
```

**Update Shipping Data:**
```bash
curl -X POST http://localhost:3006/api/admin/shopify-sync \
  -H "Content-Type: application/json" \
  -d '{"action": "update-shipping"}'
```

### TypeScript Interfaces

```typescript
interface ShopifyOrder {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  products: Product[];
  total_price: number;
  currency: string;
  status: string;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
}

interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}
```

---

## Recent Changes Log

### 2024-12-02: Shopify Webhook Integration
- Discovered Shopify Basic plan restricts PII access via Admin API (regardless of scopes)
- Implemented webhook solution as webhooks receive full PII data on all plans
- Created webhook endpoint: `app/api/webhooks/shopify/route.ts`
- Registered webhooks in Shopify Admin for Order creation and Order payment events
- Webhooks now automatically capture full customer info (name, email, phone, shipping address)
- Updated documentation with webhook architecture details

### 2024-12-01: Shipping Address Feature
- Added `shipping_address` (JSONB) and `phone` (TEXT) columns to `pending_orders`
- Updated Shopify sync to capture shipping data from multiple sources
- Added `update-shipping` action to backfill existing orders
- Updated admin UI to display shipping address in order details
- **Note:** API-based sync has PII limitations on Basic plan - use webhooks instead
