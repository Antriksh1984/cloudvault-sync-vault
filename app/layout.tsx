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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
