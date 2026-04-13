import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialite",
};

export default function ConfidentialitePage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-8 py-12">
      <article className="prose prose-gray">
        <h1>Politique de Confidentialite</h1>
        <p className="text-sm text-gray-500">
          Derniere mise a jour : {/* TODO: ajouter la date */} -
        </p>

        <section>
          <h2>1. Collecte des donnees personnelles</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO */}
            Dans le cadre de l&apos;utilisation du site bozzart.art, nous
            collectons les donnees personnelles suivantes :
          </p>
          <ul>
            <li>Nom, prenom et nom d&apos;utilisateur</li>
            <li>Adresse email</li>
            <li>Adresse de livraison (lors d&apos;un achat)</li>
            <li>Donnees de paiement (traitees par Stripe, non stockees sur nos serveurs)</li>
            <li>Donnees de navigation (cookies, adresse IP)</li>
          </ul>
        </section>

        <section>
          <h2>2. Utilisation des donnees</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO */}
            Vos donnees personnelles sont utilisees pour :
          </p>
          <ul>
            <li>La creation et la gestion de votre compte</li>
            <li>Le traitement de vos commandes et la livraison</li>
            <li>La communication relative a vos commandes</li>
            <li>L&apos;amelioration de nos services</li>
            <li>Le respect de nos obligations legales</li>
          </ul>
          <p>
            Base legale : execution du contrat, consentement, interet legitime
            et obligations legales (article 6 du RGPD).
          </p>
        </section>

        <section>
          <h2>3. Cookies</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO — implementer bandeau cookies */}
            Le site utilise des cookies strictement necessaires au fonctionnement
            (authentification, panier). Des cookies analytiques peuvent etre
            deposes avec votre consentement prealable.
          </p>
        </section>

        <section>
          <h2>4. Partage des donnees</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO */}
            Vos donnees peuvent etre partagees avec :
          </p>
          <ul>
            <li>Les artistes (adresse de livraison pour l&apos;expedition)</li>
            <li>Stripe (traitement des paiements)</li>
            <li>Supabase (hebergement des donnees)</li>
            <li>Vercel (hebergement du site)</li>
          </ul>
          <p>
            Nous ne vendons jamais vos donnees personnelles a des tiers.
          </p>
        </section>

        <section>
          <h2>5. Conservation des donnees</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO — preciser les durees */}
            Vos donnees sont conservees pendant la duree de votre compte, puis
            archivees conformement aux obligations legales (notamment fiscales :
            10 ans).
          </p>
        </section>

        <section>
          <h2>6. Vos droits (RGPD)</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO */}
            Conformement au Reglement General sur la Protection des Donnees
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d&apos;acces a vos donnees</li>
            <li>Droit de rectification</li>
            <li>Droit a l&apos;effacement (&laquo; droit a l&apos;oubli &raquo;)</li>
            <li>Droit a la portabilite</li>
            <li>Droit d&apos;opposition</li>
            <li>Droit a la limitation du traitement</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous a l&apos;adresse :{" "}
            <strong>[TODO: email DPO]</strong>.
          </p>
          <p>
            Vous pouvez egalement introduire une reclamation aupres de la CNIL
            (Commission Nationale de l&apos;Informatique et des Libertes).
          </p>
        </section>

        <section>
          <h2>7. Securite</h2>
          <p>
            {/* TODO: faire relire par un juriste / DPO */}
            Nous mettons en oeuvre des mesures techniques et organisationnelles
            appropriees pour proteger vos donnees personnelles contre tout acces
            non autorise, perte ou destruction.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            {/* TODO: ajouter email DPO */}
            Pour toute question relative a la protection de vos donnees,
            contactez notre Delegue a la Protection des Donnees (DPO) a
            l&apos;adresse : <strong>[TODO: email DPO]</strong>.
          </p>
        </section>
      </article>
    </main>
  );
}
