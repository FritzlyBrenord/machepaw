"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { ChatBot } from "@/components/ChatBot";
import { Footer } from "@/components/Footer";

type PublicShellProps = {
  children: React.ReactNode;
};

const HIDDEN_PREFIXES = ["/vendeur", "/admin", "/boutique", "/auth"];
const MARKETING_PATHS = ["/", "/prix", "/modeles", "/a-propos", "/devenir-vendeur"];

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const hidePublicChrome = HIDDEN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isMarketingPage = MARKETING_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {!isMarketingPage ? <CartDrawer /> : null}
      <main>{children}</main>
      <Footer />
      {!isMarketingPage ? <ChatBot /> : null}
    </>
  );
}
