import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Legales",
};

export default function MentionsLegalesPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-8 py-12">
      <article className="prose prose-gray">
        <h1>Mentions Legales</h1>

        <section>
          <h2>Editeur du site</h2>
          {/* TODO: completer avec les informations reelles */}
          <p>
            Le site <strong>bozzart.art</strong> est edite par :
          </p>
          <ul>
            <li>
              <strong>Raison sociale :</strong> [TODO: nom de
              l&apos;auto-entreprise]
            </li>
            <li>
              <strong>Statut :</strong> Auto-entrepreneur
            </li>
            <li>
              <strong>SIRET :</strong> [TODO: numero SIRET]
            </li>
            <li>
              <strong>Adresse :</strong> [TODO: adresse du siege]
            </li>
            <li>
              <strong>Email :</strong> [TODO: email de contact]
            </li>
            <li>
              <strong>Telephone :</strong> [TODO: numero de telephone]
            </li>
          </ul>
        </section>

        <section>
          <h2>Responsable de la publication</h2>
          {/* TODO: completer */}
          <p>
            <strong>[TODO: nom du responsable]</strong>, en qualite de gerant.
          </p>
        </section>

        <section>
          <h2>Hebergeur</h2>
          <p>Le site est heberge par :</p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong>
            </li>
            <li>440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis</li>
            <li>
              Site web :{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                vercel.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Propriete intellectuelle</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            L&apos;ensemble des contenus presents sur le site bozzart.art
            (textes, images, logos, oeuvres d&apos;art) sont proteges par le
            droit de la propriete intellectuelle. Toute reproduction, meme
            partielle, est interdite sans autorisation prealable.
          </p>
          <p>
            Les oeuvres presentees sur le site restent la propriete de leurs
            artistes respectifs.
          </p>
        </section>

        <section>
          <h2>Donnees personnelles</h2>
          <p>
            Pour en savoir plus sur la collecte et le traitement de vos donnees
            personnelles, consultez notre{" "}
            <a href="/confidentialite">Politique de Confidentialite</a>.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            Le site utilise des cookies necessaires a son fonctionnement. Pour
            plus d&apos;informations, consultez notre{" "}
            <a href="/confidentialite">Politique de Confidentialite</a>.
          </p>
        </section>

        <section>
          <h2>Litiges</h2>
          <p>
            {/* TODO: faire relire par un juriste */}
            Les presentes mentions legales sont soumises au droit francais. En
            cas de litige, et apres tentative de resolution amiable, les
            tribunaux francais seront seuls competents.
          </p>
        </section>
      </article>
    </main>
  );
}
