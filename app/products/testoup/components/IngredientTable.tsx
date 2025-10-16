"use client";

export function IngredientTable() {
  const ingredients = [
    {
      name: "Витамин D3",
      amount: "4000 IU",
      benefit: "Повишава тестостерон с до 25%",
      proven: true,
    },
    {
      name: "Цинк",
      amount: "30mg",
      benefit: "Ключов минерал за производство на тестостерон",
      proven: true,
    },
    {
      name: "Магнезий",
      amount: "400mg",
      benefit: "Подобрява качество на сън и възстановяване",
      proven: true,
    },
    {
      name: "Ашваганда",
      amount: "600mg",
      benefit: "Намалява кортизол, повишава либидо",
      proven: true,
    },
    {
      name: "D-Аспарагинова киселина",
      amount: "3000mg",
      benefit: "Стимулира лутеинизиращ хормон (LH)",
      proven: true,
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Какво има вътре?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            5 активни съставки, клинично доказани. Нищо друго.
          </p>
        </div>

        {/* Ingredients Table */}
        <div className="bg-background rounded-xl shadow-xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
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
