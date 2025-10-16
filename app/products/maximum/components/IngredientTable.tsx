"use client";

export function IngredientTable() {
  const ingredients = [
    {
      name: "Витамин D3 (Холекалциферол)",
      amount: "2400 IU (700% РДА)",
      benefit: "Критичен за производство на тестостерон. Дефицитът води до ниски нива.",
      proven: true,
    },
    {
      name: "Витамин E (D-алфа токоферил)",
      amount: "270mg (2250% РДА)",
      benefit: "Мощен антиоксидант. Защитава тестикуларните клетки от оксидативен стрес.",
      proven: true,
    },
    {
      name: "Ашваганда Екстракт",
      amount: "400mg",
      benefit: "Намалява кортизол до 28%. Повишава тестостерон с 15-17%. Подобрява либидо.",
      proven: true,
    },
    {
      name: "Tribulus Terrestris Екстракт",
      amount: "600mg",
      benefit: "Традиционна билка за мъжка сила. Подкрепя либидо и сексуална функция.",
      proven: true,
    },
    {
      name: "Цинк (Цитрат)",
      amount: "15mg (150% РДА)",
      benefit: "Есенциален минерал за синтез на тестостерон. Подобрява качество на сперма.",
      proven: true,
    },
    {
      name: "Магнезий (Бисглицинат)",
      amount: "44mg",
      benefit: "Повишава свободен и общ тестостерон. Подобрява качество на сън.",
      proven: true,
    },
    {
      name: "Селен (L-селенометионин)",
      amount: "200mcg (364% РДА)",
      benefit: "Критичен за подвижност на сперматозоидите. Подкрепя фертилност.",
      proven: true,
    },
    {
      name: "Витамин B12 (Цианокобаламин)",
      amount: "600mcg (24000% РДА)",
      benefit: "Експлозивна енергия. Подкрепя нервна система и производство на червени кръвни клетки.",
      proven: true,
    },
    {
      name: "Витамин B9 (5-MTHF)",
      amount: "400mcg (200% РДА)",
      benefit: "Активната форма на фолат. Критичен за сперматогенеза и фертилност.",
      proven: true,
    },
    {
      name: "Витамин K2 (MK-7)",
      amount: "100mcg",
      benefit: "Насочва калций към костите (не артериите). Подкрепя cardiovascular здраве.",
      proven: true,
    },
    {
      name: "Витамин B6 (Пиридоксин HCl)",
      amount: "10mg (714% РДА)",
      benefit: "Регулира хормонална активност. Намалява умора и изтощение.",
      proven: true,
    },
    {
      name: "Витамин C (L-аскорбинова киселина)",
      amount: "200mg (250% РДА)",
      benefit: "Антиоксидант. Намалява кортизол. Подобрява имунна функция.",
      proven: true,
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Без химия. Само природни, клинично доказани съставки
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Всяка съставка е избрана на база научни изследвания
          </p>
        </div>

        {/* Ingredients Table */}
        <div className="bg-background rounded-xl shadow-xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <tr>
                  <th className="py-4 px-6 text-left font-bold">Съставка</th>
                  <th className="py-4 px-6 text-left font-bold">Количество</th>
                  <th className="py-4 px-6 text-left font-bold">Ефект</th>
                  <th className="py-4 px-6 text-center font-bold">Доказано</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold">{ingredient.name}</td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {ingredient.amount}
                    </td>
                    <td className="py-4 px-6">{ingredient.benefit}</td>
                    <td className="py-4 px-6 text-center">
                      {ingredient.proven && (
                        <span className="text-green-500 text-2xl">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Произведено в ЕС</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Сертифицирано GMP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Тествано за безопасност</span>
          </div>
        </div>
      </div>
    </section>
  );
}
