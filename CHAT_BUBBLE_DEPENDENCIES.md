# 💬 Chat Bubble Dependencies - За GitHub Upload

## 📦 Главен компонент

```
src/components/ChatAssistant.tsx
```

---

## 🔗 UI Components (shadcn/ui)

Всички от `src/components/ui/`:

```
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/glass-card.tsx
src/components/ui/scroll-area.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
```

---

## 🪝 Hooks

```
src/hooks/use-toast.ts
```

---

## 🛠️ Utils

```
src/lib/utils.ts
```

---

## 🔌 Supabase Integration

```
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
```

**⚠️ Важно:** Supabase credentials трябва да се конфигурират в `.env` файл:
```env
VITE_SUPABASE_URL=твоят_supabase_url
VITE_SUPABASE_ANON_KEY=твоят_supabase_anon_key
```

---

## 📦 NPM Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "lucide-react": "^0.index",
    "@supabase/supabase-js": "^2.58.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.1"
  }
}
```

---

## 🎨 Tailwind Config (опционално)

Ако използваш custom colors/shadows, добави в `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "hsl(270 75% 60%)",
        // ... други цветове
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(124, 58, 237, 0.08) 100%)',
      },
      backdropBlur: {
        md: '12px',
        lg: '16px',
      }
    }
  }
}
```

---

## 📂 Структура за GitHub

```
your-repo/
├── src/
│   ├── components/
│   │   ├── ChatAssistant.tsx          ← ГЛАВЕН КОМПОНЕНТ
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── glass-card.tsx
│   │       ├── scroll-area.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   └── integrations/
│       └── supabase/
│           ├── client.ts
│           └── types.ts
├── package.json
├── tailwind.config.js (optional)
└── README.md
```

---

## 🚀 Инсталационни команди

```bash
# NPM
npm install react lucide-react @supabase/supabase-js class-variance-authority clsx tailwind-merge

# PNPM
pnpm add react lucide-react @supabase/supabase-js class-variance-authority clsx tailwind-merge

# Yarn
yarn add react lucide-react @supabase/supabase-js class-variance-authority clsx tailwind-merge
```

---

## ⚙️ Supabase Backend Setup

### 1. Database Tables

**`chat_sessions` table:**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  pdf_filename TEXT,
  pdf_url TEXT,
  pdf_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за по-бързи queries
CREATE INDEX idx_chat_sessions_email ON chat_sessions(email);
```

**`chat_messages` table:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за по-бързи queries
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
```

### 2. Edge Functions

**`supabase/functions/chat-assistant/index.ts`** - AI chat logic
**`supabase/functions/process-pdf/index.ts`** - PDF processing

Тези функции са в отделна папка: `supabase/functions/`

---

## 📝 Environment Variables (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI (за Edge Functions)
OPENAI_API_KEY=sk-your-openai-key-here
```

**⚠️ НЕ качвай .env файла в GitHub!** Добави го в `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

---

## 📋 Минимален package.json

```json
{
  "name": "chat-bubble-component",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "latest",
    "@supabase/supabase-js": "^2.58.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 🎯 Usage Example

```tsx
import ChatAssistant from '@/components/ChatAssistant';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatAssistant />
    </div>
  );
}
```

Компонентът автоматично се позиционира `fixed bottom-6 right-6` и показва floating chat bubble.

---

## ✨ Features

- ✅ Email validation преди чат
- ✅ Session persistence в Supabase
- ✅ PDF upload & analysis
- ✅ AI chat с OpenAI
- ✅ Action button parsing `[ACTION_BUTTON:Label:URL]`
- ✅ Typing indicator "Т.Богданов пише..."
- ✅ Auto-scroll на съобщения
- ✅ Responsive mobile design
- ✅ Dark mode support
- ✅ Glass morphism UI

---

## 🐛 Common Issues

### Issue 1: "Cannot find module '@/components/ui/button'"
**Решение:** Провери че имаш path alias в `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: Tailwind classes не работят
**Решение:** Добави в `tailwind.config.js`:
```javascript
content: ["./src/**/*.{js,jsx,ts,tsx}"]
```

### Issue 3: Supabase connection error
**Решение:** Провери `.env` файла и че имаш правилни credentials.

---

## 📚 Documentation Links

- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

MIT (или каквато искаш)

---

## 👨‍💻 Author

Testograph Team

---

## 🔥 Quick Start

1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env` и попълни credentials
4. Setup Supabase tables (виж по-горе)
5. Deploy Edge Functions
6. `npm run dev`

Готово! Chat bubble-ът трябва да работи на `http://localhost:5173` 🚀