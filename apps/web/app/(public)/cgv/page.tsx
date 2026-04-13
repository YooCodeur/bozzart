import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Generales de Vente",
};

export default function CGVPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-8 py-12">
      <article className="prose prose-gray">
        <h1>Conditions Generales de Vente</h1>
        <p className="text-sm text-gray-500">
          Derniere mise a jour : {/* TODO: ajouter la date */} -
        </p>

        <section>
          <h2>1. Objet</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            Les presentes Conditions Generales de Vente (CGV) regissent les
            ventes d&apos;oeuvres d&apos;art realisees sur le site bozzart.art
            (ci-apres &laquo; le Site &raquo;), edite par Bozzart.
          </p>
        </section>

        <section>
          <h2>2. Prix et paiement</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            Les prix sont indiques en euros, toutes taxes comprises (TTC). Le
            paiement s&apos;effectue en ligne par carte bancaire via notre
            prestataire de paiement securise Stripe. La commande est confirmee
            apres acceptation du paiement.
          </p>
        </section>

        <section>
          <h2>3. Livraison</h2>
          <p>
            {/* TODO: faire relire par un juriste — preciser delais et frais */}
            Les oeuvres sont expediees par l&apos;artiste dans un delai indique
            sur la fiche produit. Les frais de livraison sont affiches avant la
            validation de la commande. Bozzart ne saurait etre tenu responsable
            des retards lies au transporteur.
          </p>
        </section>

        <section>
          <h2>4. Droit de retractation</h2>
          <p>
            {/* TODO: faire relire par un juriste — verifier exceptions oeuvres uniques */}
            Conformement a l&apos;article L221-18 du Code de la consommation,
            l&apos;acheteur dispose d&apos;un delai de 14 jours a compter de la
            reception de l&apos;oeuvre pour exercer son droit de retractation,
            sans avoir a justifier de motif. Les oeuvres doivent etre retournees
            dans leur etat d&apos;origine.
          </p>
        </section>

        <section>
          <h2>5. Garanties</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            L&apos;acheteur beneficie de la garantie legale de conformite
            (articles L217-4 et suivants du Code de la consommation) et de la
            garantie des vices caches (articles 1641 et suivants du Code civil).
          </p>
        </section>

        <section>
          <h2>6. Responsabilite</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            Bozzart agit en qualite d&apos;intermediaire entre les artistes et
            les acheteurs. La responsabilite de Bozzart ne saurait etre engagee
            en cas de litige entre un artiste et un acheteur, sauf en cas de
            manquement a ses propres obligations.
          </p>
        </section>

        <section>
          <h2>7. Propriete intellectuelle</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            L&apos;achat d&apos;une oeuvre confere a l&apos;acheteur le droit de
            propriete sur le support physique. Les droits de reproduction et de
            representation restent la propriete de l&apos;artiste, sauf accord
            contraire ecrit.
          </p>
        </section>

        <section>
          <h2>8. Litiges et droit applicable</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            Les presentes CGV sont soumises au droit francais. En cas de litige,
            les parties s&apos;efforceront de trouver une solution amiable. A
            defaut, les tribunaux competents seront ceux du ressort du siege
            social de Bozzart.
          </p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>
            {/* TODO: ajouter email de contact */}
            Pour toute question relative aux presentes CGV, vous pouvez nous
            contacter a l&apos;adresse : <strong>[TODO: email]</strong>.
          </p>
        </section>
      </article>
    </main>
  );
}
