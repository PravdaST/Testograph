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

### Known Issue: Shipping Address Data

**Problem:** Shopify API returns `shipping_address` with only `country: "Bulgaria"` - no street address, city, or phone.

**Cause:** Shopify checkout is not configured to collect shipping address fields.

**Solution:** Configure in Shopify Admin:
1. Settings → Checkout → Customer information
2. Enable required fields: Address, City, Phone
3. Settings → Shipping and delivery → Configure shipping zones

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

### 2024-12-01: Shipping Address Feature
- Added `shipping_address` (JSONB) and `phone` (TEXT) columns to `pending_orders`
- Updated Shopify sync to capture shipping data from multiple sources
- Added `update-shipping` action to backfill existing orders
- Updated admin UI to display shipping address in order details
- **Note:** Shopify currently not returning full address data - needs checkout configuration
