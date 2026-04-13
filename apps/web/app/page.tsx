import Link from "next/link";
import { buttonVariants } from "@bozzart/ui";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content" className="min-h-screen">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-8 py-32 text-center">
          <h1 className="font-serif max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            L&apos;art contemporain,
            <br />
            <span className="text-brand-600 dark:text-brand-400">sans intermédiaire</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/70">
            Découvrez des artistes, suivez leur travail, achetez directement. Chaque œuvre a une histoire. Chaque achat soutient un artiste.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/discover" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Découvrir les œuvres
            </Link>
            <Link href="/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Je suis artiste
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-foreground/10 bg-foreground/[0.02] px-8 py-24">
          <h2 className="sr-only">Pourquoi Bozzart</h2>
          <div className="mx-auto grid max-w-5xl gap-16 sm:grid-cols-3">
            <div>
              <h2 className="font-serif text-xl font-semibold">Pour les artistes</h2>
              <p className="mt-2 text-foreground/70 leading-relaxed">
                Créez votre galerie, partagez votre processus créatif dans votre Carnet, vendez directement sans commission cachée. 90% du prix pour vous.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold">Pour les collectionneurs</h2>
              <p className="mt-2 text-foreground/70 leading-relaxed">
                Découvrez des artistes émergents, suivez leur travail, échangez directement, et recevez un certificat d&apos;authenticité à chaque achat.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold">Transparent</h2>
              <p className="mt-2 text-foreground/70 leading-relaxed">
                10% de commission. Pas de frais cachés. Virement artiste en 48h. Programme Fondateurs à 8%.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold md:text-3xl">
            Prêt à découvrir l&apos;art autrement ?
          </h2>
          <p className="mt-4 max-w-lg text-foreground/70">
            Explorez des œuvres uniques ou rejoignez la communauté en tant qu&apos;artiste.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/discover" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Explorer
            </Link>
            <Link href="/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Créer mon compte
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
