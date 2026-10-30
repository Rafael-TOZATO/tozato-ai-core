import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tozato Dev Hub | Rafael Ornelas Tozato",
  description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
  metadataBase: new URL("https://tozato.vercel.app"),
  openGraph: {
    title: "Tozato Dev Hub | Rafael Ornelas Tozato",
    description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
    url: "https://tozato.vercel.app",
    siteName: "Tozato Dev Hub",
    images: [
      {
        url: "https://tozato.vercel.app/público/Gemini_Generated_Image_v25p8vv25p8vv25p.jpg",
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
    images: ["https://tozato.vercel.app/público/Gemini_Generated_Image_v25p8vv25p8vv25p.jpg"],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
