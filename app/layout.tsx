import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tozato AI Core',
  description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
  metadataBase: new URL('https://tozato-ai-core.vercel.app'),
  openGraph: {
    title: 'Tozato AI Core',
    description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
    url: 'https://tozato-ai-core.vercel.app',
    images: [
      {
        url: '/tozato-ai-core-banner.gif',
        width: 1200,
        height: 630,
        alt: 'Tozato AI Core: Engenharia 4.0 e Inteligência Artificial',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tozato AI Core',
    description: 'Assistente de inteligência artificial multimodal Tozato AI Core.',
    images: ['/tozato-ai-core-banner.gif'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
