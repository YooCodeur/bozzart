"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useState, useEffect } from "react";

const artistNav = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/artworks", label: "Œuvres" },
  { href: "/dashboard/carnet", label: "Carnet" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/sales", label: "Ventes" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/drops", label: "Drops" },
  { href: "/dashboard/referrals", label: "Parrainage" },
  { href: "/dashboard/settings", label: "Paramètres" },
];

const buyerNav = [
  { href: "/dashboard/collection", label: "Ma collection" },
  { href: "/dashboard/wishlist", label: "Wishlist" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/settings", label: "Paramètres" },
];

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isArtist, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const nav = isArtist ? artistNav : buyerNav;

  const sidebarContent = (
    <>
      <Link href="/" className="text-lg font-semibold">
        Bozzart
      </Link>
      <p className="mt-1 text-sm text-gray-500">{profile?.displayName || profile?.username}</p>

      <nav className="mt-8 space-y-1" aria-label="Menu du tableau de bord">
        {nav.map((item) => {
          const active = isNavActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={signOut}
          aria-label="Se déconnecter"
          className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
        >
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link href="/" className="text-lg font-semibold">
          Bozzart
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileMenuOpen}
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-64 translate-x-0 border-r bg-gray-50 p-6 transition-transform">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">
                Bozzart
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">{profile?.displayName || profile?.username}</p>

            <nav className="mt-8 space-y-1" aria-label="Menu du tableau de bord">
              {nav.map((item) => {
                const active = isNavActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-2 text-sm transition ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-8">
              <button
                onClick={signOut}
                aria-label="Se déconnecter"
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-gray-50 p-6">
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 p-6 pt-20 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
