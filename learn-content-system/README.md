# Learn Content System - Cluster/Pillar Model

**AI-powered educational content management system with topic cluster SEO strategy**

This export contains a complete, production-ready workflow for creating and managing educational content using the **Cluster-Pillar architecture**. Designed for Next.js 14+, Supabase, and OpenRouter AI.

---

## 📚 What is the Cluster-Pillar Model?

The **Cluster-Pillar model** is a proven SEO content strategy:

### **Cluster (Hub Page)**
- **3,500-word** comprehensive overview article
- Acts as the main hub for a broad topic
- Links to 8-12 related pillar articles
- Example: *"Astrology for Beginners - Complete Guide"*

### **Pillar (Spoke Page)**
- **5,500-word** in-depth article on specific subtopic
- Links back to parent cluster
- Links to sibling pillars for internal SEO
- Example: *"The Sun in Astrology - In-Depth Guide"*

### **Why This Works:**
✅ **Internal linking** between cluster and pillars improves SEO
✅ **Topic authority** - Google sees you as an expert
✅ **User engagement** - readers stay on your site longer
✅ **Scalable** - systematically cover all topics in your niche

---

## 🚀 Features

✨ **AI Content Generation**
- Generate 3,500-word clusters and 5,500-word pillars with one click
- Powered by Google Gemini 2.5 Flash Lite via OpenRouter
- Auto-generates SEO metadata, slugs, excerpts, and hero images

🔗 **Smart Internal Linking**
- AI automatically creates links to existing content
- Validates all internal links before publishing
- Auto-fixes broken links and URL mismatches

🎨 **AI Image Generation**
- Hero images via Gemini 2.5 Flash Image
- 16:9 aspect ratio optimized for social sharing
- Automatic upload to Supabase Storage

📊 **Dashboard & Analytics**
- Visual cluster/pillar relationship tree
- Track completion % for each cluster
- Identify missing pillars and orphan content

🧠 **AI Cluster Suggestions**
- Analyzes your existing content
- Suggests 8-10 new cluster ideas with SEO potential
- Auto-generates pillar topics for each cluster

---

## 📂 What's Included

```
learn-content-export/
├── README.md                          # This file
├── INTEGRATION.md                     # Step-by-step setup guide
├── .env.example                       # Environment variables template
├── app/
│   ├── admin/
│   │   └── learn-content/
│   │       └── page.tsx               # Admin dashboard page
│   └── api/
│       └── admin/
│           ├── create-cluster/        # Generate cluster content
│           ├── create-pillar/         # Generate pillar content
│           ├── suggest-all-clusters/  # AI suggestions
│           ├── generate-learn-guide/  # Generic guide generation
│           └── save-learn-guide/      # Save guide to database
├── components/
│   └── admin/
│       ├── LearnContentCreatorTab.tsx # AI content creator UI
│       ├── LearnContentDashboard.tsx  # Visual cluster/pillar tree
│       ├── LearnContentManagementTab.tsx # Edit/publish UI
│       ├── LearnContentInstructions.tsx # In-app help guide
│       ├── ClusterSuggestionsPanel.tsx # AI suggestions UI
│       ├── CreateClusterModal.tsx     # Create cluster modal
│       ├── SchedulePublishModal.tsx   # Schedule publishing
│       └── AdminTabs.tsx              # Tab navigation component
├── lib/
│   ├── ai/
│   │   ├── client.ts                  # OpenRouter client config
│   │   ├── models.ts                  # AI models configuration
│   │   └── image-generation.ts        # Gemini image generation
│   └── utils/
│       ├── slugify.ts                 # Bulgarian→Latin slugs
│       ├── check-guide-exists.ts      # Find existing content
│       ├── check-duplicate.ts         # Prevent duplicates
│       └── validate-links.ts          # Link validation & auto-fix
└── supabase/
    └── migrations/
        └── 001_learn_content_schema.sql # Database schema
```

---

## ⚙️ Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + Storage)
- **OpenRouter API** (AI content generation)
  - Google Gemini 2.5 Flash Lite (content)
  - Google Gemini 2.5 Flash Image (images)
- **Tailwind CSS** (UI styling)
- **shadcn/ui** (UI components)

---

## 🎯 Prerequisites

Before integrating, ensure you have:

1. **Next.js 14+** project with App Router
2. **Supabase** project (free tier works)
3. **OpenRouter API key** ([openrouter.ai](https://openrouter.ai))
4. **shadcn/ui** components installed (Button, Input, Textarea, Select, Badge)
5. **Supabase Auth** configured with user profiles

---

## 🔧 Quick Start

### 1. Copy Files to Your Project

```bash
# From learn-content-export/ directory:
cp -r app/* YOUR_PROJECT/app/
cp -r components/* YOUR_PROJECT/components/
cp -r lib/* YOUR_PROJECT/lib/
cp supabase/migrations/001_learn_content_schema.sql YOUR_PROJECT/supabase/migrations/
```

### 2. Install Dependencies

```bash
npm install openai
```

### 3. Configure Environment Variables

Copy `.env.example` to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually run SQL in Supabase Dashboard
# Copy contents of 001_learn_content_schema.sql
```

### 5. Make Your First User Admin

```sql
-- In Supabase SQL Editor:
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

### 6. Access Admin Panel

Navigate to: `http://localhost:3000/admin/learn-content`

---

## 📖 Usage

### Creating Your First Cluster

1. Go to `/admin/learn-content`
2. Click **"AI Cluster Ideas"** tab
3. Click **"Генерирай Предложения"** for AI suggestions
4. OR use **"AI Guide Creator"** tab to create manually:
   - Enter cluster title (e.g., "Planets in Astrology")
   - Select category (planets, signs, houses, aspects, guides)
   - Add keywords (optional)
   - Click **"Генерирай Guide"**
5. AI generates 3,500-word article + 8 pillar suggestions
6. Review and click **"Публикувай"**

### Creating Pillars from Cluster

1. Go to **"Dashboard"** tab
2. Find your cluster and expand it
3. See suggested pillars (orange badges)
4. Click **"Създай"** next to a pillar
5. AI generates 5,500-word pillar with:
   - Link back to cluster
   - Links to sibling pillars
   - SEO-optimized content
6. Review and publish

---

## 🎨 Customization

### Adapting to Your Niche

The system was built for astrology content but is **100% adaptable**:

#### 1. Update Categories

Edit categories in:
- `app/api/admin/create-cluster/route.ts` (line 13-30)
- `components/admin/LearnContentCreatorTab.tsx` (line 206-218)

Example for **cooking niche**:
```typescript
const categories = {
  recipes: ['Pasta', 'Salads', 'Desserts', 'Breakfast'],
  techniques: ['Knife Skills', 'Grilling', 'Baking', 'Sautéing'],
  ingredients: ['Vegetables', 'Meats', 'Spices', 'Dairy'],
};
```

#### 2. Modify AI Prompts

Prompts are in:
- `app/api/admin/create-cluster/route.ts` (line 256-318)
- `app/api/admin/create-pillar/route.ts` (line 126-211)

Change tone, style, and domain expertise:
```typescript
content: `You are an EXPERT chef and culinary instructor...`
```

#### 3. Adjust Word Counts

Modify target word counts:
```typescript
const targetWords = type === 'cluster' ? 2000 : 4000; // Shorter guides
```

---

## 🔐 Security Notes

✅ **Row Level Security (RLS)** is enabled
✅ Admin-only routes check `is_admin` field
✅ Supabase Service Role Key used for server-side operations
❌ **NEVER** expose service role key to client

---

## 🌍 Bulgarian Language Support

The system includes **Bulgarian→Latin transliteration** for URL slugs:

```typescript
"Планети в астрологията" → "planeti-v-astrologiyata"
```

To remove/modify:
- Edit `lib/utils/slugify.ts`

---

## 🐛 Troubleshooting

### "Unauthorized" Error
→ User is not marked as admin. Run:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

### "OpenRouter API Error"
→ Check your API key and credits at [openrouter.ai/keys](https://openrouter.ai/keys)

### Broken Internal Links
→ System auto-fixes most issues. Check console for warnings.

### Missing shadcn/ui Components
→ Install required components:
```bash
npx shadcn-ui@latest add button input textarea select badge
```

---

## 💰 Cost Estimate

**OpenRouter API costs** (approximate):

| Task | Model | Cost |
|------|-------|------|
| Generate Cluster (3,500 words) | Gemini 2.5 Flash Lite | ~$0.01 |
| Generate Pillar (5,500 words) | Gemini 2.5 Flash Lite | ~$0.015 |
| Generate Hero Image | Gemini 2.5 Flash Image | ~$0.02 |
| AI Cluster Suggestions | Gemini 2.0 Thinking (FREE) | $0.00 |

**Total for 1 cluster + 10 pillars:** ~$0.40

---

## 📝 License

This code is provided **as-is** for educational and commercial use. No attribution required, but appreciated!

---

## 🤝 Support

For questions or issues, please:
1. Check `INTEGRATION.md` for detailed setup
2. Review inline code comments
3. Test with example data in SQL migration

---

## 🎉 Credits

Built with ❤️ by the Vrachka team using:
- Next.js
- Supabase
- OpenRouter
- Google Gemini AI

**Happy content creating! 🚀**
