import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RESPOS - Restaurant POS',
  description: 'Restaurant Point of Sale System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  )
}