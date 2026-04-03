import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Commerce Builder",
  description: "Complete E-Commerce Builder - Inspired by Shopify Theme Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
