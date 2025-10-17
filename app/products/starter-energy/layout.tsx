import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Върни си енергията естествено - СТАРТ Пакет | Testograph",
  description: "TestoUP добавка + 30-дневен протокол специално за енергия и умора. Само 97 лв. 30-дневна гаранция. От 3 кафета до пълна енергия.",
  keywords: [
    "енергия",
    "умора",
    "хронична умора",
    "продуктивност",
    "TestoUP",
    "тестостерон",
    "физическа енергия",
    "ментална енергия",
    "витамин D",
    "B12"
  ],
  alternates: {
    canonical: "https://testograph.eu/products/starter-energy"
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
    title: "Върни си енергията и продуктивността - СТАРТ Пакет 97 лв",
    description: "Специален протокол за енергия: TestoUP добавка + 30-дневен план + 24/7 поддръжка. 30-дневна гаранция.",
    type: "website",
    locale: "bg_BG",
    siteName: "Testograph",
    url: "https://testograph.eu/products/starter-energy",
    images: [
      {
        url: "/products/starter-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Testograph СТАРТ Пакет за енергия - TestoUP добавка и протокол"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "СТАРТ Пакет за енергия - Повиши тестостерона естествено | Testograph",
    description: "TestoUP + 30-дневен протокол за енергия + 24/7 поддръжка за 97 лв. 30-дневна гаранция.",
  }
};

export default function StarterEnergyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
