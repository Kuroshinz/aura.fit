import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AURA.FIT | Ultra-Luxury Spatial Athletics',
  description: 'Antigravity 3D Spatial Gym Workout Tracker Interface',
}

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
      </head>
      <body className="bg-[#020206] text-white font-sans selection:bg-amber-400 selection:text-black antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
