import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gesture Control Player - Minority Report Style',
  description: 'Control volume and playback with hand gestures',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}


