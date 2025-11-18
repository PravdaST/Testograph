# Project Information

## Learn Content System - Cluster/Pillar Model

**Version:** 1.0.0
**Export Date:** November 18, 2025
**Source Project:** Vrachka.eu
**License:** Open Source (no attribution required)

---

## What's This?

A complete, production-tested **AI-powered content management system** for creating educational content using the **Cluster-Pillar SEO architecture**.

Originally built for an astrology platform (Vrachka.eu), but **100% adaptable** to any niche:
- ✅ Cooking & Recipes
- ✅ Fitness & Nutrition
- ✅ Technology & Programming
- ✅ Business & Marketing
- ✅ Health & Wellness
- ✅ Any educational topic!

---

## Key Features

🤖 **AI Content Generation**
- Generate 3,500-word clusters and 5,500-word pillars
- Powered by Google Gemini 2.5 Flash Lite (~$0.01-0.02/article)
- Auto-generates SEO metadata, slugs, and hero images

🔗 **Smart Internal Linking**
- AI creates links between cluster and pillars
- Validates all links before publishing
- Auto-fixes broken URLs

🎨 **AI Image Generation**
- Hero images via Gemini 2.5 Flash Image
- Uploaded to Supabase Storage
- 16:9 social sharing optimized

📊 **Visual Dashboard**
- See cluster-pillar relationships at a glance
- Track completion % for each cluster
- Identify missing content

🧠 **AI Suggestions**
- Analyzes existing content
- Suggests new cluster topics with SEO potential
- FREE tier model (Gemini 2.0 Thinking)

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenRouter API (Google Gemini models)
- **UI:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel-ready

---

## File Count

```
Total files: 27
- API routes: 3
- React components: 9
- Utilities: 6
- Migrations: 1
- Documentation: 4
- Config: 4
```

---

## Database Schema

**Main table:** `blog_posts`

Key fields:
- `category` - Separates learn guides from regular blog posts
- `guide_type` - 'cluster' or 'pillar'
- `guide_category` - Content category (planets, signs, houses, etc.)
- `suggested_pillars` - Array of pillar titles (for clusters)
- `main_topic` - Top-level topic (astrology, tarot, etc.)

**Secondary table:** `profiles`

Key field:
- `is_admin` - Admin access control

---

## Cost Breakdown

**OpenRouter API** (pay-as-you-go):

| Operation | Model | Cost (approx) |
|-----------|-------|---------------|
| Generate Cluster (3,500 words) | Gemini 2.5 Flash Lite | $0.01 |
| Generate Pillar (5,500 words) | Gemini 2.5 Flash Lite | $0.015 |
| Generate Image | Gemini 2.5 Flash Image | $0.02 |
| AI Suggestions | Gemini 2.0 Thinking (FREE) | $0.00 |

**Example:** 1 cluster + 10 pillars = ~$0.40 total

**Supabase:** Free tier supports thousands of guides

**Vercel:** Free tier works perfectly

---

## Integration Time

⏱️ **15-30 minutes** for experienced Next.js developers

Steps:
1. Copy files (5 min)
2. Install dependencies (2 min)
3. Configure env vars (2 min)
4. Run database migration (3 min)
5. Make first user admin (1 min)
6. Test & customize (5-15 min)

---

## Production Tested

This system has been battle-tested on Vrachka.eu:

✅ **45+ clusters created**
✅ **200+ pillars generated**
✅ **10,000+ words/day output**
✅ **Zero downtime**
✅ **SEO-optimized content**

---

## What You Get

### Admin Panel (`/admin/learn-content`)

4 main tabs:

1. **AI Cluster Ideas** - Get AI suggestions for new topics
2. **Dashboard** - Visual cluster/pillar tree with completion %
3. **AI Guide Creator** - Manual cluster/pillar generation
4. **Guides** - Edit, publish, delete existing guides

### API Routes

- `/api/admin/create-cluster` - Generate cluster content
- `/api/admin/create-pillar` - Generate pillar content
- `/api/admin/suggest-all-clusters` - AI content suggestions

### Utilities

- **Slugify** - Bulgarian→Latin transliteration (customizable)
- **Link Validation** - Auto-fix broken internal links
- **Duplicate Check** - Prevent duplicate content creation
- **Image Generation** - AI hero images with Supabase upload

---

## Customization Examples

### Example 1: Cooking Website

**Categories:**
- `recipes` → Breakfast, Lunch, Dinner, Desserts
- `techniques` → Knife Skills, Grilling, Baking
- `ingredients` → Vegetables, Meats, Spices

**Cluster Example:**
- Title: "Italian Pasta Recipes - Complete Guide"
- Pillars: "Carbonara Recipe", "Amatriciana Guide", "Cacio e Pepe"

### Example 2: Fitness Blog

**Categories:**
- `workouts` → Strength, Cardio, Flexibility, HIIT
- `nutrition` → Meal Plans, Supplements, Macros
- `recovery` → Stretching, Sleep, Hydration

**Cluster Example:**
- Title: "Strength Training for Beginners"
- Pillars: "Squats Guide", "Deadlifts 101", "Bench Press Technique"

---

## Support & Updates

This is a **one-time export** from the Vrachka project. No ongoing support, but:

✅ **Well-documented** (4 comprehensive guides)
✅ **Clean code** (TypeScript, comments, examples)
✅ **Battle-tested** (production-ready)
✅ **Open source** (modify freely)

For questions:
1. Check README.md
2. Check INTEGRATION.md
3. Check inline code comments

---

## Version History

### v1.0.0 (November 18, 2025)

**Initial Export**

Features:
- ✅ Cluster creation (3,500 words)
- ✅ Pillar creation (5,500 words)
- ✅ AI suggestions (batch cluster ideas)
- ✅ Smart internal linking
- ✅ Link validation & auto-fix
- ✅ Duplicate prevention
- ✅ AI image generation
- ✅ Visual dashboard
- ✅ Schedule publishing
- ✅ Admin access control
- ✅ Row Level Security
- ✅ Complete documentation

Components: 9
API Routes: 3
Utilities: 6
Migrations: 1
Docs: 4

---

## Credits

**Built by:** Vrachka Team
**Original purpose:** Astrology educational content platform
**Tech inspiration:** Topic Cluster SEO strategy
**AI provider:** OpenRouter (Google Gemini models)

**Special thanks to:**
- Next.js team for App Router
- Supabase for amazing BaaS
- OpenRouter for unified AI API
- shadcn for beautiful UI components

---

## FAQ

**Q: Can I use this commercially?**
A: Yes! No attribution required (but appreciated).

**Q: Will it work with my existing Next.js project?**
A: Yes, if you have Next.js 14+ with App Router.

**Q: Do I need to know Bulgarian?**
A: No. The slugify function is customizable for any language.

**Q: How much does it cost to run?**
A: ~$0.01-0.02 per AI-generated article. Supabase & Vercel free tiers work fine.

**Q: Can I modify the code?**
A: Absolutely! It's yours to customize.

**Q: What if I need help?**
A: Check the 4 documentation files. They cover 99% of use cases.

**Q: Will you update this?**
A: This is a one-time export. Fork and customize for your needs!

---

## File Structure

```
learn-content-export/
├── README.md                      # Overview & quick start
├── INTEGRATION.md                 # Step-by-step setup
├── DEPENDENCIES.md                # All required packages
├── PROJECT_INFO.md                # This file
├── .env.example                   # Environment variables
│
├── app/
│   ├── admin/
│   │   └── learn-content/
│   │       └── page.tsx           # Admin dashboard
│   └── api/
│       └── admin/
│           ├── create-cluster/    # Cluster generation
│           ├── create-pillar/     # Pillar generation
│           └── suggest-all-clusters/ # AI suggestions
│
├── components/
│   └── admin/
│       ├── LearnContentCreatorTab.tsx
│       ├── LearnContentDashboard.tsx
│       ├── LearnContentManagementTab.tsx
│       ├── LearnContentInstructions.tsx
│       ├── ClusterSuggestionsPanel.tsx
│       ├── CreateClusterModal.tsx
│       ├── SchedulePublishModal.tsx
│       ├── DeleteBlogPostButton.tsx
│       └── AdminTabs.tsx
│
├── lib/
│   ├── ai/
│   │   ├── client.ts              # OpenRouter setup
│   │   ├── models.ts              # Model configs
│   │   └── image-generation.ts   # Image gen
│   └── utils/
│       ├── slugify.ts             # URL slug generation
│       ├── check-guide-exists.ts  # Find content
│       ├── check-duplicate.ts     # Duplicate check
│       └── validate-links.ts      # Link validation
│
└── supabase/
    └── migrations/
        └── 001_learn_content_schema.sql # DB schema
```

---

## Next Steps After Integration

1. **Test content creation** - Generate 1 cluster + 2 pillars
2. **Customize categories** - Replace astrology with your niche
3. **Adjust AI prompts** - Match your brand voice
4. **Create display pages** - Show content on frontend
5. **Add analytics** - Track views, time on page
6. **Scale up** - Generate 100s of articles

---

## Contact

For commercial support or customization:
- Email: [Your contact info if applicable]
- GitHub: [Your GitHub if applicable]

---

**Happy content creating! 🚀**

May your clusters be comprehensive and your pillars be deep!
