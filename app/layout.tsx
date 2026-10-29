import type { Metadata } from "next";
import "./globals.css";

const description =
  "Explore os projetos públicos de Lucas Belucci Bellini: repositórios, aplicações, ferramentas e experiências web.";

export const metadata: Metadata = {
  title: {
    default: "Dark Legion — Diretório de projetos",
    template: "%s | Dark Legion",
  },
  description,
  applicationName: "Dark Legion",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dark Legion",
    title: "Dark Legion — Diretório de projetos",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
