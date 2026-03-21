"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { ChatBot } from "@/components/ChatBot";
import { Footer } from "@/components/Footer";

type PublicShellProps = {
  children: React.ReactNode;
};

const HIDDEN_PREFIXES = ["/vendeur", "/admin"];

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const hidePublicChrome = HIDDEN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
      <ChatBot />
    </>
  );
}
