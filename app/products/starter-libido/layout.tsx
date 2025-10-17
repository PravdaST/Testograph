import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Върни си либидото естествено - СТАРТ Пакет | Testograph",
  description: "TestoUP добавка + 30-дневен протокол специално за либидо и сексуално желание. Само 97 лв. 30-дневна гаранция. Работи за 94% от мъжете.",
  keywords: [
    "либидо",
    "сексуално желание",
    "еректилна функция",
    "TestoUP",
    "тестостерон",
    "мъжка сила",
    "потентност",
    "естествено либидо",
    "хормонален баланс",
    "сексуално здраве"
  ],
  alternates: {
    canonical: "https://testograph.eu/products/starter-libido"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Върни си либидото и сексуалното желание - СТАРТ Пакет 97 лв",
    description: "Специален протокол за либидо: TestoUP добавка + 30-дневен план + 24/7 поддръжка. 30-дневна гаранция.",
    type: "website",
    locale: "bg_BG",
    siteName: "Testograph",
    url: "https://testograph.eu/products/starter-libido",
    images: [
      {
        url: "/products/starter-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Testograph СТАРТ Пакет за либидо - TestoUP добавка и протокол"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "СТАРТ Пакет за либидо - Повиши тестостерона естествено | Testograph",
    description: "TestoUP + 30-дневен протокол за либидо + 24/7 поддръжка за 97 лв. 30-дневна гаранция.",
  }
};

export default function StarterLibidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
