import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from '@/components/providers/query-provider'
import { CookieConsent } from "@/components/CookieConsent"

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://testograph.eu'),
  title: {
    default: 'Безплатен Тестостерон Анализ за 90 Секунди | Testograph',
    template: '%s | Testograph'
  },
  description: 'Открийте истинската причина за липсата на енергия. Безплатен персонализиран доклад за нивата на тестостерон, създаден от водещи експерти. 3,247+ доволни български мъже. 100% дискретно.',
  keywords: ['тестостерон', 'здравна оценка', 'хормонални нива', 'фитнес', 'здраве', 'здравен инструмент'],
  authors: [{ name: 'Testograph' }],
  creator: 'Testograph',
  publisher: 'Testograph',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: 'https://testograph.eu',
    siteName: 'Testograph',
    title: 'Безплатен Тестостерон Анализ за 90 Секунди',
    description: 'Открийте истинската причина за липсата на енергия. Безплатен персонализиран доклад за нивата на тестостерон. 100% дискретно.',
    images: [
      {
        url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/social-images/social-1757673646778-20250908_1219_Testograph Futuristic Logo_simple_compose_01k4m9x1xzeb899xy44fmbdc9j.png',
        width: 1200,
        height: 630,
        alt: 'Testograph - Безплатен Тестостерон Анализ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Безплатен Тестостерон Анализ за 90 Секунди',
    description: 'Открийте истинската причина за липсата на енергия. 100% дискретно.',
    images: ['https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/social-images/social-1757673646778-20250908_1219_Testograph Futuristic Logo_simple_compose_01k4m9x1xzeb899xy44fmbdc9j.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png',
    apple: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Testograph - Безплатен Тестостерон Анализ',
              description: 'Получете персонализиран доклад за нивата на тестостерон въз основа на факторите от начина на живот и здравните показатели.',
              url: 'https://testograph.eu/',
              inLanguage: 'bg-BG',
              publisher: {
                '@type': 'Organization',
                name: 'Testograph',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png'
                }
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BGN',
                availability: 'https://schema.org/InStock',
                description: 'Безплатен персонализиран доклад за тестостерон'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1243'
              }
            })
          }}
        />

        {/* Facebook Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '9450560195068576');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=9450560195068576&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
            <CookieConsent />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
