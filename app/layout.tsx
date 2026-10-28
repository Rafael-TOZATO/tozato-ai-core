import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tozato Dev Hub",
  description: "Hub oficial do TozatoCode-AI para engenharia de software, QA e inteligência artificial.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
