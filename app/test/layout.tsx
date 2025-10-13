import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безплатна оценка на тестостерона | Testograph - Провери нивата си в nmol/L",
  description: "Направи безплатна 3-минутна оценка на нивото на тестостерона си и получи резултат в nmol/L. Разбери дали си под 12 nmol/L (ниско), 12-26 (нормално) или над 26 (високо). Персонализиран анализ и препоръки как да подобриш здравето си естествено.",
  keywords: [
    "тестостерон",
    "оценка на тестостерона",
    "ниво на тестостерона",
    "тестостерон тест",
    "nmol/L",
    "тестостерон под 12",
    "нормално ниво тестостерон",
    "ниски нива тестостерон",
    "здраве на мъжете",
    "хормонален баланс",
    "проверка на тестостерон",
    "безплатен тест тестостерон",
    "симптоми нисък тестостерон",
    "как да повиша тестостерона"
  ],
  alternates: {
    canonical: "https://testograph.eu/test"
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
    title: "Безплатна оценка на тестостерона | Testograph - Провери нивата си в nmol/L",
    description: "Направи безплатна 3-минутна оценка на нивото на тестостерона си и получи резултат в nmol/L. Разбери дали си под 12 nmol/L (ниско), 12-26 (нормално) или над 26 (високо).",
    type: "website",
    locale: "bg_BG",
    siteName: "Testograph",
    url: "https://testograph.eu/test"
  },
  twitter: {
    card: "summary_large_image",
    title: "Безплатна оценка на тестостерона | Testograph",
    description: "Направи безплатна 3-минутна оценка на нивото на тестостерона си и получи резултат в nmol/L",
  }
};

export default function TestPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
