import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПРЕМИУМ Пакет - 3 месеца оптимизация | Testograph",
  description:
    "3x TestoUP бутилки (90 дни) + Пълен протокол + 24/7 поддръжка + Бонуси на стойност 562.90 лв. Само 197 лв - спести 365.90 лв. Най-популярният избор.",
  keywords: [
    "тестостерон",
    "TestoUP",
    "премиум пакет",
    "3 месеца",
    "либидо",
    "енергия",
    "мускулна маса",
    "VIP пакет",
    "най-популярен",
  ],
  openGraph: {
    title: "ПРЕМИУМ Пакет - 3 месеца оптимизация | Testograph",
    description:
      "3x TestoUP бутилки (90 дни) + Пълен протокол + 24/7 поддръжка. Спести 365.90 лв. Най-популярният избор.",
    images: [
      {
        url: "/products/premium-hero.jpg",
        width: 1200,
        height: 630,
        alt: "ПРЕМИУМ Пакет - 3x TestoUP бутилки",
      },
    ],
  },
};

export default function PremiumProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
