import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Научен Център - Статии за Тестостерон и Мъжко Здраве | Testograph',
    template: '%s | Testograph Learn',
  },
  description: 'Образователни статии за тестостерон, мъжко здраве, фитнес и хранене. Научно обосновани ръководства с практически съвети от експерти.',
  keywords: [
    'тестостерон статии',
    'мъжко здраве',
    'фитнес съвети',
    'хранене за мъже',
    'научни статии тестостерон',
    'потенция',
    'либидо',
    'добавки',
    'начин на живот',
  ],
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: 'https://testograph.eu/learn',
    siteName: 'Testograph',
    title: 'Научен Център - Статии за Тестостерон и Мъжко Здраве',
    description: 'Образователни статии за тестостерон, мъжко здраве, фитнес и хранене. Научно обосновани ръководства с практически съвети от експерти.',
    images: [
      {
        url: 'https://testograph.eu/testograph-background.webp',
        width: 1200,
        height: 630,
        alt: 'Testograph Learn - Научен Център',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Научен Център - Статии за Тестостерон и Мъжко Здраве',
    description: 'Образователни статии за тестостерон, мъжко здраве, фитнес и хранене. Научно обосновани ръководства с практически съвети от експерти.',
    images: ['https://testograph.eu/testograph-background.webp'],
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
