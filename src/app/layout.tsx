import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/PublicShell";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUXE | Boutique de Luxe en Ligne",
  description:
    "LUXE - Boutique en ligne de luxe. Découvrez notre collection de montres, bijoux et accessoires d'exception.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
      >
        <Providers>
          <PublicShell>{children}</PublicShell>
        </Providers>
      </body>
    </html>
  );
}
