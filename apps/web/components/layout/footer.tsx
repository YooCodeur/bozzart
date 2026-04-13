import Link from "next/link";

const navLinks = [
  { href: "/discover", label: "Découvrir" },
  { href: "/artists", label: "Artistes" },
  { href: "/drops", label: "Drops" },
];

const legalLinks = [
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">
            Bozzart
          </Link>

          {/* Navigation */}
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} Bozzart. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
