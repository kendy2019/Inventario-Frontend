import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
