# 🚀 START HERE - Quick Setup Guide

Welcome to the **Learn Content System**! This guide will get you up and running in **15 minutes**.

---

## What You're About to Install

A complete **AI-powered content management system** that creates:

- **Cluster guides** (3,500 words) - Comprehensive overview articles
- **Pillar guides** (5,500 words) - Deep-dive subtopic articles
- **Smart internal linking** between all content
- **AI-generated hero images** for every article
- **SEO-optimized metadata** automatically

**Cost:** ~$0.01-0.02 per article (via OpenRouter API)

---

## Prerequisites (5 min)

Make sure you have:

- [ ] **Next.js 14+** project (App Router)
- [ ] **Supabase** account & project
- [ ] **OpenRouter** account ([sign up here](https://openrouter.ai))
- [ ] **$5 in OpenRouter credits** (to get started)

---

## Quick Setup (10 min)

### Step 1: Copy Files (2 min)

```bash
# Navigate to your Next.js project root
cd /path/to/your-project

# Copy all files from learn-content-export
cp -r /path/to/learn-content-export/app/* ./app/
cp -r /path/to/learn-content-export/components/* ./components/
cp -r /path/to/learn-content-export/lib/* ./lib/
cp /path/to/learn-content-export/supabase/migrations/001_learn_content_schema.sql ./supabase/migrations/
```

### Step 2: Install Dependencies (2 min)

```bash
# Core dependency
npm install openai

# UI components (if you don't have shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea label select badge radio-group
```

### Step 3: Configure Environment (2 min)

Add to your `.env.local`:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenRouter (NEW - get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-...

# Your site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Database Migration (2 min)

**Option A:** Using Supabase CLI

```bash
supabase db push
```

**Option B:** Manual SQL

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_learn_content_schema.sql`
3. Paste and click **Run**

### Step 5: Make Yourself Admin (1 min)

In Supabase SQL Editor:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

### Step 6: Test It! (3 min)

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/admin/learn-content`
3. Click **"AI Cluster Ideas"** tab
4. Click **"Генерирай Предложения"**
5. Wait 10 seconds
6. Click **"Генерирай този Cluster"** on any suggestion
7. **Success!** 🎉

---

## What to Read Next

Now that it's installed, customize for your niche:

1. **README.md** - Overview of features & capabilities
2. **INTEGRATION.md** - Detailed setup & customization guide
3. **DEPENDENCIES.md** - Full list of required packages
4. **PROJECT_INFO.md** - Version history & technical details

---

## Customization (5 min)

### Change Categories for Your Niche

Edit `app/api/admin/create-cluster/route.ts` (line 13-30):

```typescript
// Replace astrology categories with your niche
const suggestions: Record<string, string[]> = {
  // Example for a cooking blog:
  'recipes': ['Pasta', 'Salads', 'Desserts', 'Breakfast'],
  'techniques': ['Knife Skills', 'Grilling', 'Baking'],
  'ingredients': ['Vegetables', 'Meats', 'Spices'],
};
```

Also update dropdown in `components/admin/LearnContentCreatorTab.tsx` (line 206-218).

### Update AI Voice & Tone

Edit prompts in:
- `app/api/admin/create-cluster/route.ts` (line 256)
- `app/api/admin/create-pillar/route.ts` (line 126)

```typescript
{
  role: 'system',
  content: `You are an EXPERT [YOUR NICHE] writer...`
}
```

---

## Common Issues & Fixes

### "Unauthorized" Error

→ User not admin. Run:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

### "OpenRouter API Error"

→ Check API key at [openrouter.ai/keys](https://openrouter.ai/keys)
→ Ensure you have credits ($5 minimum deposit)

### "Module not found: @/components/ui/button"

→ Install shadcn components:
```bash
npx shadcn-ui@latest add button input textarea select badge
```

### "Image upload failed"

→ Create Supabase Storage bucket named `blog-images`
→ Make it public or configure RLS

---

## File Structure Reference

```
your-project/
├── app/
│   ├── admin/learn-content/page.tsx    ← Admin dashboard
│   └── api/admin/
│       ├── create-cluster/              ← Generate clusters
│       ├── create-pillar/               ← Generate pillars
│       └── suggest-all-clusters/        ← AI suggestions
├── components/admin/                    ← 9 UI components
├── lib/
│   ├── ai/                              ← AI client & image gen
│   └── utils/                           ← Helpers (slugify, validation)
└── supabase/migrations/                 ← Database schema
```

---

## Creating Your First Content

### Method 1: AI Suggestions (Recommended)

1. Go to `/admin/learn-content`
2. **"AI Cluster Ideas"** tab
3. **"Генерирай Предложения"** button
4. AI analyzes your site and suggests 8-10 clusters
5. Click **"Генерирай този Cluster"** on your favorite
6. Wait ~15 seconds
7. Done! View in **Dashboard** tab

### Method 2: Manual Creation

1. **"AI Guide Creator"** tab
2. Enter cluster title: *"Complete Guide to [Your Topic]"*
3. Select category
4. Add keywords (optional)
5. Click **"Генерирай Guide"**
6. Preview → **"Публикувай"**

### Method 3: Create Pillars from Cluster

1. **Dashboard** tab
2. Expand any cluster
3. See suggested pillars (orange badges)
4. Click **"Създай"** next to pillar
5. Wait ~20 seconds
6. Auto-linked to cluster!

---

## Cost Calculator

| Task | Cost |
|------|------|
| 1 cluster (3,500 words) | $0.01 |
| 1 pillar (5,500 words) | $0.015 |
| 1 hero image | $0.02 |
| AI suggestions (FREE model) | $0.00 |

**Example budget:**
- 10 clusters + 100 pillars = $1.60 total
- That's **$0.014/article** on average!

**Compare to human writers:**
- Freelancer: $50-200/article
- Agency: $200-500/article
- **AI:** $0.01-0.02/article ✅

---

## Production Tips

### Before Launching

- [ ] Test with 3-5 articles first
- [ ] Review generated content quality
- [ ] Adjust AI prompts for your brand voice
- [ ] Set up Supabase Storage bucket
- [ ] Configure RLS policies
- [ ] Create frontend display pages (see INTEGRATION.md)

### Scaling Up

Once you're happy:
- Generate 50-100 articles in batches
- Schedule publishing over 3-6 months
- Build internal linking network
- Monitor SEO performance
- Iterate on prompts based on results

---

## Support

**Need help?**

1. **Check docs first:**
   - README.md (overview)
   - INTEGRATION.md (detailed setup)
   - DEPENDENCIES.md (packages)

2. **Common issues:**
   - All covered in INTEGRATION.md

3. **Still stuck?**
   - Check inline code comments
   - Review Supabase logs
   - Check browser console

---

## What's Next?

You now have a **production-ready content creation system**! 🎉

**Recommended next steps:**

1. ✅ **Generate 1 cluster + 3 pillars** (test run)
2. 📝 **Customize categories** for your niche
3. 🎨 **Adjust AI prompts** to match your voice
4. 🌐 **Create frontend pages** to display content
5. 📊 **Track analytics** (view counts already in DB)
6. 🚀 **Scale to 100s of articles**

---

## Final Checklist

Before you start creating content:

- [ ] All files copied to project
- [ ] `npm install openai` completed
- [ ] shadcn/ui components installed
- [ ] Environment variables configured
- [ ] Database migration run
- [ ] First user marked as admin
- [ ] Can access `/admin/learn-content`
- [ ] Successfully generated 1 test cluster
- [ ] Categories customized (if needed)
- [ ] AI prompts adjusted (if needed)

**All checked?** You're ready to create amazing content! 🚀

---

## Quick Links

- **OpenRouter Dashboard:** [openrouter.ai/keys](https://openrouter.ai/keys)
- **Supabase Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard)
- **shadcn/ui Docs:** [ui.shadcn.com](https://ui.shadcn.com)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

**Happy creating! May your clusters be comprehensive and your pillars be deep! 📚✨**
