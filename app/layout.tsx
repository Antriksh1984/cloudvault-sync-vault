import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloudVault - Secure Cloud Storage',
  description: 'A modern cloud storage solution with drag-and-drop functionality, secure authentication, and seamless file management.',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
