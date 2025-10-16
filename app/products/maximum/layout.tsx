import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "МАКС Пакет - 4 месеца трансформация | Testograph",
  description:
    "4x TestoUP бутилки (120 дни) + Пълен протокол + VIP поддръжка + Бонуси на стойност 629.90 лв. Само 267 лв - спести 362.90 лв. За сериозни резултати.",
  keywords: [
    "тестостерон",
    "TestoUP",
    "макс пакет",
    "4 месеца",
    "либидо",
    "енергия",
    "мускулна маса",
    "сила",
    "VIP пакет",
  ],
  openGraph: {
    title: "МАКС Пакет - 4 месеца трансформация | Testograph",
    description:
      "4x TestoUP бутилки (120 дни) + Пълен протокол + VIP поддръжка. Спести 362.90 лв.",
    images: [
      {
        url: "/products/maximum-hero.jpg",
        width: 1200,
        height: 630,
        alt: "МАКС Пакет - 4 месеца TestoUP",
      },
    ],
  },
};

export default function MaximumProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
