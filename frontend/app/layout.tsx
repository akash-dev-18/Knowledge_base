import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#6366f1',
}

export const metadata: Metadata = {
  title: 'KnowledgeBase AI — Chat with your documents intelligently',
  description: 'Upload documents and chat with them intelligently using AI. Organize workspaces, manage teams, and extract insights from your knowledge base.',
  keywords: ['document AI', 'RAG', 'knowledge base', 'document chat', 'AI assistant'],
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'oklch(0.17 0.015 264)',
              border: '1px solid oklch(0.25 0.02 275)',
              color: 'oklch(0.96 0.005 264)',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}

