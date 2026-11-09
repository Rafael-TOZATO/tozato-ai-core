import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tozato AI Core',
  description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
  metadataBase: new URL('https://tozato-ai-core.vercel.app'),
  openGraph: {
    title: 'Tozato AI Core',
    description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
    url: 'https://tozato-ai-core.vercel.app',
    siteName: 'Tozato AI Core',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tozato - Core AI: transforme ideias em impacto',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tozato AI Core',
    description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
