import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "СТАРТ Пакет - Повиши тестостерона естествено | Testograph",
  description: "TestoUP добавка + 30-дневен протокол + експерт поддръжка 24/7. Само 97 лв (вместо 264 лв). 30-дневна гаранция. 3,247+ доволни клиенти.",
  keywords: [
    "тестостерон",
    "TestoUP",
    "старт пакет",
    "либидо",
    "енергия",
    "мъжко здраве",
    "добавка за тестостерон",
    "естествен тестостерон",
    "хормонален баланс",
    "сила и издръжливост"
  ],
  alternates: {
    canonical: "https://testograph.eu/products/starter"
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
    title: "Върни си енергията и силата - СТАРТ Пакет 97 лв",
    description: "Всичко от което се нуждаеш за да започнеш: добавка + протокол + поддръжка. 30-дневна гаранция.",
    type: "website",
    locale: "bg_BG",
    siteName: "Testograph",
    url: "https://testograph.eu/products/starter",
    images: [
      {
        url: "/products/starter-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Testograph СТАРТ Пакет - TestoUP добавка и 30-дневен протокол"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "СТАРТ Пакет - Повиши тестостерона естествено | Testograph",
    description: "TestoUP + 30-дневен протокол + 24/7 поддръжка за 97 лв. 30-дневна гаранция.",
  }
};

export default function StarterProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
