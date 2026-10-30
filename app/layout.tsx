import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tozato Dev Hub | Rafael Ornelas Tozato",
  description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
  metadataBase: new URL("https://tozato-dev-hub.vercel.app"),
  openGraph: {
    title: "Tozato Dev Hub | Rafael Ornelas Tozato",
    description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
    url: "https://tozato-dev-hub.vercel.app",
    siteName: "Tozato Dev Hub",
    images: [
      {
        url: "https://raw.githubusercontent.com/Rafael-TOZATO/tozato-ai-core/principal/p%C3%BAlitico/Gemini_Generated_Image_v25p8vv25p8vv25p.jpg",
        width: 1200,
        height: 630,
        alt: "Banner Tozato Dev Hub - Rafael Ornelas Tozato",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tozato Dev Hub | Rafael Ornelas Tozato",
    description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
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
