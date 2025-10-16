import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TestoUP - Естествена добавка за тестостерон | Testograph",
  description:
    "TestoUP добавка (60 капсули) - клинично доказана формула за повишаване на тестостерона. Само 67 лв за 1 бутилка, или вземи 2x за 120 лв, 3x за 167 лв.",
  keywords: [
    "TestoUP",
    "тестостерон добавка",
    "TestoUP бутилка",
    "либидо",
    "енергия",
    "естествена добавка",
    "хормонално здраве",
  ],
  openGraph: {
    title: "TestoUP - Естествена добавка за тестостерон | Testograph",
    description:
      "TestoUP добавка (60 капсули) - клинично доказана формула. 67 лв за 1 бутилка.",
    images: [
      {
        url: "/products/testoup-hero.jpg",
        width: 1200,
        height: 630,
        alt: "TestoUP - Естествена добавка за тестостерон",
      },
    ],
  },
};

export default function TestoUpProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
