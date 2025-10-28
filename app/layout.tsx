import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { APP_NAME, APP_DESCRIPTION, APP_URL, DEFAULT_SEO, DEFAULT_THEME } from '@/lib/constants'
import { ProgressBar } from '@/components/layout/progress-bar'
import './globals.css'

import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: DEFAULT_SEO.keywords,
  authors: {
    name: `${APP_NAME} Team`,
    url: APP_URL,
  },
  creator: `${APP_NAME} Team`,
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: DEFAULT_SEO.ogImage,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [DEFAULT_SEO.ogImage],
    creator: '@cineverse',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
  verification: {
    google: 'google-site-verification-token',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem
          disableTransitionOnChange
        >
          <ProgressBar />
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              </main>
              <Footer />
            </div>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
