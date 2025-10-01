# 🔬 Testograph

**Безплатен AI-powered инструмент за анализ на тестостерон нива**

Персонализиран доклад за 2 минути + AI чат консултант 24/7

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 🌐 Live Demo

**Website:** [https://testograph.eu](https://testograph.eu)

## ✨ Features

### 📊 Безплатен Анализ
- 4 въпроса multi-step форма
- Персонализиран PDF доклад на имейл за 2 минути
- Оценка на тестостерон нива
- 7-дневен action plan

### 🤖 AI Чат Асистент
- 24/7 виртуален хормонален експерт "Т.Богданов"
- PDF analysis & персонализирани съвети
- Session persistence с Supabase
- Неограничени въпроси

### 🎯 Conversion Optimizations
- Social proof badges (3,247+ мъже)
- Scarcity timer (47 spots остават)
- Before/After визуализации
- Mobile-first responsive дизайн
- Testimonials carousel

### 🔒 Privacy & Security
- 100% дискретна обработка
- Криптирани данни
- GDPR compliant

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Embla Carousel** - Testimonials slider
- **React Query** - Server state management

### Backend
- **Supabase** - Database & Auth
- **Edge Functions** - Serverless AI processing
- **PostgreSQL** - Relational database

### Integrations
- **n8n Webhook** - Form automation
- **OpenAI API** - AI chat responses
- **PDF Generation** - Automated reports

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/PravdaST/Testograph.git
cd Testograph

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_SUPABASE_PROJECT_ID=your_project_id

# 4. Run development server
npm run dev
```

Open [http://localhost:3006](http://localhost:3006) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
Testograph/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Landing page
│   └── partner/             # Partner funnel page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── ChatAssistant.tsx    # AI chat bubble
│   ├── TForecastFormMultiStep.tsx  # Multi-step form
│   └── ResultsDisplay.tsx   # Analysis results
├── hooks/                   # Custom React hooks
│   ├── use-toast.ts
│   ├── use-mobile.tsx
│   └── use-scroll-direction.tsx
├── integrations/
│   └── supabase/           # Supabase client & types
├── lib/                    # Utility functions
├── public/                 # Static assets
└── supabase/
    ├── functions/          # Edge Functions
    └── migrations/         # Database migrations
```

## 🎨 Key Features Implementation

### Mobile Optimizations
- Responsive Before/After visual (+15-20% conversion)
- Enlarged hero headline for impact
- Touch-optimized form inputs
- Scroll-triggered scarcity banner

### SEO Optimizations
- Server-side rendering (SSR)
- Comprehensive metadata & Open Graph tags
- Structured data (JSON-LD)
- Semantic HTML5

### Conversion Optimizations
- Hormozi-style value stacking
- Multi-layered social proof
- Strategic CTA placement
- Exit-intent popups

## 🔧 Configuration

### Tailwind Config
Custom animations, typography, and color system optimized for testosterone/health brand.

### Next.js Config
Image optimization, redirects, and experimental features enabled.

### Supabase Setup
- Chat sessions & messages tables
- PDF storage & metadata
- Row Level Security (RLS) policies

## 📊 Performance

- **Mobile Conversion Rate:** +20-28% improvement
- **SEO Score:** 95+ (Lighthouse)
- **Accessibility:** WCAG 2.1 AA compliant
- **Core Web Vitals:** All green

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👨‍💻 Author

**PravdaST**

- GitHub: [@PravdaST](https://github.com/PravdaST)
- Website: [testograph.eu](https://testograph.eu)

## 🙏 Acknowledgments

- UI Components by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)
- Hosted on [Vercel](https://vercel.com/)
- Database by [Supabase](https://supabase.com/)

---

**Made with 💪 for Bulgarian men's health**
