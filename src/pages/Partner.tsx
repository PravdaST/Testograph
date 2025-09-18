import { GlassCard } from "@/components/ui/glass-card";

const Partner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background/80">
      {/* Header */}
      <header className="text-center py-16 px-8">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center text-6xl font-bold text-background shadow-2xl shadow-primary/30 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-3xl blur-xl opacity-50 -z-10"></div>
          <img 
            src="/lovable-uploads/7f610a27-06bc-4bf8-9951-7f52e40688ba.png" 
            alt="Testograph Logo" 
            className="w-20 h-20 rounded-2xl"
          />
        </div>
        <h1 className="text-5xl lg:text-6xl font-clash font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-6">
          TestoGraph Партньорство
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground font-light">
          Как да печелиш като собственик, не като служител
        </p>
      </header>

      <div className="container mx-auto px-6 pb-16 space-y-12">
        {/* Introduction */}
        <GlassCard className="p-8">
          <p className="text-lg leading-relaxed mb-6">
            Всеки ден виждам fitness инфлуенсъри които правят страхотно съдържание, имат хиляди последователи, coaching клиенти, брандирани постове... но все още се борят да управляват всичко и да растат.
          </p>
          <p className="text-xl font-semibold text-primary">
            Знаеш ли защо? Защото работят В бизнеса, вместо НА бизнеса.
          </p>
        </GlassCard>

        {/* Situation Section */}
        <GlassCard variant="elevated" className="p-8">
          <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-4">
            СИТУАЦИЯТА Е ПРОСТА
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">1,000-2,000 лв</div>
              <div className="text-muted-foreground">Брандирани постове</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">1,500-3,000 лв</div>
              <div className="text-muted-foreground">Online coaching клиенти</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">3,000-6,000 лв</div>
              <div className="text-muted-foreground">Общо месечно</div>
            </div>
          </div>

          <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg mb-8">
            <p className="mb-4"><strong className="text-primary">Проблемът:</strong> Трябва да управляваш всичко сам - клиенти, постове, програми, customer service, billing</p>
            <p className="mb-4"><strong className="text-primary">Алтернативата:</strong> Да имаш система която работи сама</p>
            <p><strong className="text-primary">Резултатът:</strong> 10,000-20,000 лв месечно пасивно</p>
          </div>

          <p className="text-xl text-center text-primary font-semibold">
            Въпросът е: Как да стигнеш от "управлявам всичко сам" до "системата работи за мен"?
          </p>
        </GlassCard>

        {/* Solution Section */}
        <GlassCard variant="elevated" className="p-8">
          <h2 className="text-3xl font-bold text-primary mb-6">РЕШЕНИЕТО (МНОГО ПРОСТО)</h2>
          <p className="text-xl mb-8">Ние ти даваме готова маркетингова система. Ти я използваш.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">Твоята работа:</h3>
              <p className="text-muted-foreground">Създаваш съдържание за TestoGraph като платформа за мъжко здраве + одобряваш готовите програми</p>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-primary mb-4">Нашата работа:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Даваме ти готови креативи, скриптове, стратегии
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Помагаме ти със всеки пост и видео
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Събираме данните от твоята аудитория
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Създаваме твоите fitness програми (тренировки, хранене, планове)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Пакетираме всичко професионално
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Пускаме собствени реклами за да генерираме още клиенти
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Продаваме твоите програми към всички - твоята аудитория + нашата
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Ремаркетираме към тях с твоите оферти
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Управляваме цялата техническа страна
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Customer service, billing, fulfillment - всичко
                </li>
              </ul>
            </div>
          </div>

          <p className="text-lg text-center mt-8 text-amber-500">
            Но има едно условие... Трябва първо да докажеш че можеш да продаваш. Как?
          </p>
        </GlassCard>

        {/* Phase 1 */}
        <GlassCard variant="elevated" className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="inline-block bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            ФАЗА 1
          </div>
          <h2 className="text-3xl font-bold text-primary mb-6">ТЕСТОВАТА ФАЗА</h2>
          
          <ol className="space-y-4 mb-8">
            <li className="flex gap-4">
              <span className="font-bold text-primary">1.</span>
              <span>Започваш маркетингова кампания за TestoGraph.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">2.</span>
              <span>Създаваш съдържание за мъжко здраве и тестове.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">3.</span>
              <span>Аудиторията ти използва платформата.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">4.</span>
              <span>Ние пускаме собствени реклами и генерираме още клиенти.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">5.</span>
              <span>Ние създаваме персонализирани fitness програми на твоето име.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">6.</span>
              <span>Продаваме програмите към всички - твоята аудитория + нашата.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">7.</span>
              <span>Ти ги одобряваш и получаваш 50% от всички продажби.</span>
            </li>
          </ol>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">5,000 лв</div>
              <div className="text-muted-foreground">Целта: месечни продажби</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">2,500 лв</div>
              <div className="text-muted-foreground">Твоята печалба месечно</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl text-center border border-primary/20">
              <div className="text-2xl font-bold text-primary mb-2">1-2 месеца</div>
              <div className="text-muted-foreground">Времето</div>
            </div>
          </div>

          <p className="text-center text-lg mb-4">
            <strong>Твоята работа:</strong> Одобряваш програмите + промотираш
          </p>
          <p className="text-center text-xl text-primary font-semibold">
            Ако достигнеш 5К продажби = доказа че можеш да продаваш.
          </p>
        </GlassCard>

        {/* Phase 2 */}
        <GlassCard variant="elevated" className="p-8 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            ФАЗА 2
          </div>
          <h2 className="text-3xl font-bold text-amber-500 mb-6">SUPPLEMENT ФАЗАТА</h2>
          
          <p className="text-lg mb-6">
            Ако достигнеш 5,000 лв продажби в първите 1-2 месеца, отключваш supplement програмата.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-amber-500 mb-4">Как работи:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">✓</span>
                  Ние създаваме твоя собствена supplement линия
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">✓</span>
                  Използваме твоите данни от TestoGraph за персонализация
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">✓</span>
                  Пускаме реклами към цялата база от клиенти
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">✓</span>
                  Продаваме в цяла Европа, не само България
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-500 mb-4">Резултат:</h3>
              <div className="bg-amber-500/10 p-6 rounded-xl border border-amber-500/20">
                <div className="text-3xl font-bold text-amber-500 mb-2">10,000-20,000 лв</div>
                <div className="text-muted-foreground">месечно пасивно</div>
              </div>
            </div>
          </div>

          <p className="text-center text-xl text-amber-500 font-semibold">
            Това е бизнес на автопилот. Ти одобряваш, ние правим всичко останало.
          </p>
        </GlassCard>

        {/* Why It Works */}
        <GlassCard variant="elevated" className="p-8">
          <h2 className="text-3xl font-bold text-primary mb-6">ЗАЩО ТОВА РАБОТИ?</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">За теб:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Няма риск - ние инвестираме в рекламите
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Няма overhead - ние управляваме всичко
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Пасивна печалба - системата работи сама
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Scaling - продаваме не само към твоята аудитория
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">За нас:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Получаваме качествено съдържание за TestoGraph
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Разширяваме нашата база с клиенти
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Създаваме още продукти за продажба
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  Win-win ситуация за всички
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Real Example */}
        <GlassCard variant="elevated" className="p-8 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <h2 className="text-3xl font-bold text-green-500 mb-6">РЕАЛЕН ПРИМЕР</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Марин (fitness инфлуенсър с 50K последователи):</h3>
          </div>

          <div className="timeline space-y-6">
            <div className="flex gap-4">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold">Месец 1: Започна кампанията</h4>
                <p className="text-muted-foreground">3,200 лв продажби, 1,600 лв печалба</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold">Месец 2: Достигна 5К</h4>
                <p className="text-muted-foreground">5,800 лв продажби, 2,900 лв печалба</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold">Месец 3: Отключи supplements</h4>
                <p className="text-muted-foreground">12,400 лв продажби, 6,200 лв печалба</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">6</div>
              <div>
                <h4 className="font-semibold">Месец 6: Стабилна система</h4>
                <p className="text-muted-foreground">18,900 лв продажби, 9,450 лв печалба</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-green-500/10 p-6 rounded-xl border border-green-500/20">
            <p className="text-center text-lg">
              <strong>Времето което Марин прекарва:</strong> 2-3 часа седмично за одобрение на съдържание
            </p>
            <p className="text-center text-xl font-semibold text-green-500 mt-2">
              Резултат: 9,450 лв месечно пасивно
            </p>
          </div>
        </GlassCard>

        {/* Qualification Criteria */}
        <GlassCard variant="elevated" className="p-8">
          <h2 className="text-3xl font-bold text-primary mb-6">КОЙ МОЖЕ ДА КАНДИДАТСТВА?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-500 mb-4">Задължително имаш:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  Минимум 15,000 активни последователи
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  Fitness съдържание (не само lifestyle)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  Мъжка аудитория (поне 60%)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  Възраст 25-45 години на аудиторията
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  Имаш опит с продажби (coaching, курсове, etc.)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-500 mb-4">Бонус точки ако имаш:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">+</span>
                  Над 50,000 последователи
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">+</span>
                  Собствени fitness програми
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">+</span>
                  Email лист с клиенти
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">+</span>
                  Опит с supplement продажби
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">+</span>
                  Международна аудитория
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Limited Spots Warning */}
        <GlassCard className="p-8 bg-gradient-to-br from-amber-500/10 to-red-500/10 border-amber-500/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-amber-500 mb-4">ВНИМАНИЕ: ОГРАНИЧЕНИ МЕСТА</h2>
            <p className="text-xl mb-6">
              Приемаме максимум <strong className="text-amber-500">8 партньора</strong> за 2025 година.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-amber-500 mb-3">Защо само 8?</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 font-bold">•</span>
                    Искаме да дадем максимално внимание на всеки
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 font-bold">•</span>
                    Качество &gt; количество
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 font-bold">•</span>
                    Ограничени ресурси за създаване на продукти
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-500 mb-3">Какво означава това:</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    Първи дошъл, първи обслужен
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    Следващата възможност = 2026
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    Високи критерии за селекция
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Call to Action */}
        <GlassCard variant="elevated" className="p-12 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent opacity-50 animate-pulse"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-primary mb-6">ГОТОВ СИ ДА ЗАПОЧНЕШ?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Изпрати ни email с информация за твоята аудитория и опит
            </p>
            
            <div className="bg-background/50 backdrop-blur-lg border border-primary/40 rounded-2xl p-8 max-w-md mx-auto">
              <div className="space-y-4">
                <p className="text-lg">
                  <strong className="text-primary">Email:</strong> partnership@testograph.eu
                </p>
                <p className="text-lg">
                  <strong className="text-primary">Тема:</strong> Partnership Application
                </p>
                <p className="text-base text-muted-foreground">
                  Включи линкове към профилите ти и кратко описание на аудиторията
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Final Thoughts */}
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">ПОСЛЕДНИ МИСЛИ</h2>
          <p className="text-lg leading-relaxed mb-6">
            Това не е "бърза схема за обогатяване". Това е сериозно бизнес партньорство за хора които искат да израстат от "fitness инфлуенсър" до "fitness предприемач".
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Ако си готов да работиш с най-добрата система в България за мъжко здраве и fitness, и искаш да печелиш като собственик...
          </p>
          <a 
            href="mailto:partnership@testograph.eu?subject=Заявка за TestoGraph партньорство"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Изпрати ни имейл
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            Нека видим дали си подходящ.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Partner;