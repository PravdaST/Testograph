import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from '@/components/providers/query-provider'
import { CookieConsent } from "@/components/CookieConsent"
import { AnalyticsScripts } from "@/components/AnalyticsScripts"

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '800'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '700'],
})

// Mobile-first viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#499167',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://testograph.eu'),
  title: {
    default: 'TestoUP: Цялостна система за висок тестостерон и мъжко здраве | Testograph',
    template: '%s | Testograph'
  },
  description: 'Повиши своя тестостерон по естествен път със системата TestoUP. Клинично тествана добавка и персонално приложение за повече енергия, по-силно либидо и по-добри резултати. Започни днес!',
  keywords: ['тестостерон', 'повишаване на тестостерон', 'мъжко здраве', 'либидо', 'енергия', 'хранителна добавка', 'TestoUP', 'фитнес', 'мускулна маса', 'натурални съставки'],
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
    title: 'TestoUP: Цялостна система за висок тестостерон и мъжко здраве',
    description: 'Повиши своя тестостерон по естествен път със системата TestoUP. Клинично тествана добавка и персонално приложение за повече енергия, по-силно либидо и по-добри резултати. Започни днес!',
    images: [
      {
        url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/social-images/social-1757673646778-20250908_1219_Testograph Futuristic Logo_simple_compose_01k4m9x1xzeb899xy44fmbdc9j.png',
        width: 1200,
        height: 630,
        alt: 'Testograph - Цялостна система за висок тестостерон',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TestoUP: Цялостна система за висок тестостерон и мъжко здраве',
    description: 'Повиши своя тестостерон по естествен път със системата TestoUP. Клинично тествана добавка и персонално приложение за повече енергия, по-силно либидо и по-добри резултати. Започни днес!',
    images: ['https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/social-images/social-1757673646778-20250908_1219_Testograph Futuristic Logo_simple_compose_01k4m9x1xzeb899xy44fmbdc9j.png'],
  },
  alternates: {
    canonical: 'https://testograph.eu',
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
    <html lang="bg" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "TestoUP - Цялостна система за повишаване на тестостерона",
              "description": "TestoUP е цялостна система за естествено повишаване на тестостерона, включваща клинично тествана хранителна добавка и персонализирано приложение за тренировки, хранене и възстановяване.",
              "url": "https://testograph.eu",
              "image": "https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/social-images/social-1757673646778-20250908_1219_Testograph Futuristic Logo_simple_compose_01k4m9x1xzeb899xy44fmbdc9j.png",
              "brand": {
                "@type": "Brand",
                "name": "Testograph"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "BGN",
                "price": "67.00",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                "url": "https://shop.testograph.eu/products/testoup"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1243"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Иван, 32г."
                  },
                  "reviewBody": "Добавката действа бързо, но цялата система наистина те преобразява."
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Георги, 38г."
                  },
                  "reviewBody": "Първите дни ти показват, че добавката работи. Следващите седмици те променят изцяло."
                }
              ]
            })
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Testograph",
              "url": "https://testograph.eu",
              "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png",
              "description": "Testograph е водещата компания за мъжко здраве в България, предлагаща цялостна система за естествено повишаване на тестостерона чрез клинично тествани добавки и персонализирано приложение.",
              "sameAs": [
                "https://www.facebook.com/testograph",
                "https://www.instagram.com/testograph",
                "https://shop.testograph.eu"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@testograph.eu",
                "contactType": "Customer Service",
                "availableLanguage": "Bulgarian"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG",
                "addressLocality": "София"
              }
            })
          }}
        />

        {/* WebSite Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Testograph",
              "url": "https://testograph.eu",
              "description": "Цялостна система за естествено повишаване на тестостерона при мъжете - клинично тествана добавка и персонализирано AI приложение.",
              "publisher": {
                "@type": "Organization",
                "name": "Testograph",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://testograph.eu/learn?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Analytics scripts handled by AnalyticsScripts component */}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
            <CookieConsent />
            <AnalyticsScripts />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
