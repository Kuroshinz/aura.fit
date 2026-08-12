import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AURA.FIT | Ultra-Luxury Spatial Athletics',
  description: 'Antigravity 3D Spatial Gym Workout Tracker Interface — Track workouts, monitor progress, and optimize your fitness journey with real-time analytics.',
  openGraph: {
    title: 'AURA.FIT | Spatial Athletics System',
    description: 'Next-gen gym workout tracker with real-time analytics and 3D spatial interface.',
    type: 'website',
    siteName: 'AURA.FIT',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AURA.FIT',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#020206',
}

import Script from 'next/script'
import { InstallPWAPrompt } from '@/components/effects/install-pwa-prompt'
import { ErrorBoundary } from '@/components/effects/error-boundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AURA.FIT" />
      </head>
      <body className="bg-[#020206] text-white font-sans selection:bg-amber-400 selection:text-black antialiased overflow-x-hidden">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <InstallPWAPrompt />
        <Analytics />
        <SpeedInsights />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
