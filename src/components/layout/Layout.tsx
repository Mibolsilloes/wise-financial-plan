import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-16 pb-20 lg:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
