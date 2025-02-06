import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Text2Img',
  description: 'This is an AI Image Generator. It creates an image from scratch from a text description.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="hydrated">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
