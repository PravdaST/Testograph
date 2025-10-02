import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Общи условия | TestoGraph",
  description: "Общи условия за ползване на TestoGraph услуги и продукти",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Общи условия за ползване
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">
            Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Въведение и приемане на условията</h2>
            <p>
              Добре дошли в TestoGraph ("ние", "нас", "наш"). Чрез достъпа и използването на
              нашия уебсайт testograph.eu ("Сайтът") и свързаните с него услуги ("Услугите"),
              Вие се съгласявате да спазвате и да бъдете обвързани от настоящите Общи условия
              ("Условията").
            </p>
            <p>
              Моля, прочетете внимателно тези Условия преди да използвате Сайта. Ако не сте
              съгласни с тях, моля не използвайте нашите Услуги.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Дефиниции</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Потребител"</strong> - всяко лице, което използва Сайта</li>
              <li><strong>"Клиент"</strong> - лице, което е поръчало продукт или услуга</li>
              <li><strong>"Анализ"</strong> - безплатният тестостеронов анализ, предлаган на Сайта</li>
              <li><strong>"Продукти"</strong> - хранителни добавки и свързани продукти, предлагани за продажба</li>
              <li><strong>"Протокол"</strong> - персонализиран 30-дневен план за хранене, тренировки и добавки</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Описание на услугите</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1. Безплатен анализ</h3>
            <p>
              TestoGraph предлага безплатен персонализиран анализ на тестостеронови нива, базиран
              на предоставена от Вас информация. Анализът е с информативна цел и НЕ заменя
              професионална медицинска консултация.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2. Продукти</h3>
            <p>
              Предлагаме хранителни добавки и свързани продукти за подобряване на тестостеронови
              нива и мъжко здраве. Всички продукти са описани на Сайта с техните характеристики
              и цени.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.3. Персонализиран протокол</h3>
            <p>
              30-дневен интерактивен протокол, включващ план за хранене, тренировки, добавки
              и достъп до AI експерт за въпроси.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Право на използване</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.1. Разрешено използване</h3>
            <p>
              Ние Ви предоставяме ограничена, неизключителна, непрехвърляема лицензия за достъп
              и лично, некомерсиално използване на Сайта и Услугите.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4.2. Забранено използване</h3>
            <p>Вие се съгласявате ДА НЕ:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Използвате Сайта за незаконни цели</li>
              <li>Копирате, разпространявате или модифицирате съдържанието без разрешение</li>
              <li>Използвате автоматизирани системи (ботове, скрапери) без разрешение</li>
              <li>Нарушавате правата на други потребители или трети страни</li>
              <li>Качвате злонамерен софтуер или вируси</li>
              <li>Представяте се за друго лице или организация</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Поръчки и плащания</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.1. Процес на поръчка</h3>
            <p>
              Поръчките се извършват чрез нашия партньор Shopify. Кликвайки върху "Поръчай сега",
              Вие правите обвързваща оферта за покупка на продукта по обявената цена.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.2. Цени</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Всички цени са в български левове (BGN/лв)</li>
              <li>Цените включват ДДС</li>
              <li>Цените НЕ включват доставка (освен ако не е посочено друго)</li>
              <li>Запазваме си правото да променяме цените без предизвестие</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.3. Плащане</h3>
            <p>
              Приемаме плащания чрез Shopify Payments:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Кредитни/дебитни карти (Visa, Mastercard)</li>
              <li>Други методи, поддържани от Shopify</li>
            </ul>
            <p className="mt-3">
              Всички плащания се обработват сигурно чрез SSL криптиране.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.4. Потвърждение на поръчка</h3>
            <p>
              След успешна поръчка ще получите имейл с потвърждение на поръчката и детайли
              за доставка.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Доставка</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6.1. Територия на доставка</h3>
            <p>
              Доставяме само на територията на Република България.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6.2. Срокове за доставка</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Стандартна доставка: 2-5 работни дни</li>
              <li>Експресна доставка: 1-2 работни дни (при наличност)</li>
            </ul>
            <p className="mt-3">
              Сроковете са ориентировъчни и зависят от куриерската фирма.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">6.3. Разходи за доставка</h3>
            <p>
              Разходите за доставка се изчисляват при финализиране на поръчката и зависят
              от адреса и теглото на пратката.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Право на връщане и гаранция</h2>

            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">7.1. 30-дневна гаранция за връщане на пари</h3>
              <p>
                Ние гарантираме 100% удовлетвореност. Ако не сте доволни от нашите продукти,
                можете да поискате пълно възстановяване на средствата в рамките на 30 дни от датата на доставка.
              </p>

              <p className="mt-3 font-semibold">Условия:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Продуктът да е използван съгласно инструкциите</li>
                <li>Заявка за връщане да бъде направена до 30 дни от доставка</li>
                <li>Връщането не се прилага при многократни поръчки на същия продукт</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7.2. Процедура за връщане</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Свържете се с нас на support@testograph.eu</li>
              <li>Обяснете причината за връщането</li>
              <li>Получете инструкции за връщане (ако е приложимо)</li>
              <li>Възстановяването се извършва в рамките на 14 работни дни</li>
            </ol>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">7.3. Дефектни продукти</h3>
            <p>
              Ако получите дефектен или повреден продукт, моля уведомете ни незабавно.
              Ние ще заменим продукта или ще възстановим средствата изцяло за наша сметка.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Медицински отказ от отговорност</h2>

            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-lg p-6">
              <p className="font-semibold text-foreground mb-3">⚠️ ВАЖНО - Медицинска информация</p>

              <p>
                <strong>Информацията на този сайт е само с информативна цел и НЕ заменя
                професионална медицинска консултация, диагностика или лечение.</strong>
              </p>

              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Винаги консултирайте лекар преди започване на нова добавка или протокол</li>
                <li>Не спирайте предписани лекарства без консултация с лекар</li>
                <li>Индивидуалните резултати може да варират</li>
                <li>Тестостероновият анализ е базиран на въпросник и НЕ е медицински тест</li>
                <li>Продуктите са хранителни добавки, а НЕ лекарства</li>
              </ul>

              <p className="mt-3 font-semibold">
                Ако имате медицинско състояние или приемате лекарства, задължително
                консултирайте лекар преди употреба.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Интелектуална собственост</h2>

            <p>
              Цялото съдържание на Сайта - текст, графики, лога, икони, изображения, аудио/видео
              клипове, код - е собственост на TestoGraph или на наши лицензодатели и е защитено
              от български и международни закони за авторско право.
            </p>

            <p className="mt-3">
              Марката "TestoGraph", логото и други марки са собственост на TestoGraph.
              Забранено е използването им без писмено разрешение.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Ограничение на отговорността</h2>

            <p>
              В максималната степен, позволена от закона, TestoGraph и неговите служители,
              директори и партньори не носят отговорност за:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Косвени, случайни или последващи щети</li>
              <li>Загуба на печалба, приходи или данни</li>
              <li>Прекъсване на бизнеса</li>
              <li>Вреди от използване или невъзможност за използване на Услугите</li>
              <li>Грешки или неточности в съдържанието</li>
              <li>Неразрешен достъп до Вашите данни (освен при наша небрежност)</li>
            </ul>

            <p className="mt-3">
              Максималната ни отговорност не може да надвишава сумата, която сте платили
              за Продукта или Услугата през последните 12 месеца.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. Обезщетение</h2>

            <p>
              Вие се съгласявате да обезщетите и защитите TestoGraph от всички искове, загуби,
              отговорности, разходи и такси (включително адвокатски хонорари), произтичащи от:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Вашето нарушаване на тези Условия</li>
              <li>Вашето нарушаване на права на трети страни</li>
              <li>Вашето използване на Услугите</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">12. Промени в условията</h2>

            <p>
              Запазваме си правото да променяме тези Условия по всяко време. Промените влизат
              в сила веднага след публикуването им на Сайта. Продължавайки да използвате
              Услугите след промените, Вие приемате новите Условия.
            </p>

            <p className="mt-3">
              Ще се опитаме да Ви уведомим за съществени промени чрез имейл или известие на Сайта.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">13. Прекратяване</h2>

            <p>
              Запазваме си правото да прекратим или спрем Вашия достъп до Услугите по всяко
              време, без предизвестие, ако:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Нарушавате тези Условия</li>
              <li>Използвате Услугите по незаконен или вреден начин</li>
              <li>Има технически проблеми или прекратяване на услугата</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">14. Приложимо право и jurisdикция</h2>

            <p>
              Тези Условия се уреждат от законите на Република България.
            </p>

            <p className="mt-3">
              Всякакви спорове, произтичащи от или свързани с тези Условия или Услугите,
              ще бъдат разглеждани от компетентните съдилища в България.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">15. Разделителна клауза</h2>

            <p>
              Ако някоя разпоредба от тези Условия бъде признат за невалидна или неприложима,
              останалите разпоредби остават в сила.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">16. Контакт</h2>

            <p>За въпроси относно тези Общи условия:</p>

            <div className="bg-card border border-border rounded-lg p-6 mt-4">
              <p className="font-semibold text-foreground">TestoGraph</p>
              <p>Електронна поща: <a href="mailto:support@testograph.eu" className="text-primary hover:underline">support@testograph.eu</a></p>
              <p>Уебсайт: <a href="https://testograph.eu" className="text-primary hover:underline">testograph.eu</a></p>
              <p className="mt-3">
                Преглед на други правни документи:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><a href="/privacy" className="text-primary hover:underline">Политика за поверителност</a></li>
                <li><a href="/cookies" className="text-primary hover:underline">Политика за бисквитки</a></li>
              </ul>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              Тези условия са в сила от {new Date().toLocaleDateString('bg-BG')} г.
            </p>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Използвайки нашия сайт, Вие потвърждавате, че сте прочели, разбрали и приели тези Общи условия.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
