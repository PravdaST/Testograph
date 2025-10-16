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

export default function StarterLibidoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://testograph.eu/products/starter" />

      {/* Hero Section - ЛИБИДО ANGLE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Либидото ти не е загубено.<br />
            <span className="text-primary">Просто заспало.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Гледаш я. Нищо. Като да гледаш добър филм без емоции. Може би си остарял? Може би тя не е същата?
            <strong className="text-foreground"> Не. Хормоните ти са на дъното.</strong>
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            3,247+ мъже върнаха желанието си за 30 дни с TestoUP. Без химия. Без рецепта. Само природни съставки.
          </p>
        </div>
      </section>

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation - ЛИБИДО FOCUS */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Познаваш ли това чувство?
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Преди 2-3 години беше различно. Виждаше я и... искаше. Сега? Сега тя излиза от банята,
              красива, и ти... <strong>нищо</strong>. Като че ли си изключен.
            </p>
            <p>
              Опитваш се. Но тялото не реагира както преди. Тя започва да пита "всичко ли е наред?".
              Казваш "уморен съм". Но вътре знаеш - <strong>това не е умора</strong>.
            </p>
            <p className="text-xl font-bold text-foreground">
              Проблемът не е в нея. Не е в теб. Проблемът е в хормоните ти.
            </p>
            <p>
              Тестостеронът ти е спаднал. Може би от стрес. Може би от възраст. Може би от лош сън.
              Резултатът? <strong>Загубено либидо. Загубена увереност. Загубена близост.</strong>
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
                description: "Най-силната естествена добавка на пазара. 30-дневен запас за видими резултати.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 30-дневен протокол",
                value: 197,
                description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Винаги до теб. Питай каквото искаш. Никога не си сам.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Свържи се с хиляди мъже на същия път. Споделяй. Учи. Расти.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: 7-дневен план за бърз старт",
                value: 49,
                description: "Започни веднага с готов 7-дневен план. Никакво чакане.",
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

      {/* Success Stories - ЛИБИДО FOCUS */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Мъже Които Върнаха Либидото Си
            </h2>
            <p className="text-lg text-muted-foreground">
              Точно като теб. Загубили желание. Върнали го за седмици.
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
