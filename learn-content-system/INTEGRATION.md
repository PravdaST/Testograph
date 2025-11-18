# Integration Guide - Learn Content System

This guide walks you through **every step** to integrate the Learn Content System into your existing Next.js project.

---

## Prerequisites Checklist

Before you start, ensure you have:

- [ ] **Next.js 14+** project (App Router)
- [ ] **TypeScript** configured
- [ ] **Supabase** project created
- [ ] **Supabase Auth** set up with user profiles
- [ ] **Tailwind CSS** installed
- [ ] **shadcn/ui** components initialized
- [ ] **OpenRouter API key** ([get one here](https://openrouter.ai/keys))

---

## Step 1: Install Dependencies

```bash
# Required: OpenAI SDK (used by OpenRouter)
npm install openai

# Optional: If you don't have shadcn/ui
npx shadcn-ui@latest init
```

---

## Step 2: Install shadcn/ui Components

The system uses these shadcn components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add label
```

---

## Step 3: Copy Files to Your Project

### Option A: Manual Copy (Recommended)

From the `learn-content-export/` directory, copy files to your project:

```bash
# Admin page
cp app/admin/learn-content/page.tsx YOUR_PROJECT/app/admin/learn-content/page.tsx

# API routes
mkdir -p YOUR_PROJECT/app/api/admin
cp -r app/api/admin/* YOUR_PROJECT/app/api/admin/

# Components
mkdir -p YOUR_PROJECT/components/admin
cp -r components/admin/* YOUR_PROJECT/components/admin/

# Utilities
mkdir -p YOUR_PROJECT/lib/{ai,utils}
cp -r lib/ai/* YOUR_PROJECT/lib/ai/
cp -r lib/utils/* YOUR_PROJECT/lib/utils/

# Database migration
cp supabase/migrations/001_learn_content_schema.sql YOUR_PROJECT/supabase/migrations/
```

### Option B: Selective Copy (Advanced)

If you already have some files (e.g., `slugify.ts`), only copy what you need:

**Minimum required files:**
- `app/admin/learn-content/page.tsx`
- `app/api/admin/create-cluster/route.ts`
- `app/api/admin/create-pillar/route.ts`
- `app/api/admin/suggest-all-clusters/route.ts`
- All files in `components/admin/`
- All files in `lib/utils/` (or merge with existing)
- `lib/ai/client.ts`, `lib/ai/models.ts`, `lib/ai/image-generation.ts`

---

## Step 4: Configure Environment Variables

Add to your `.env.local`:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenRouter API (NEW)
OPENROUTER_API_KEY=sk-or-v1-...

# App URL (used for metadata and AI API referrers)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to get OpenRouter API Key:**
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up/login (GitHub OAuth available)
3. Create new API key
4. Add credits (minimum $5, pay-as-you-go)

---

## Step 5: Set Up Supabase Database

### Option A: Using Supabase CLI (Recommended)

```bash
# Initialize Supabase if not already done
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

### Option B: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy entire contents of `supabase/migrations/001_learn_content_schema.sql`
4. Paste and click **Run**

---

## Step 6: Configure Supabase Storage (for AI Images)

### Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Create new bucket named: `blog-images` (or your preferred name)
3. Make it **public** (or configure RLS policies)

### Update Image Upload Code

Edit `lib/supabase/storage.ts` (create if doesn't exist):

```typescript
import { createClient } from '@/lib/supabase/server';

export async function uploadImage({
  buffer,
  filename,
  contentType,
  metadata,
}: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata?: { prompt?: string; altText?: string };
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from('blog-images') // ← Your bucket name
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}
```

---

## Step 7: Make Your First User Admin

Run this SQL in **Supabase SQL Editor**:

```sql
-- Replace with your email
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

**Verify:**
```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'your@email.com';
```

You should see `is_admin = true`.

---

## Step 8: Adapt to Your Project Structure

### If You Use Different Supabase Client Paths

The code imports Supabase client from:
```typescript
import { createClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
```

If your paths are different (e.g., `@/utils/supabase`), do a **find & replace**:

```bash
# In learn-content-export/ folder
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/lib\/supabase/@\/utils\/supabase/g'
```

### If You Use Different UI Component Paths

The code imports from:
```typescript
import { Button } from '@/components/ui/button';
```

If your path is different, update accordingly.

### If You Use Different Utility Paths

The code imports from `@/lib/utils/slugify`, `@/lib/ai/image-generation`, etc.

Adjust imports if your folder structure differs.

---

## Step 9: Test Admin Panel Access

### Start Development Server

```bash
npm run dev
```

### Navigate to Admin Panel

Go to: `http://localhost:3000/admin/learn-content`

**Expected behavior:**
- ✅ Redirects to login if not authenticated
- ✅ Redirects to dashboard if not admin
- ✅ Shows Learn Content dashboard if admin

**If you see errors:**
- Check browser console for import errors
- Check server logs for API errors
- Verify Supabase connection

---

## Step 10: Generate Your First Content

### Test Cluster Creation

1. Click **"AI Cluster Ideas"** tab
2. Click **"Генерирай Предложения"** (Generate Suggestions)
3. AI analyzes your (empty) site and suggests clusters
4. Click **"Генерирай този Cluster"** on any suggestion
5. Wait ~10-20 seconds for generation
6. Content appears in **Dashboard** tab

### Test Pillar Creation

1. Go to **Dashboard** tab
2. Expand the cluster you just created
3. See suggested pillars (orange badges)
4. Click **"Създай"** next to a pillar
5. Wait ~15-30 seconds
6. Pillar appears under cluster

---

## Step 11: Customize for Your Niche

### Update Categories

Edit `app/api/admin/create-cluster/route.ts`:

```typescript
// Line 13-30
function getSuggestedPillars(category: string, clusterTitle: string): string[] {
  const suggestions: Record<string, string[]> = {
    // YOUR CATEGORIES HERE
    'recipes': ['Breakfast Recipes', 'Lunch Ideas', 'Dinner Classics'],
    'techniques': ['Knife Skills', 'Grilling Mastery', 'Baking Basics'],
    // ...
  };
  return suggestions[category] || [];
}
```

Also update in `components/admin/LearnContentCreatorTab.tsx`:

```typescript
// Line 206-218
<SelectContent>
  <SelectItem value="recipes">🍳 Recipes</SelectItem>
  <SelectItem value="techniques">🔪 Techniques</SelectItem>
  {/* ... */}
</SelectContent>
```

### Update AI Prompts

Edit the system prompts in:
- `app/api/admin/create-cluster/route.ts` (line 256-318)
- `app/api/admin/create-pillar/route.ts` (line 126-211)

Example for **fitness niche**:

```typescript
{
  role: 'system',
  content: `You are an EXPERT fitness trainer and nutrition specialist writing educational content.

CRITICAL - ENGLISH LANGUAGE:
- Write in natural, fluent English
- Use proper fitness and nutrition terminology
- Professional yet accessible tone

CATEGORIES:
- workouts: Exercise routines and training programs
- nutrition: Diet plans and meal guides
- recovery: Rest and recovery techniques
- mindset: Mental health and motivation

// ... rest of prompt
```

---

## Step 12: Frontend Display (Optional)

The system only handles **content creation**. To display guides on your site:

### Create Display Page

`app/learn/[topic]/[category]/[slug]/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function LearnGuidePage({
  params,
}: {
  params: { topic: string; category: string; slug: string };
}) {
  const supabase = await createClient();

  const { data: guide } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('category', 'learn-guide')
    .eq('status', 'published')
    .single();

  if (!guide) return notFound();

  return (
    <article>
      <h1>{guide.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: guide.content }} />
    </article>
  );
}
```

### Generate Metadata for SEO

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: guide } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!guide) return {};

  return {
    title: guide.meta_title || guide.title,
    description: guide.meta_description,
    openGraph: {
      images: [guide.featured_image_url],
    },
  };
}
```

---

## Step 13: Configure Row Level Security (RLS)

The migration includes RLS policies, but **verify** they're enabled:

### Check RLS Status

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'blog_posts';
```

Should return `rowsecurity = true`.

### Test Policies

```sql
-- As anonymous user (should only see published)
SELECT count(*) FROM blog_posts WHERE status = 'published';

-- As admin (should see all)
SET request.jwt.claim.sub = 'YOUR_ADMIN_USER_ID';
SELECT count(*) FROM blog_posts;
```

---

## Step 14: Add to Navigation (Optional)

Add link to admin panel in your layout:

```tsx
// In your admin layout or navbar
{user?.is_admin && (
  <Link href="/admin/learn-content">
    Learn Content
  </Link>
)}
```

---

## Troubleshooting Common Issues

### Issue: "Module not found: Can't resolve '@/lib/utils'"

**Solution:** You're missing the `cn` utility from shadcn/ui:

```bash
npx shadcn-ui@latest add utils
```

Or manually create `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Issue: "useToast is not defined"

**Solution:** Install toast component:

```bash
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sonner
```

### Issue: "OpenRouter API Error 401"

**Solution:** Invalid API key. Check:
1. Key is correctly copied to `.env.local`
2. No extra spaces or quotes
3. Server restarted after adding env var

### Issue: "Supabase RLS policy violation"

**Solution:** User is not admin. Run:

```sql
UPDATE profiles SET is_admin = true WHERE id = 'USER_ID';
```

### Issue: "Image upload failed"

**Solution:**
1. Check storage bucket exists: `blog-images`
2. Bucket is public OR has correct RLS policies
3. Update bucket name in `lib/supabase/storage.ts`

---

## Next Steps

✅ Content creation is working!

Now you can:
1. **Customize categories** for your niche
2. **Adjust AI prompts** for your tone/style
3. **Create frontend pages** to display content
4. **Add pagination** for guide listings
5. **Implement search** across guides
6. **Track analytics** (view counts already in DB)

---

## Advanced Customization

### Schedule Publishing

The system supports scheduled publishing:

```typescript
// In CreateClusterModal or LearnContentCreatorTab
scheduledFor: '2025-12-25T08:00:00Z'
```

Set up a cron job to auto-publish:

```sql
-- Cron job (Supabase Edge Function)
UPDATE blog_posts
SET status = 'published', published_at = NOW()
WHERE status = 'draft'
  AND scheduled_for <= NOW();
```

### Multi-language Support

Add `language` field to `blog_posts`:

```sql
ALTER TABLE blog_posts ADD COLUMN language TEXT DEFAULT 'bg';
```

Update prompts to generate in different languages.

### Custom AI Models

Switch models in `lib/ai/models.ts`:

```typescript
export const AI_MODELS = {
  content: {
    id: 'anthropic/claude-3.5-sonnet', // Use Claude instead
    // ...
  }
};
```

---

## Cost Optimization Tips

1. **Use FREE models for suggestions:**
   - `gemini-2.0-flash-thinking-exp:free` (already used)

2. **Cache AI responses** (Redis, Upstash)
   - Store generated content before saving
   - Retry without regenerating if DB insert fails

3. **Batch operations:**
   - Generate multiple pillars in parallel
   - Single API call for metadata generation

4. **Use cheaper models for metadata:**
   - Gemini Flash Lite is already cheap (~$0.00001/word)

---

## Support & Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **OpenRouter Docs:** [openrouter.ai/docs](https://openrouter.ai/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)

---

## Summary Checklist

- [ ] Dependencies installed (`openai`, shadcn components)
- [ ] Files copied to project
- [ ] Environment variables configured
- [ ] Database migration run
- [ ] First user made admin
- [ ] Admin panel accessible
- [ ] Test cluster created successfully
- [ ] Test pillar created successfully
- [ ] Categories customized (if needed)
- [ ] AI prompts adjusted (if needed)
- [ ] Frontend display page created (optional)

**You're ready to create amazing content! 🎉**
