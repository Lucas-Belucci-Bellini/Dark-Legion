import type { Metadata } from "next";
import "./globals.css";

// Metadados iniciais para compartilhamento e indexação do portal público.
export const metadata: Metadata = {
  title: {
    default: "Dark Legion — Projetos e tecnologia",
    template: "%s | Dark Legion",
  },
  description:
    "Conheça a Dark Legion: um portfólio de projetos públicos de software, jogos, ferramentas e experiências web.",
  applicationName: "Dark Legion",
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