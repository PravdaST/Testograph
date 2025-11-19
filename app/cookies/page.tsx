import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика за бисквитки | TestoGraph",
  description: "Информация за използването на бисквитки на testograph.eu",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">
          Политика за бисквитки (Cookies)
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 sm:space-y-6 text-muted-foreground">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Последна актуализация: {new Date().toLocaleDateString("bg-BG")}
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              1. Какво са бисквитките (Cookies)?
            </h2>
            <p>
              Бисквитките са малки текстови файлове, които се съхраняват на
              Вашето устройство (компютър, таблет, телефон) когато посещавате
              уебсайт. Те помагат на уебсайта да запомни информация за Вашето
              посещение, като например Вашите предпочитания и действия.
            </p>
            <p>
              TestoGraph използва бисквитки, за да осигури по-добро
              потребителско изживяване и да анализира как посетителите използват
              нашия сайт.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              2. Какви видове бисквитки използваме
            </h2>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                2.1. Абсолютно необходими бисквитки
              </h3>
              <p className="mb-3">
                Тези бисквитки са задължителни за функционирането на сайта. Без
                тях сайтът няма да работи правилно.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <strong>cookie-consent</strong> - Съхранява Вашето решение
                  относно приемането на бисквитки
                  <br />
                  <span className="text-sm">Срок на валидност: 365 дни</span>
                </li>
                <li>
                  <strong>session-id</strong> - Поддържа Вашата сесия на сайта
                  <br />
                  <span className="text-sm">
                    Срок на валидност: До затваряне на браузъра
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                2.2. Функционални бисквитки
              </h3>
              <p className="mb-3">
                Тези бисквитки позволяват на сайта да запомни Вашите избори
                (като например език, тема, запазени данни от форми).
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <strong>theme-preference</strong> - Запомня предпочитана тема
                  (светла/тъмна)
                  <br />
                  <span className="text-sm">Срок на валидност: 365 дни</span>
                </li>
                <li>
                  <strong>scarcity-counter</strong> - Локално съхранение на
                  брояча за свободни анализи
                  <br />
                  <span className="text-sm">Срок на валидност: 24 часа</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                2.3. Аналитични бисквитки
              </h3>
              <p className="mb-3">
                Тези бисквитки ни помагат да разберем как посетителите използват
                нашия сайт, за да можем да го подобрим.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Google Analytics (_ga, _gid, _gat)</strong> - Анализ
                  на трафика и поведението
                  <br />
                  <span className="text-sm">Доставчик: Google LLC</span>
                  <br />
                  <span className="text-sm">
                    Срок на валидност: _ga (2 години), _gid (24 часа)
                  </span>
                  <br />
                  <span className="text-sm">
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline touch-manipulation"
                    >
                      Privacy Policy на Google
                    </a>
                  </span>
                </li>
                <li>
                  <strong>Vercel Analytics</strong> - Анализ на
                  производителността на сайта
                  <br />
                  <span className="text-sm">Доставчик: Vercel Inc.</span>
                  <br />
                  <span className="text-sm">Срок на валидност: Сесия</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                2.4. Маркетингови бисквитки
              </h3>
              <p className="mb-3">
                Тези бисквитки се използват за показване на персонализирани
                реклами и за проследяване на ефективността на рекламните
                кампании.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Facebook Pixel (_fbp, _fbc)</strong> - Проследяване на
                  конверсии от Facebook реклами
                  <br />
                  <span className="text-sm">
                    Доставчик: Meta Platforms Inc.
                  </span>
                  <br />
                  <span className="text-sm">Срок на валидност: 90 дни</span>
                  <br />
                  <span className="text-sm">
                    <a
                      href="https://www.facebook.com/privacy/policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline touch-manipulation"
                    >
                      Privacy Policy на Meta
                    </a>
                  </span>
                </li>
                <li>
                  <strong>Google Ads (_gcl_*)</strong> - Проследяване на
                  конверсии от Google реклами
                  <br />
                  <span className="text-sm">Доставчик: Google LLC</span>
                  <br />
                  <span className="text-sm">Срок на валидност: 90 дни</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              3. Защо използваме бисквитки
            </h2>
            <p>Ние използваме бисквитки за следните цели:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li>
                <strong>Осигуряване на функционалност</strong> - За да работи
                сайтът правилно
              </li>
              <li>
                <strong>Подобряване на изживяването</strong> - За да запомним
                Вашите предпочитания
              </li>
              <li>
                <strong>Анализ и статистика</strong> - За да разберем как се
                използва сайтът
              </li>
              <li>
                <strong>Персонализация</strong> - За да показваме релевантно
                съдържание
              </li>
              <li>
                <strong>Маркетинг</strong> - За да измерваме ефективността на
                рекламите
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              4. Третостранни бисквитки
            </h2>
            <p>
              Някои бисквитки се поставят от трети страни, когато използвате
              нашия уебсайт. Тези доставчици имат свои собствени политики за
              поверителност:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Google Analytics
                </h4>
                <p className="text-sm mb-2">Анализ на уеб трафика</p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Facebook / Meta
                </h4>
                <p className="text-sm mb-2">Маркетинг и реклами</p>
                <a
                  href="https://www.facebook.com/privacy/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Shopify</h4>
                <p className="text-sm mb-2">E-commerce платформа</p>
                <a
                  href="https://www.shopify.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Vercel</h4>
                <p className="text-sm mb-2">Хостинг и аналитика</p>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              5. Как да управлявате бисквитките
            </h2>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">
              5.1. Настройки на браузъра
            </h3>
            <p>
              Можете да контролирате и/или изтривате бисквитки, както желаете.
              Можете да изтриете всички бисквитки, които вече са на Вашия
              компютър, и можете да настроите повечето браузъри да им попречат
              да бъдат поставяни.
            </p>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <h4 className="font-semibold text-foreground mb-3">
                Инструкции за популярни браузъри:
              </h4>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Google Chrome:</strong>{" "}
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline touch-manipulation"
                  >
                    Управление на бисквитките в Chrome
                  </a>
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong>{" "}
                  <a
                    href="https://support.mozilla.org/bg/kb/Enhanced%20Tracking%20Protection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline touch-manipulation"
                  >
                    Управление на бисквитките във Firefox
                  </a>
                </li>
                <li>
                  <strong>Safari:</strong>{" "}
                  <a
                    href="https://support.apple.com/bg-bg/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline touch-manipulation"
                  >
                    Управление на бисквитките в Safari
                  </a>
                </li>
                <li>
                  <strong>Microsoft Edge:</strong>{" "}
                  <a
                    href="https://support.microsoft.com/bg-bg/microsoft-edge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline touch-manipulation"
                  >
                    Управление на бисквитките в Edge
                  </a>
                </li>
              </ul>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">
              5.2. Банер за съгласие
            </h3>
            <p>
              При първото Ви посещение на сайта ще видите банер за бисквитки,
              където можете да изберете кои типове бисквитки да приемете. Винаги
              можете да промените предпочитанията си, като кликнете върху линка
              в долния колонтитул.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">
              5.3. Opt-out инструменти
            </h3>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li>
                <strong>Google Analytics Opt-out:</strong>{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline touch-manipulation"
                >
                  Browser Add-on
                </a>
              </li>
              <li>
                <strong>Your Online Choices (EU):</strong>{" "}
                <a
                  href="https://www.youronlinechoices.com/bg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline touch-manipulation"
                >
                  www.youronlinechoices.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              6. Последици от отказ
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-500 rounded-lg p-4 sm:p-6">
              <p className="font-semibold text-foreground mb-2">
                ⚠️ Важно да знаете:
              </p>
              <p>
                Ако изключите всички бисквитки, някои функционалности на сайта
                може да не работят правилно:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base mt-3">
                <li>Няма да можете да запазите предпочитания (тема, език)</li>
                <li>Формите може да не работят коректно</li>
                <li>Ще виждате банера за съгласие при всяко посещение</li>
                <li>Рекламите няма да бъдат персонализирани</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              7. Актуализации на политиката
            </h2>
            <p>
              Тази Политика за бисквитки може да бъде актуализирана периодично,
              за да отразява промени в технологиите или законодателството. Ще
              публикуваме всяка нова версия на тази страница.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">
              8. Контакт
            </h2>
            <p>За въпроси относно използването на бисквитки:</p>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
              <p className="font-semibold text-foreground">TestoGraph</p>
              <p>
                Електронна поща:{" "}
                <a
                  href="mailto:support@testograph.eu"
                  className="text-primary hover:underline touch-manipulation"
                >
                  support@testograph.eu
                </a>
              </p>
              <p>
                Уебсайт:{" "}
                <a
                  href="https://testograph.eu"
                  className="text-primary hover:underline touch-manipulation"
                >
                  testograph.eu
                </a>
              </p>
              <p className="mt-3">
                За повече информация вижте нашата{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline touch-manipulation"
                >
                  Политика за поверителност
                </a>
              </p>
            </div>
          </section>

          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              Тази политика е в сила от {new Date().toLocaleDateString("bg-BG")}{" "}
              г.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
