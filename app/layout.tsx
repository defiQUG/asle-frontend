import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ToastNotifications } from '@/components/ToastNotifications'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ASLE - Ali & Saum Liquidity Engine',
  description: 'Hybrid Cross-Chain Liquidity Infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <ToastNotifications />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
