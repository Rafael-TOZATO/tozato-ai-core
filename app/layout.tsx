import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tozato AI-Core | Rafael Ornelas Tozato",
  description: "Hub oficial de engenharia de software, QA e inteligência artificial local.",
  metadataBase: new URL("https://tozato.vercel.app"),
  openGraph: {
    title: "Tozato AI-Core | Rafael Ornelas Tozato",
    description: "Hub oficial de engenharia de software, QA e inteligência artificial local.",
    url: "https://tozato.vercel.app",
    siteName: "Tozato AI-Core",
    images: [
      {
        url: "https://raw.githubusercontent.com/Rafael-TOZATO/tozato-ai-core/principal/p%C3%BAlitico/Gemini_Generated_Image_v25p8vv25p8vv25p.jpg",
        width: 1200,
        height: 630,
        alt: "Banner Tozato AI-Core - Rafael Ornelas Tozato",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tozato AI-Core | Rafael Ornelas Tozato",
    description: "Hub oficial de engenharia de software, QA e inteligência artificial local.",
    images: ["https://raw.githubusercontent.com/Rafael-TOZATO/tozato-ai-core/principal/p%C3%BAlitico/Gemini_Generated_Image_v25p8vv25p8vv25p.jpg"],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
