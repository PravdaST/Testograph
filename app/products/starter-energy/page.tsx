"use client";

import { HeroSection } from "../starter/components/HeroSection";
import { ProblemAgitation } from "../starter/components/ProblemAgitation";
import { SolutionTimeline } from "../starter/components/SolutionTimeline";
import { ValueStackVisual } from "@/components/funnel/ValueStackVisual";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { HowItWorks } from "../starter/components/HowItWorks";
import { IngredientTable } from "../starter/components/IngredientTable";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "../starter/components/GuaranteeSection";
import { FinalCTA } from "../starter/components/FinalCTA";
import { ExitIntentPopup } from "../starter/components/ExitIntentPopup";
import { SocialProofBanner } from "../starter/components/SocialProofBanner";
import { CommunityChatsGrid } from "@/components/funnel/CommunityChatsGrid";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { DetailedTestimonialCards } from "@/components/funnel/DetailedTestimonialCards";
import { ScienceSection } from "@/components/funnel/ScienceSection";
import { SupplementFacts } from "@/components/funnel/SupplementFacts";

export default function StarterEnergyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://testograph.eu/products/starter" />

      {/* Hero Section - ЕНЕРГИЯ ANGLE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            От зомби в 7 сутринта<br />
            <span className="text-primary">до 5км бягане преди работа.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Будилникът. Снуз. Още 10 минути. 3 кафета до обяд. Заспиваш на бюрото. Вкъщи си мъртъв.
            <strong className="text-foreground"> Децата питат "тате защо винаги си уморен?"</strong>
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            1,450+ мъже се събудиха от "енергийния кошмар" за 2 седмици с TestoUP. Без кофеин. Без стимуланти.
          </p>
        </div>
      </section>

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation - ENERGY FOCUS */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Познаваш ли този "живот"?
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              6:30 сутринта. Будилникът. Отваряш очи... и искаш да умреш. Не от депресия. От
              <strong> ФИЗИЧЕСКА ИЗТОЩЕНОСТ</strong>. Като че ли си спал 2 часа. А спал си 7.
            </p>
            <p>
              8:00 - Първо кафе. 10:00 - Второ кафе. 12:00 - Трето кафе. Сърцето ти туптене. Но
              енергията? <strong>Все още зомби</strong>.
            </p>
            <p>
              Обяд. Тежка храна. 14:00 - мозъкът ти изключва. Заспиваш на бюрото. "Концентрацията"
              е спомен от миналото.
            </p>
            <p className="text-xl font-bold text-foreground">
              18:00 - Вкъщи. Децата искат да играят. Ти падаш на дивана.
            </p>
            <p>
              "Тате, защо винаги си уморен?" Това БОЛИ. Защото не избираш. Просто... <strong>нямаш енергия</strong>.
            </p>
            <p>
              Проблемът? Тестостеронът ти е на дъното. Ниският тестостерон = хронична умора. Витамин B12 на дъното.
              Витамин D дефицит. TestoUP съдържа 24000% РДА B12. 700% РДА D3. <strong>Енергията се връща за дни</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* Community Chat Proof */}
      <CommunityChatsGrid />

      {/* Value Stack */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ValueStackVisual
            items={[
              {
                name: "TestoUP бутилка (60 капсули)",
                value: 67,
                description: "24000% РДА B12 + 700% РДА D3 = Експлозивна енергия.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 30-дневен протокол",
                value: 197,
                description: "Сън. Храна. Добавки. Всичко за максимална енергия.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Питай за умора. Питай за сън. Винаги на линия.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Мъже които се събудиха. Споделят как.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: 7-дневен план за бърз старт",
                value: 49,
                description: "Почувствай разликата в първата седмица.",
                icon: "🚀",
                isBonus: true
              }
            ]}
            totalValue={342}
            discountedPrice={97}
            savings={245}
            spotsLeft={12}
            tier="regular"
          />
        </div>
      </section>

      {/* Success Stories - ENERGY FOCUS */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Мъже Които Се Събудиха
            </h2>
            <p className="text-lg text-muted-foreground">
              От 3 кафета дневно до тичане сутрин. От зомби до жив.
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>

      {/* Video Testimonials */}
      <VideoTestimonialGrid />

      {/* How It Works */}
      <HowItWorks />

      {/* Science Section */}
      <ScienceSection />

      {/* Ingredient Transparency */}
      <IngredientTable />

      {/* Detailed Testimonials */}
      <DetailedTestimonialCards />

      {/* Supplement Facts */}
      <SupplementFacts />

      {/* FAQ */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Често Задавани Въпроси
            </h2>
            <p className="text-lg text-muted-foreground">
              Отговори на всички твои въпроси
            </p>
          </div>
          <FAQSection tier="regular" />
        </div>
      </section>

      {/* Guarantee */}
      <GuaranteeSection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Exit Intent */}
      <ExitIntentPopup />
    </div>
  );
}
