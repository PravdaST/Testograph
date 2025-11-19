import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика за поверителност | TestoGraph",
  description: "Политика за поверителност и защита на личните данни на TestoGraph",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">
          Политика за поверителност
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 sm:space-y-6 text-muted-foreground">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">1. Въведение</h2>
            <p>
              Добре дошли в TestoGraph ("ние", "нас", "наш"). Ние се ангажираме да защитаваме
              Вашата поверителност и личните Ви данни. Тази Политика за поверителност обяснява
              как събираме, използваме, разкриваме и защитаваме Вашата информация, когато
              посещавате нашия уебсайт testograph.eu и използвате нашите услуги.
            </p>
            <p>
              Тази политика е в съответствие с Общия регламент за защита на данните (GDPR)
              и Закона за защита на личните данни (ЗОЗЛ) на Република България.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">2. Какви данни събираме</h2>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">2.1. Лични данни</h3>
            <p className="text-sm sm:text-base">Когато използвате нашия безплатен анализ или поръчвате продукти, ние можем да събираме:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Име и фамилия</strong> - за персонализация на комуникацията</li>
              <li><strong>Електронна поща</strong> - за изпращане на Вашия доклад и последваща комуникация</li>
              <li><strong>Телефонен номер</strong> - за доставка на продукти (по избор)</li>
              <li><strong>Възраст, тегло, височина</strong> - за изчисляване на персонализиран анализ</li>
              <li><strong>Здравна информация</strong> - симптоми свързани с тестостеронови нива (либидо, енергия, настроение)</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">2.2. Автоматично събрани данни</h3>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>IP адрес</strong> - за защита срещу злоупотреба</li>
              <li><strong>Тип на браузъра и устройството</strong> - за оптимизация на сайта</li>
              <li><strong>Поведение на сайта</strong> - страници които посещавате, време на сайта</li>
              <li><strong>Cookies и tracking technologies</strong> - вижте нашата <a href="/cookies" className="text-primary hover:underline touch-manipulation">Политика за бисквитки</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">3. Как използваме Вашите данни</h2>
            <p className="text-sm sm:text-base">Ние използваме събраните данни за следните цели:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Предоставяне на услуги</strong> - генериране на персонализиран тестостеронов анализ</li>
              <li><strong>Обработка на поръчки</strong> - доставка на продукти през Shopify</li>
              <li><strong>Комуникация</strong> - изпращане на доклади, оферти, актуализации (с Ваше съгласие)</li>
              <li><strong>Подобрение на услугите</strong> - анализ на поведението за оптимизация</li>
              <li><strong>Маркетинг</strong> - персонализирани оферти (с Ваше съгласие)</li>
              <li><strong>Законови задължения</strong> - спазване на българското и европейско законодателство</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">4. Правно основание за обработка (GDPR)</h2>
            <p className="text-sm sm:text-base">Обработваме Вашите лични данни на следните правни основания:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Съгласие</strong> - когато попълвате формата за анализ</li>
              <li><strong>Договорни задължения</strong> - за обработка на поръчки</li>
              <li><strong>Легитимен интерес</strong> - за подобрение на услугите и защита срещу измама</li>
              <li><strong>Законови задължения</strong> - пазене на данни за счетоводни цели</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">5. Споделяне на данни с трети страни</h2>
            <p className="text-sm sm:text-base">Ние споделяме Вашите данни само с доверени партньори:</p>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">5.1. Използвани услуги</h3>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Shopify</strong> - обработка на поръчки и плащания</li>
              <li><strong>n8n (Automation)</strong> - обработка на форми и автоматизация</li>
              <li><strong>Vercel</strong> - хостинг на уебсайта</li>
              <li><strong>Google Analytics</strong> - анализ на трафика (ако е активиран)</li>
              <li><strong>Facebook Pixel / Meta</strong> - маркетинг анализ (ако е активиран)</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3">5.2. Трансфер на данни извън ЕС</h3>
            <p className="text-sm sm:text-base">
              Някои от нашите доставчици (Shopify, Vercel) могат да обработват данни извън Европейското
              икономическо пространство (ЕИП). Уверяваме Ви, че всички тези доставчици са сертифицирани
              по EU-US Data Privacy Framework или имат Standard Contractual Clauses (SCC) в съответствие с GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">6. Съхранение на данните</h2>
            <p className="text-sm sm:text-base">Ние съхраняваме Вашите лични данни само толкова дълго, колкото е необходимо:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Данни от формата</strong> - 24 месеца от последната активност</li>
              <li><strong>Данни за поръчки</strong> - 5 години (счетоводни изисквания)</li>
              <li><strong>Маркетингови данни</strong> - до оттегляне на съгласието</li>
              <li><strong>Cookies</strong> - виж <a href="/cookies" className="text-primary hover:underline touch-manipulation">Политика за бисквитки</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">7. Вашите права (GDPR)</h2>
            <p className="text-sm sm:text-base">Съгласно GDPR, Вие имате следните права:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li><strong>Право на достъп</strong> - да поискате копие на Вашите данни</li>
              <li><strong>Право на коригиране</strong> - да коригирате неточни данни</li>
              <li><strong>Право на изтриване ("Right to be forgotten")</strong> - да поискате изтриване на данните</li>
              <li><strong>Право на ограничаване</strong> - да ограничите обработката на данните</li>
              <li><strong>Право на преносимост</strong> - да получите данните в структуриран формат</li>
              <li><strong>Право на възражение</strong> - да възразите срещу обработка за маркетинг</li>
              <li><strong>Право да оттеглите съгласието</strong> - по всяко време</li>
            </ul>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base">
              За упражняване на Вашите права, моля свържете се с нас на: <strong>support@testograph.eu</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">8. Сигурност на данните</h2>
            <p className="text-sm sm:text-base">Ние прилагаме технически и организационни мерки за защита на Вашите данни:</p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li>SSL криптиране на всички комуникации</li>
              <li>Сигурно съхранение на данни в сертифицирани дата центрове</li>
              <li>Ограничен достъп до лични данни само за оторизиран персонал</li>
              <li>Редовни одити за сигурност</li>
              <li>Криптиране на чувствителни данни</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">9. Деца</h2>
            <p className="text-sm sm:text-base">
              Нашите услуги са предназначени за лица над 18 години. Ние съзнателно не събираме
              лични данни от лица под 18 години. Ако сте родител или настойник и смятате,
              че Вашето дете ни е предоставило лични данни, моля свържете се с нас.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">10. Промени в политиката</h2>
            <p className="text-sm sm:text-base">
              Ние можем да актуализираме тази Политика за поверителност периодично. Ще Ви
              уведомим за съществени промени чрез имейл или чрез известие на нашия уебсайт.
              Препоръчваме да преглеждате тази страница редовно.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">11. Контакт</h2>
            <p className="text-sm sm:text-base">За въпроси относно тази Политика за поверителност или Вашите лични данни:</p>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-3 sm:mt-4">
              <p className="font-semibold text-foreground text-sm sm:text-base">TestoGraph</p>
              <p className="text-sm sm:text-base">Електронна поща: <a href="mailto:support@testograph.eu" className="text-primary hover:underline touch-manipulation">support@testograph.eu</a></p>
              <p className="text-sm sm:text-base">Уебсайт: <a href="https://testograph.eu" className="text-primary hover:underline touch-manipulation">testograph.eu</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4">12. Надзорен орган</h2>
            <p className="text-sm sm:text-base">
              Ако смятате, че Вашите права по GDPR са нарушени, имате право да подадете жалба
              до Комисията за защита на личните данни (КЗЛД) на Република България:
            </p>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-3 sm:mt-4">
              <p className="font-semibold text-foreground text-sm sm:text-base">Комисия за защита на личните данни</p>
              <p className="text-sm sm:text-base">Адрес: гр. София 1592, бул. "Проф. Цветан Лазаров" № 2</p>
              <p className="text-sm sm:text-base">Телефон: +359 2 915 3 518</p>
              <p className="text-sm sm:text-base">Email: <a href="mailto:kzld@cpdp.bg" className="text-primary hover:underline touch-manipulation">kzld@cpdp.bg</a></p>
              <p className="text-sm sm:text-base">Уебсайт: <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline touch-manipulation">www.cpdp.bg</a></p>
            </div>
          </section>

          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Тази политика е в сила от {new Date().toLocaleDateString('bg-BG')} г.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
