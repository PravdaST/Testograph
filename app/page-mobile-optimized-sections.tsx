// Mobile-optimized sections for home page
// Copy these to replace existing sections in page.tsx

// ============================================
// SECTION 5: HOW IT WORKS (Mobile Optimized)
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      icon: <ShoppingCart className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "1. Поръчай добавката",
      description: "С поръчката си получаваш незабавен достъп до приложението Testograph."
    },
    {
      icon: <Smartphone className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "2. Следвай твоя план",
      description: "Вътре те очаква персонализиран план за тренировки, хранене, сън и прием на добавката."
    },
    {
      icon: <TrendingUp className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "3. Постигни резултати",
      description: "Седмица 1: Повишено либидо и по-добри ерекции.\nМесец 1: Повече енергия и по-бързо възстановяване.\nМесец 2: Цялостна трансформация."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-10 sm:mb-12 md:mb-16">
          Как Работи TestoUP Програмата за Оптимизиране на Тестостерона?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#e6e6e6] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg text-center relative flex flex-col items-center border border-gray-100">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ChevronRight className="w-8 h-8 text-[#499167]" />
                </div>
              )}
              <div className="mb-3 sm:mb-4">{step.icon}</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">{step.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <a
            href="#clinical-proof"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-white hover:bg-[#e6e6e6] text-gray-900 font-bold text-base sm:text-lg rounded-full border-2 border-gray-300 transition-all duration-300 hover:scale-105 touch-manipulation"
          >
            Виж съставките
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6: CLINICAL PROOF (Mobile Optimized)
// ============================================
function ClinicalProofSection() {
  return (
    <section id="clinical-proof" className="py-12 sm:py-16 md:py-20 bg-[#e6e6e6]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
            Клинично Доказана Формула за Естествено Повишаване на Тестостерона
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Нашата формула съдържа 12 активни съставки, подкрепени от над 50 публикувани клинични проучвания.
          </p>
        </div>

        {/* Show 4 featured researchers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <ResearcherCard
            ingredient="Vitamin D3 (2400 IU)"
            researcher="Д-р Майкъл Холик"
            institution="Бостънски университет"
            quote="Дефицитът на витамин D е пряко свързан с ниските нива на тестостерон. Суплементирането с витамин D доказано ги повишава."
          />
          <ResearcherCard
            ingredient="Zinc (50mg)"
            researcher="Д-р Ананда Прасад"
            institution="Щатски университет 'Уейн'"
            quote="Дефицитът на цинк директно намалява производството на тестостерон. Приемът му като добавка нормализира нивата в рамките на 3 до 6 месеца."
          />
          <ResearcherCard
            ingredient="Ashwagandha (400mg)"
            researcher="Д-р Биджасвит Оди"
            institution="Институт за клинични изследвания, Индия"
            quote="Доказано повишава тестостерона с до 15% и намалява кортизола (хормона на стреса) с до 40% при възрастни, подложени на стрес."
          />
          <ResearcherCard
            ingredient="Magnesium (400mg)"
            researcher="Д-р Джовани Чеда"
            institution="Университет на Парма"
            quote="Магнезият повишава както свободния, така и общия тестостерон, особено когато се комбинира с редовна физическа активност."
          />
        </div>

        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">+ още 8 клинично тествани съставки</p>
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl touch-manipulation"
          >
            Виж пълния състав
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ResearcherCard({ ingredient, researcher, institution, quote }: { ingredient: string; researcher: string; institution: string; quote: string }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
      <div className="mb-3 sm:mb-4">
        <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{ingredient}</h4>
        <p className="text-xs sm:text-sm font-semibold text-[#3a7450]">{researcher}</p>
        <p className="text-xs text-gray-600">{institution}</p>
      </div>
      <blockquote className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
        "{quote}"
      </blockquote>
    </div>
  );
}

// ============================================
// SECTION 7: PRODUCT PACKAGES (Mobile Optimized)
// ============================================
function ProductPackagesSection() {
  const packages = [
    {
      bottles: 1,
      duration: "1-месечен план",
      price: "67.00",
      priceEur: "34.26",
      totalPrice: "67.00",
      savings: null,
      popular: false,
      image: "/product/testoup-bottle.webp"
    },
    {
      bottles: 2,
      duration: "2-месечен план",
      price: "57.00",
      priceEur: "29.13",
      totalPrice: "114.00",
      savings: "20 лв.",
      popular: true,
      image: "/product/testoup-bottle_v1.webp"
    },
    {
      bottles: 3,
      duration: "3-месечен план",
      price: "50.00",
      priceEur: "25.55",
      totalPrice: "150.00",
      savings: "51 лв.",
      popular: false,
      bestValue: true,
      image: "/product/testoup-bottle_v2.webp"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
            Избери TestoUP План за Повишаване на Тестостерона
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-3">
            Всеки план включва пълен достъп до приложението Testograph.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#499167] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base">
            <span>⚡</span>
            <span>Специална цена - валидна до изчерпване на stock-а</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-10 md:mb-12">
          {packages.map((pkg, idx) => (
            <PackageCard key={idx} {...pkg} />
          ))}
        </div>

        <div className="text-center space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167]" /> Безплатна доставка над 50 лв.</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167]" /> Сигурно плащане</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167]" /> Дискретна опаковка</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167]" /> 30-дневна гаранция за връщане на парите</p>
        </div>
      </div>
    </section>
  );
}

interface PackageCardProps {
  bottles: number;
  duration: string;
  price: string;
  priceEur: string;
  totalPrice: string;
  savings: string | null;
  popular?: boolean;
  bestValue?: boolean;
  image: string;
}

function PackageCard({ bottles, duration, price, priceEur, totalPrice, savings, popular, bestValue, image }: PackageCardProps) {
  return (
    <div className={`relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all ${popular || bestValue ? 'border-4 border-[#499167] md:transform md:scale-105' : 'border-2 border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-[#499167] text-white px-4 sm:px-6 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
          НАЙ-ПОПУЛЯРЕН
        </div>
      )}
      {bestValue && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 sm:px-6 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
          НАЙ-ИЗГОДЕН
        </div>
      )}

      <div className="text-center mb-4 sm:mb-6">
        <img
          src={image}
          alt={`TestoUP тестостеронов бустер - ${bottles} опаковки за ${duration.toLowerCase()}`}
          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain mb-3 sm:mb-4"
          loading="lazy"
        />
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">{duration}</h3>
        <div className="mb-3 sm:mb-4">
          <p className="text-3xl sm:text-4xl font-black text-[#499167]">{price} лв./месец</p>
          <p className="text-xs sm:text-sm text-gray-500">({priceEur} €)</p>
          {totalPrice !== price && (
            <p className="text-base sm:text-lg text-gray-700 mt-1 sm:mt-2">(общо {totalPrice} лв.)</p>
          )}
        </div>
        {savings && (
          <p className="text-[#499167] font-bold text-xs sm:text-sm mb-2">
            Спестяваш {savings}
          </p>
        )}
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#499167] flex-shrink-0" />
          <span>{bottles} {bottles === 1 ? 'опаковка' : 'опаковки'} ({bottles * 30} дни)</span>
        </li>
        <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#499167] flex-shrink-0" />
          <span>Безплатен достъп до приложението</span>
        </li>
        <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#499167] flex-shrink-0" />
          <span>30-дневна гаранция за връщане на парите</span>
        </li>
      </ul>

      <a
        href="https://shop.testograph.eu/products/testoup"
        className={`block w-full text-center py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 touch-manipulation ${
          popular || bestValue
            ? 'bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white shadow-xl'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300'
        }`}
      >
        Избери план →
      </a>
    </div>
  );
}
