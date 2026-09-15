import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://votosperfeitos.com.br"),
  title: "Votos de casamento com a sua história | VotosPerfeitos",
  description:
    "Transforme suas memórias em 3 versões de votos de casamento com ajuda de IA. Responda 6 perguntas e dê seu toque final. Pacote com PDF por R$ 47,00.",
  keywords: [
    "votos de casamento",
    "gerador de votos com ia",
    "discurso de casamento",
    "como escrever votos de casamento",
    "votos emocionantes",
    "votos para altar"
  ],
  authors: [{ name: "VotosPerfeitos Editorial" }],
  openGraph: {
    title: "Você sente tanto. Encontre as palavras para dizer no altar.",
    description:
      "Suas memórias em três versões de votos de casamento no tom que você escolher. Pacote com PDF por R$ 47,00.",
    url: "https://votosperfeitos.com.br",
    siteName: "VotosPerfeitos Web",
    images: [
      {
        url: "/images/hero-groom-altar.jpg",
        width: 1200,
        height: 675,
        alt: "Noivo emocionado lendo votos no altar"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Votos de casamento com a sua história | VotosPerfeitos",
    description:
      "Conte a história de vocês em 6 perguntas. Três versões de votos e PDF para imprimir, por R$ 47,00 em pagamento único.",
    images: ["/images/hero-groom-altar.jpg"]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/icon.png", sizes: "128x128", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"]
  }
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1C1917] antialiased selection:bg-[#F7F1E5] selection:text-[#9C7836]">
        {children}
      </body>
    </html>
  );
}
