import type { Metadata } from 'next'
import { StrictMode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

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
      <body>
        <Providers>
          <StrictMode>
            {children}
          </StrictMode>
        </Providers>
      </body>
    </html>
  )
}
