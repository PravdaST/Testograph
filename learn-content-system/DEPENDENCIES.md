# Dependencies & Requirements

This document lists all required and optional dependencies for the Learn Content System.

---

## Required npm Packages

### Core Dependencies

```json
{
  "dependencies": {
    // Next.js & React
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",

    // Supabase
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",

    // AI & API
    "openai": "^4.20.0",

    // UI Components (shadcn/ui)
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",

    // Form & UI Libraries
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-radio-group": "^1.1.0",
    "@radix-ui/react-select": "^2.0.0",

    // TypeScript (dev dependency)
    "typescript": "^5.0.0"
  }
}
```

### Install Command

```bash
npm install openai @supabase/supabase-js @supabase/ssr
```

---

## shadcn/ui Components

These UI components are required. Install via shadcn CLI:

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add radio-group

# Optional (for notifications)
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sonner
```

**Note:** shadcn/ui components are copied directly into your project, not installed as npm packages.

---

## TypeScript Types

If you're using TypeScript, ensure these types are installed:

```bash
npm install -D @types/node @types/react @types/react-dom
```

---

## Tailwind CSS Configuration

Ensure Tailwind CSS is installed and configured:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Tailwind Config (tailwind.config.ts):**

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          500: '#a855f7', // purple-500 or your brand color
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

---

## Supabase CLI (Optional)

For database migrations:

```bash
npm install -D supabase
```

Or use the global CLI:

```bash
brew install supabase/tap/supabase  # macOS
scoop install supabase              # Windows
npm install -g supabase             # Cross-platform
```

---

## Environment Variables Required

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Structure Requirements

Your project must have:

```
your-project/
├── app/                    # Next.js App Router
├── components/             # React components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities
│   ├── ai/                 # AI utilities
│   ├── utils/              # General utilities
│   └── supabase/           # Supabase clients
├── supabase/
│   └── migrations/         # Database migrations
├── .env.local              # Environment variables
├── tailwind.config.ts      # Tailwind config
└── tsconfig.json           # TypeScript config
```

---

## Supabase Project Requirements

### Required Features Enabled

1. **Supabase Auth** - User authentication
2. **PostgreSQL Database** - Data storage
3. **Supabase Storage** - Image uploads

### Database Extensions

Enable these extensions in Supabase SQL Editor:

```sql
-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For full-text search (optional)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## OpenRouter Account Setup

1. **Create Account:**
   - Visit [openrouter.ai](https://openrouter.ai)
   - Sign up with GitHub or email

2. **Add Credits:**
   - Minimum $5 deposit
   - Pay-as-you-go pricing

3. **Get API Key:**
   - Go to [openrouter.ai/keys](https://openrouter.ai/keys)
   - Create new key
   - Copy to `.env.local`

---

## Browser Requirements

Modern browsers with support for:
- ES2020+
- CSS Grid & Flexbox
- Fetch API
- Local Storage

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Development Environment

### Recommended Setup

- **Node.js:** v18.17.0 or higher
- **npm:** v9.0.0 or higher (or yarn/pnpm)
- **TypeScript:** v5.0.0 or higher

### Verify Versions

```bash
node --version  # Should be >= 18.17.0
npm --version   # Should be >= 9.0.0
```

---

## Optional Dependencies

### For Enhanced Features

```bash
# Image optimization
npm install sharp

# Markdown support (if using MD in content)
npm install remark remark-html

# Code syntax highlighting
npm install prismjs

# Analytics
npm install @vercel/analytics
```

---

## Compatibility Notes

### Next.js Versions

- ✅ **Next.js 14.x** - Fully tested
- ✅ **Next.js 15.x** - Compatible
- ✅ **Next.js 16.x** - Compatible (Turbopack supported)
- ❌ **Next.js 13.x** - Not recommended (App Router differences)

### React Versions

- ✅ **React 18.x** - Fully supported
- ✅ **React 19.x** - Compatible
- ❌ **React 17.x** - Not compatible (needs React 18+ hooks)

### TypeScript

- ✅ **TypeScript 5.x** - Recommended
- ⚠️ **TypeScript 4.x** - May work but not tested

---

## Troubleshooting Dependencies

### Issue: "Cannot find module 'openai'"

```bash
npm install openai
```

### Issue: "Module not found: Can't resolve '@/components/ui/button'"

```bash
npx shadcn-ui@latest add button
```

### Issue: "Class variance authority not found"

```bash
npm install class-variance-authority clsx tailwind-merge
```

### Issue: "lucide-react icons not rendering"

```bash
npm install lucide-react
```

---

## Minimal Installation Guide

For the **absolute minimum** to run the system:

```bash
# 1. Install core dependencies
npm install openai @supabase/supabase-js @supabase/ssr

# 2. Install shadcn/ui (initializes all necessary UI dependencies)
npx shadcn-ui@latest init

# 3. Add required components
npx shadcn-ui@latest add button input textarea label select badge radio-group

# 4. Done!
```

---

## Version Compatibility Matrix

| Package | Minimum Version | Tested Version | Notes |
|---------|----------------|----------------|-------|
| next | 14.0.0 | 16.0.3 | App Router required |
| react | 18.0.0 | 19.0.0 | React 19 recommended |
| @supabase/supabase-js | 2.38.0 | 2.45.0 | SSR support needed |
| openai | 4.20.0 | 4.73.0 | OpenRouter compatible |
| typescript | 5.0.0 | 5.3.3 | Latest stable |
| tailwindcss | 3.0.0 | 3.4.0 | v3+ required |

---

## Summary

**Core requirements:**
1. Next.js 14+ (App Router)
2. Supabase project
3. OpenRouter API key
4. shadcn/ui components
5. Tailwind CSS

**Total install time:** ~5 minutes
**Disk space:** ~200MB (with node_modules)

That's it! 🎉
