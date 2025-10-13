import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безплатна оценка на тестостерона | Testograph",
  description: "Направи безплатна 3-минутна оценка на нивото на тестостерона си. Получи персонализиран анализ и препоръки как да подобриш здравето си естествено.",
  keywords: ["тестостерон", "оценка на тестостерона", "ниво на тестостерона", "здраве на мъжете", "хормонален баланс"],
  openGraph: {
    title: "Безплатна оценка на тестостерона | Testograph",
    description: "Направи безплатна 3-минутна оценка на нивото на тестостерона си",
    type: "website"
  }
};

export default function TestPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
