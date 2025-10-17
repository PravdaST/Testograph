import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Подобри фертилността естествено - СТАРТ Пакет | Testograph",
  description: "TestoUP добавка + 30-дневен протокол специално за фертилност и спермограма. Само 97 лв. 30-дневна гаранция. Подобри показателите за 90 дни.",
  keywords: [
    "фертилност",
    "спермограма",
    "подвижност на сперматозоиди",
    "брой сперматозоиди",
    "бременност",
    "TestoUP",
    "тестостерон",
    "селен",
    "цинк",
    "мъжка фертилност"
  ],
  alternates: {
    canonical: "https://testograph.eu/products/starter-fertility"
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
    title: "Подобри фертилността и спермограмата - СТАРТ Пакет 97 лв",
    description: "Специален протокол за фертилност: TestoUP добавка + 30-дневен план + 24/7 поддръжка. 30-дневна гаранция.",
    type: "website",
    locale: "bg_BG",
    siteName: "Testograph",
    url: "https://testograph.eu/products/starter-fertility",
    images: [
      {
        url: "/products/starter-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Testograph СТАРТ Пакет за фертилност - TestoUP добавка и протокол"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "СТАРТ Пакет за фертилност - Подобри спермограмата естествено | Testograph",
    description: "TestoUP + 30-дневен протокол за фертилност + 24/7 поддръжка за 97 лв. 30-дневна гаранция.",
  }
};

export default function StarterFertilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
