import type { Metadata } from 'next'
import { Cinzel, Geist_Mono, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FieldNotebookProvider } from '@/hooks/use-field-notebook'
import { CommandPalette } from '@/components/shared/command-palette'
import { FieldNotebookSheet } from '@/components/shared/field-notebook-sheet'
import './globals.css'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'WikiDino — Digital Paleontology & Fossil Archive',
  description: 'Explore the prehistoric world with our comprehensive collection of dinosaurs. Learn about their taxonomy, characteristics, and fossil records.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${cinzel.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <FieldNotebookProvider>
          {children}
          <CommandPalette />
          <FieldNotebookSheet />
        </FieldNotebookProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
