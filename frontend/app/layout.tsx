import type { Metadata } from 'next'
import { StrictMode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Kutraa operations dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <Providers>
          <StrictMode>
            {children}
            <Toaster position="bottom-right" theme="dark" richColors />
          </StrictMode>
        </Providers>
      </body>
    </html>
  )
}
