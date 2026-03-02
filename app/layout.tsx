import type { Metadata, Viewport } from 'next'
import './globals.css'
import GlobalNav from '@/components/ui/GlobalNav'

export const metadata: Metadata = {
  title: 'Tele-Porto — Learn Portuguese',
  description: 'Personalised Portuguese learning for Harry and Ky',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#006600',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <GlobalNav />
        <main className="min-h-screen pb-safe">
          {children}
        </main>
      </body>
    </html>
  )
}
