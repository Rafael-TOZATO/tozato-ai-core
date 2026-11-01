import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tozato - Core AI | Rafael Ornelas Tozato',
  description: 'Hub oficial de engenharia de software, QA e inteligência artificial local.',
  metadataBase: new URL('https://tozato-dev-hub.vercel.app'),
  openGraph: {
    title: 'Tozato - Core AI | Rafael Ornelas Tozato',
    description: 'Hub oficial de engenharia de software, QA e inteligência artificial local.',
    url: 'https://tozato-dev-hub.vercel.app',
    siteName: 'Tozato Core AI',
    images: [
      {
        url: 'https://raw.githubusercontent.com/Rafael-TOZATO/tozato-ai-core/main/Tozato-Core-AI.png',
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
    title: 'Tozato - Core AI | Rafael Ornelas Tozato',
    description: 'Hub oficial de engenharia de software, QA e inteligência artificial local.',
    images: ['https://raw.githubusercontent.com/Rafael-TOZATO/tozato-ai-core/main/Tozato-Core-AI.png'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
