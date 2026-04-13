# ROADMAP V2 — BOZZART RESEAU SOCIAL (bozzart.com)

> **Objectif** : Transformer Bozzart d'une marketplace artistique en un **reseau social de l'art** ou l'engagement communautaire drive les ventes naturellement.
>
> **Derniere mise a jour** : 2026-03-31
>
> **Prerequis** : Toutes les phases 0-11 de la V1 sont implementees et le build est OK.
>
> **Philosophie** : "Faites-moi pleurer avant de me montrer le prix." — L'emotion d'abord, la transaction ensuite.

---

## TABLE DES MATIERES

1. [Phase 12 — Renforcement Mobile : PWA Web + App Expo](#phase-12--renforcement-mobile--pwa-web--app-expo-semaines-23-26)
2. [Phase 13 — Le Carnet comme Feed Principal](#phase-13--le-carnet-comme-feed-principal-semaines-24-26)
3. [Phase 14 — Feed Algorithmique](#phase-14--feed-algorithmique-semaines-26-28)
4. [Phase 15 — Graph Social Etendu](#phase-15--graph-social-etendu-semaines-28-30)
5. [Phase 16 — Activity Feed & Social Proof](#phase-16--activity-feed--social-proof-semaines-30-32)
6. [Phase 17 — Stories Visuelles](#phase-17--stories-visuelles-semaines-32-34)
7. [Phase 18 — Systeme d'Abonnement Artiste](#phase-18--systeme-dabonnement-artiste-semaines-34-36)
8. [Phase 19 — Commandes Personnalisees](#phase-19--commandes-personnalisees-semaines-36-37)
9. [Phase 20 — Print-on-Demand](#phase-20--print-on-demand-semaines-37-39)
10. [Phase 21 — Viralite & Croissance Organique](#phase-21--viralite--croissance-organique-semaines-39-41)
11. [Phase 22 — Notifications Intelligentes & Retention](#phase-22--notifications-intelligentes--retention-semaines-41-43)
12. [Phase 23 — Live Streaming Atelier](#phase-23--live-streaming-atelier-semaines-43-46)
13. [Phase 24 — Data & Intelligence](#phase-24--data--intelligence-semaines-46-48)
14. [Phase 25 — Monetisation Avancee](#phase-25--monetisation-avancee-semaines-48-50)
15. [Resume & Dependances](#resume-par-semaine)

---

## PRINCIPES DIRECTEURS V2

| Principe | Explication |
|----------|-------------|
| **Emotion > Transaction** | Le prix ne s'affiche jamais dans un contexte de decouverte. L'utilisateur tombe amoureux d'abord. |
| **Boucle de retention** | Chaque feature doit s'inscrire dans le cycle : Creer → Distribuer → Engager → Notifier → Ramener |
| **L'acheteur est un membre** | Chaque acheteur doit devenir un participant actif du reseau, pas juste un consommateur passif |
| **Deux fronts, une vision** | Web Next.js + App Expo (iOS/Android). Le web est la base, l'app mobile apporte l'experience native (push fiables, store presence, UX fluide). Les composants partages via `packages/` minimisent la duplication. |
| **Trois flux de revenus minimum** | Commission ventes (10%) + Abonnements artistes + Print-on-demand |
| **Communaute > Curation manuelle** | Le contenu monte par l'engagement, pas par un admin qui remplit des slots a la main |

---

## PHASE 12 — RENFORCEMENT MOBILE : PWA WEB + APP EXPO (Semaines 23-26)

> **Pourquoi** : Bozzart doit etre present partout — sur le web via une PWA performante ET sur les stores iOS/Android via l'app Expo. Le web capte le trafic SEO et les visiteurs occasionnels. L'app native offre l'experience premium (push fiables, UX fluide, presence store). Les deux partagent le meme backend Supabase et les packages communs dans `packages/`.

### 12.1 — Configuration PWA (Web)

- [x] Installer `next-pwa` (ou `@serwist/next`) dans `apps/web`
- [x] Creer le fichier `manifest.json` :
  - `name` : "Bozzart"
  - `short_name` : "Bozzart"
  - `start_url` : "/"
  - `display` : "standalone"
  - `background_color` : "#000000"
  - `theme_color` : "#000000"
  - `icons` : 192x192, 512x512 (PNG + maskable)
  - `screenshots` : 2 screenshots pour l'install prompt mobile
- [x] Configurer le Service Worker :
  - Cache statique : pages HTML, CSS, JS bundles
  - Cache dynamique : images artworks (stale-while-revalidate)
  - Offline fallback : page "Vous etes hors connexion"
- [x] Ajouter le meta tag `<link rel="manifest" href="/manifest.json">` dans le root layout
- [x] Tester l'installation sur iOS Safari et Android Chrome

### 12.2 — Notifications Push Multi-Plateforme

- [x] **Web** : Implementer le Web Push API avec VAPID keys
- [x] **Web** : Creer un Service Worker handler pour les push events
- [x] **Mobile** : Maintenir et ameliorer les Expo Push Notifications existantes
- [x] Unifier la logique `send-push-notification` pour supporter les deux canaux :
  - Web Push (VAPID) pour les utilisateurs web/PWA
  - Expo Push pour les utilisateurs iOS/Android
- [x] Table `push_tokens` : ajouter un champ `platform` (web, ios, android) pour distinguer les tokens
- [x] Un utilisateur peut avoir plusieurs tokens (web + mobile) — envoyer sur tous les canaux actifs
- [x] **Web** : Prompt d'autorisation push apres la 3eme visite (pas au premier chargement)
- [x] Payload unifie : titre, body, icon (avatar artiste), URL/deep link de redirection, badge count

### 12.3 — Experience Mobile-First (Web)

- [ ] Bottom navigation bar (web mobile) : Decouvrir, Feed, Messages, Profil — sticky, 4 icones, badge notifications
- [ ] Pull-to-refresh natif sur le feed (CSS `overscroll-behavior`)
- [ ] Transitions de page fluides (`next/navigation` + CSS transitions)
- [ ] Gestes tactiles sur le feed Discover (swipe up/down natif via scroll-snap)
- [ ] Install banner custom : "Ajouter Bozzart a l'ecran d'accueil" avec explication
- [ ] Splash screen via `manifest.json` (background noir + logo Bozzart)

### 12.4 — Mise a Niveau App Expo (iOS/Android)

- [ ] Aligner l'app Expo avec les features V1 manquantes (si ecart existe)
- [ ] Implementer la bottom navigation identique au web : Decouvrir, Feed, Messages, Profil
- [ ] Configurer le deep linking universel :
  - iOS : Universal Links (apple-app-site-association)
  - Android : App Links (assetlinks.json)
  - Mapping : URLs web ↔ screens Expo (meme structure de routes)
- [ ] Splash screen et icone App Store / Play Store mis a jour avec le branding V2
- [ ] Configurer les builds EAS (Expo Application Services) :
  - Profil `preview` pour le TestFlight / testing interne
  - Profil `production` pour les soumissions store
- [ ] Preparer les fiches store :
  - App Store : screenshots, description, mots-cles, categorie "Art"
  - Play Store : screenshots, description courte/longue, graphic assets
- [ ] Premiere soumission sur les deux stores

### 12.5 — Packages Partages (Strategie DRY)

- [x] Identifier les modules partageables entre web et mobile :
  - `packages/shared` : types TypeScript, constantes, validations (Zod schemas)
  - `packages/api` : client Supabase, hooks de requetes, logique metier
- [x] Extraire la logique commune existante dans ces packages
- [x] Configurer les imports dans `apps/web` et `apps/mobile` via le workspace pnpm
- [x] Convention : toute nouvelle feature doit d'abord implementer la logique dans `packages/`, puis l'UI dans chaque app

---

## PHASE 13 — LE CARNET COMME FEED PRINCIPAL (Semaines 24-26)

> **Pourquoi** : Instagram a reussi parce que les photos etaient premieres. Chez Bozzart, les oeuvres sont premieres et le Carnet est secondaire. Le Carnet — les posts de process, les photos d'atelier, les reflexions — est ce qui cree la connexion emotionnelle. Les ventes suivent naturellement.

### 13.1 — Nouveau Feed Principal : `/feed`

- [x] Creer la page `/feed` — le feed social principal de Bozzart
- [x] Le feed affiche un melange de :
  - Posts Carnet des artistes suivis (priorite haute)
  - Nouvelles oeuvres publiees par les artistes suivis (priorite moyenne)
  - Posts Carnet populaires d'artistes non suivis (priorite basse, decouverte)
- [x] Chaque post affiche :
  - Avatar + nom artiste (cliquable → profil)
  - Media (photo, video, audio player)
  - Caption + body (truncated avec "Lire la suite")
  - Barre de reactions (Touche, J'en veux, Comment c'est fait, Partager)
  - Compteur commentaires (cliquable → expand)
  - Timestamp relatif ("il y a 2h", "hier")
  - Si le post est lie a une oeuvre : card oeuvre cliquable (image + titre, PAS de prix)
- [x] Infinite scroll (cursor-based pagination, 10 posts par batch)
- [x] Pull-to-refresh (web mobile PWA + natif Expo)
- [x] Etat vide pour nouveaux utilisateurs : "Suivez des artistes pour remplir votre feed" + suggestions

### 13.2 — Restructuration de la Navigation

- [x] Navigation principale (header web / bottom bar mobile web + Expo) :
  - **Feed** (`/feed`) — le coeur du reseau social ← NOUVEAU defaut post-login
  - **Decouvrir** (`/discover`) — decouverte plein ecran (inchange)
  - **Artistes** (`/artists`) — annuaire (inchange)
  - **Messages** (`/dashboard/messages`) — messagerie
  - **Profil** (`/dashboard`) — dashboard personnel
- [x] Redirection post-login : tous les utilisateurs (artistes ET acheteurs) arrivent sur `/feed`
- [x] Le feed remplace la homepage pour les utilisateurs connectes
- [x] Homepage (`/`) reste la landing page pour les visiteurs non connectes

### 13.3 — Creation de Posts Enrichie

- [x] Bouton "Publier" flottant (FAB) accessible depuis le feed — raccourci vers `/dashboard/carnet/new`
- [x] Types de posts enrichis :
  - **Process** : photos avant/pendant/apres (carousel swipeable, max 10 images)
  - **Video** : player inline avec autoplay muted dans le feed
  - **Audio** : waveform player custom (pour les artistes musicaux ou les reflexions orales)
  - **Texte** : reflexions longues avec mise en forme TipTap
  - **Lien oeuvre** : associe le post a une oeuvre publiee (card preview automatique)
- [x] Carousel multi-images : composant `PostCarousel` avec dots indicator + swipe
- [x] Preview avant publication : "Voici ce que vos followers verront"
- [x] Brouillons de posts : sauvegarder en draft et finir plus tard

### 13.4 — Engagement sur les Posts

- [x] Commentaires inline : expand/collapse directement dans le feed (pas de navigation)
- [x] Reponses a un commentaire : thread simple (1 niveau max, pas de recursion)
- [x] Reaction avec animation : feedback visuel quand on clique (scale + couleur)
- [x] Compteurs en temps reel : Supabase Realtime sur `reactions` et `comments` (INSERT/DELETE)
- [x] Mention d'artiste dans les commentaires : `@artistSlug` detecte et lien vers le profil

### 13.5 — Feed Artiste sur le Profil Public

- [x] Le profil public `[artistSlug]` reorganise ses onglets :
  - **Carnet** (defaut) — feed chronologique des posts
  - **Oeuvres** — grille du catalogue
  - **Histoire** — biographie (stories visuelles, cf Phase 17)
- [x] Le Carnet devient l'onglet par defaut (etait "Oeuvres" avant)
- [x] Bouton "Voir toutes les oeuvres" en haut du Carnet pour ne pas cacher le catalogue

---

## PHASE 14 — FEED ALGORITHMIQUE (Semaines 26-28)

> **Pourquoi** : La curation manuelle via `discovery_slots` ne scale pas. Un seul admin (toi) remplit des creneaux a la main. Si tu es malade, la page Discover est vide. Un algorithme simple — meme sans ML — bat la curation manuelle.

### 14.1 — Score de Pertinence

- [x] Creer une vue materialisee `artwork_scores` dans PostgreSQL :
  ```sql
  CREATE MATERIALIZED VIEW artwork_scores AS
  SELECT
    a.id,
    a.artist_id,
    a.medium,
    a.price,
    a.created_at,
    ap.location_lat,
    ap.location_lng,
    -- Score de popularite (0-100)
    (
      COALESCE(a.wishlist_count, 0) * 3 +
      COALESCE(
        (SELECT COUNT(*) FROM reactions r
         JOIN carnet_posts cp ON cp.id = r.post_id
         WHERE cp.artwork_id = a.id), 0
      ) * 2 +
      COALESCE(a.view_count, 0) * 0.1
    ) AS popularity_score,
    -- Fraicheur (decay exponentiel sur 30 jours)
    EXP(-EXTRACT(EPOCH FROM (NOW() - a.created_at)) / (30 * 86400)) * 100 AS freshness_score,
    -- Score artiste (followers + oeuvres vendues)
    COALESCE(ap.follower_count, 0) * 2 + COALESCE(ap.artwork_sold_count, 0) * 5 AS artist_score
  FROM artworks a
  JOIN artist_profiles ap ON ap.user_id = a.artist_id
  WHERE a.status = 'published';
  ```
- [x] Creer un cron job Supabase (pg_cron) pour rafraichir la vue toutes les heures
- [x] Ajouter un index sur `(popularity_score + freshness_score + artist_score) DESC`

### 14.2 — Feed Personnalise par Utilisateur

- [ ] Creer une fonction RPC `get_personalized_feed(user_id, limit, offset)` :
  - **Facteur 1 — Follows** : boost x5 pour les artistes suivis
  - **Facteur 2 — Medium prefere** : analyser les wishlists et reactions de l'utilisateur → top 3 mediums → boost x3
  - **Facteur 3 — Fourchette de prix** : calculer le prix median des wishlists → boost les oeuvres dans un range ±50%
  - **Facteur 4 — Proximite geographique** : si l'utilisateur a une localisation → boost les artistes proches (rayon 200km) via l'index GiST existant
  - **Facteur 5 — Diversite** : ne pas montrer plus de 2 oeuvres du meme artiste dans un batch de 10
  - Score final = `popularity_score * 0.3 + freshness_score * 0.3 + artist_score * 0.1 + user_affinity * 0.3`
- [ ] Fallback pour les utilisateurs sans historique : utiliser uniquement `popularity_score + freshness_score`
- [ ] Fallback pour les visiteurs non connectes : idem

### 14.3 — Feed Carnet Personnalise

- [ ] Appliquer la meme logique au feed `/feed` :
  - Posts des artistes suivis (chronologique, priorite haute)
  - Posts populaires d'artistes non suivis qui matchent les preferences (decouverte)
  - Ratio : 70% follows, 30% decouverte
- [ ] Indicateur visuel : "Parce que vous suivez [artiste]" ou "Populaire en ce moment"

### 14.4 — Discover Repense

- [ ] La page `/discover` utilise `artwork_scores` au lieu de `discovery_slots` :
  - Score eleve + fraicheur = apparait en decouverte
  - Les `discovery_slots` deviennent un **boost editorial** (+50 au score) plutot que la source unique
  - L'admin peut toujours "pinner" une oeuvre en decouverte via le dashboard admin
- [ ] Bouton "Pas interesse" sur chaque oeuvre en decouverte → feedback negatif pour l'algo (table `feed_signals`)
- [ ] Table `feed_signals` :
  ```sql
  CREATE TABLE feed_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    signal_type TEXT CHECK (signal_type IN ('skip', 'not_interested', 'long_view', 'save')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] RLS : lecture/ecriture par proprietaire uniquement

### 14.5 — Suppression du Prix dans la Decouverte

- [ ] Page `/discover` : retirer l'affichage du prix sur les cartes
- [ ] Afficher uniquement : image plein ecran, nom artiste, titre oeuvre, medium
- [ ] Le prix n'apparait que sur la page detail de l'oeuvre (`[artistSlug]/artwork/[artworkSlug]`)
- [ ] Bouton "Decouvrir cette oeuvre" au lieu de "Acheter" dans le feed Discover
- [ ] L'objectif : l'utilisateur clique par curiosite/emotion, pas par prix

---

## PHASE 15 — GRAPH SOCIAL ETENDU (Semaines 28-30)

> **Pourquoi** : Le graph social actuel est simpliste : un acheteur suit un artiste, c'est tout. Un vrai reseau social a des connexions multi-directionnelles. Les acheteurs suivent des acheteurs, les collections sont visibles, le reseau se densite.

### 15.1 — Acheteur suit Acheteur

- [x] Modifier la table `follows` : retirer la contrainte qui lie `following_id` uniquement aux artistes
  ```sql
  -- follows existant : follower_id → following_id
  -- Actuellement, following_id est implicitement un artiste
  -- Nouveau : following_id peut etre n'importe quel user (artiste ou acheteur)
  ```
- [x] Adapter les RLS : un utilisateur peut suivre n'importe quel autre utilisateur
- [x] UI : bouton "Suivre" sur les profils acheteurs (page collection publique)
- [x] Feed `/feed` : inclure l'activite des acheteurs suivis (achats, wishlists, reactions)

### 15.2 — Collections Publiques d'Acheteurs

- [x] Ajouter un champ `is_collection_public` (boolean, default false) dans `profiles`
- [x] Page publique de collection : `/collector/[username]`
  - Grille des oeuvres acquises (image + titre + artiste)
  - Nombre d'oeuvres, nombre de followers
  - Bouton "Suivre ce collectionneur"
  - Bio courte du collectionneur (opt-in)
- [x] Toggle dans les settings : "Rendre ma collection publique"
- [x] Sur la page oeuvre : "X collectionneurs possedent une oeuvre de cet artiste" (social proof)
- [x] SEO : page indexable si publique

### 15.3 — Profil Unifie (Artiste + Acheteur)

- [x] Un artiste peut aussi etre acheteur (et collectionneur)
- [x] Profil public unifie :
  - Artiste : onglets Carnet / Oeuvres / Collection / Histoire
  - Acheteur/Collectionneur : onglets Collection / Artistes suivis
- [x] Un acheteur qui publie des posts dans le Carnet ? Non — le Carnet reste reserve aux artistes. Les acheteurs participent via commentaires, reactions, et partages.

### 15.4 — Suggestions de Connexions

- [x] Encart "Artistes a decouvrir" dans le feed :
  - Artistes suivis par les gens que vous suivez (graph 2nd degree)
  - Artistes du meme medium que vos wishlists
  - Artistes proches geographiquement
- [x] Encart "Collectionneurs avec des gouts similaires" :
  - Acheteurs qui ont wishliste les memes oeuvres que vous
- [x] Afficher 3 suggestions max, refresh a chaque visite
- [x] Bouton "Suivre" inline dans les suggestions

### 15.5 — Schema BDD Social

- [x] Nouvelle migration SQL :
  ```sql
  -- Collections publiques
  ALTER TABLE profiles ADD COLUMN is_collection_public BOOLEAN DEFAULT false;
  ALTER TABLE profiles ADD COLUMN collector_bio TEXT;
  ALTER TABLE profiles ADD COLUMN follower_count INTEGER DEFAULT 0;

  -- Trigger pour compter les followers d'un acheteur
  -- (le trigger existant ne compte que pour artist_profiles)
  CREATE OR REPLACE FUNCTION update_profile_follower_count()
  RETURNS TRIGGER AS $$ ...

  -- Signaux de feed
  CREATE TABLE feed_signals ( ... );

  -- Index
  CREATE INDEX idx_follows_following ON follows(following_id);
  CREATE INDEX idx_feed_signals_user ON feed_signals(user_id, created_at DESC);
  ```

---

## PHASE 16 — ACTIVITY FEED & SOCIAL PROOF (Semaines 30-32)

> **Pourquoi** : "Marie vient d'acheter une oeuvre de Lucas" est plus convaincant que n'importe quelle pub. Le social proof transforme les visiteurs passifs en acheteurs actifs.

### 16.1 — Table d'Activite Sociale

- [x] Creer la table `social_activities` :
  ```sql
  CREATE TABLE social_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
      'purchased_artwork',
      'followed_artist',
      'followed_collector',
      'reacted_to_post',
      'commented_on_post',
      'shared_artwork',
      'published_artwork',
      'published_post',
      'started_drop',
      'added_to_wishlist'
    )),
    target_id UUID, -- artwork_id, post_id, user_id selon le type
    target_type TEXT CHECK (target_type IN ('artwork', 'post', 'user', 'drop')),
    metadata JSONB DEFAULT '{}', -- donnees supplementaires (titre oeuvre, nom artiste, etc.)
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_social_activities_user ON social_activities(user_id, created_at DESC);
  CREATE INDEX idx_social_activities_type ON social_activities(activity_type, created_at DESC);
  ```
- [x] RLS : lecture publique sur `is_public = true`, ecriture via triggers uniquement (service_role)
- [x] Triggers pour alimenter automatiquement :
  - INSERT sur `transactions` (status = completed) → `purchased_artwork`
  - INSERT sur `follows` → `followed_artist` ou `followed_collector`
  - INSERT sur `reactions` → `reacted_to_post`
  - INSERT sur `artworks` (status = published) → `published_artwork`
  - INSERT sur `carnet_posts` → `published_post`
  - INSERT sur `wishlists` → `added_to_wishlist`

### 16.2 — Activity Feed dans le Feed Principal

- [x] Intercaler les activites sociales dans `/feed` (entre les posts Carnet) :
  - "[Avatar] **Marie** a achete ***Coucher de soleil*** de **Lucas**" — card avec miniature oeuvre
  - "[Avatar] **3 personnes que vous suivez** ont reagi au dernier post de **Sophie**" — groupement
  - "[Avatar] **Pierre** suit maintenant **Amelie**" — simple ligne
- [x] Ratio dans le feed : 60% posts Carnet, 25% activites sociales, 15% suggestions
- [x] Les achats ne sont visibles que si l'acheteur a une collection publique (`is_collection_public = true`)
- [x] Groupement intelligent : "Marie et 4 autres ont reagi" au lieu de 5 lignes separees

### 16.3 — Social Proof sur les Pages Cles

- [x] Page oeuvre (`[artistSlug]/artwork/[artworkSlug]`) :
  - "X personnes ont cette oeuvre en wishlist"
  - "Derniere vente de cet artiste : il y a X jours"
  - "Y personnes suivent cet artiste"
  - Avatars des premiers collectionneurs (si collection publique)
- [x] Page artiste (`[artistSlug]`) :
  - "X oeuvres vendues" (si l'artiste n'est pas en mode Silence)
  - "Suivi par [noms de collectionneurs connus]"
  - "Actif il y a X heures" (derniere publication)
- [x] Page Discover :
  - Micro-badge "Populaire" si une oeuvre a un score eleve
  - Micro-badge "Nouveau" si publiee il y a moins de 48h

### 16.4 — Partage Social (Repost)

- [x] La reaction "Partager" cree un **repost** dans le feed du partageur :
  - L'oeuvre/post original apparait dans le feed des followers du partageur
  - Attribution : "Partage par [nom]" avec lien vers le partageur
  - Le partage est une entree dans `social_activities` (type `shared_artwork`)
- [x] Partage externe : bouton copier le lien + share API native (Expo `expo-sharing` + web `navigator.share()`)
- [x] Compteur de partages visible sur le post original

---

## PHASE 17 — STORIES VISUELLES (Semaines 32-34)

> **Pourquoi** : L'histoire d'une oeuvre est actuellement un bloc HTML dans un champ `story_html`. Personne ne lit un pave de texte sur une fiche produit. Les Stories — des slides visuels — sont le format natif pour raconter une histoire sur mobile.

### 17.1 — Format Story

- [x] Creer la table `artwork_stories` :
  ```sql
  CREATE TABLE artwork_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    slides JSONB NOT NULL DEFAULT '[]',
    -- Chaque slide : { type: 'image'|'text'|'video', content: '...', caption: '...', bg_color: '...' }
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [x] RLS : lecture publique si published, CRUD proprietaire
- [x] Un artwork peut avoir 0 ou 1 story (one-to-one)

### 17.2 — Editeur de Stories (Dashboard)

- [x] Page `/dashboard/artworks/[id]/story` — editeur visuel de slides
- [x] Types de slides :
  - **Image + Caption** : photo de process avec texte overlay ("Pourquoi j'ai peint ca")
  - **Texte plein** : fond colore + texte centre (reflexion, citation)
  - **Video** : clip court (30s max) — l'artiste raconte
  - **Avant/Apres** : slider comparatif (deux images superposees)
  - **Palette** : les couleurs utilisees (extraction automatique ou manuelle)
- [x] Drag & drop pour reordonner les slides
- [x] Preview mobile (viewport 375px) dans l'editeur
- [x] Max 12 slides par story
- [x] Upload images directement dans le slide (Supabase Storage, bucket `stories`)

### 17.3 — Lecteur de Stories

- [x] Composant `StoryViewer` — plein ecran, tap pour avancer, swipe pour quitter
- [x] Barre de progression en haut (segments par slide, comme Instagram Stories)
- [x] Auto-advance sur les slides texte (5 secondes), pause sur les slides video
- [x] Tap gauche = slide precedent, tap droit = slide suivant
- [x] Swipe down = fermer
- [x] Sur la page oeuvre : bouton "Voir l'histoire" → ouvre le StoryViewer
- [x] Dans le feed : si un post est lie a une oeuvre qui a une story → indicateur visuel (cercle colore autour de l'image)

### 17.4 — Stories sur le Profil Artiste

- [x] Onglet "Histoire" du profil artiste : les chapitres existants (StoryChapters) + les stories des oeuvres
- [x] Timeline visuelle : chaque oeuvre qui a une story est un point sur la timeline
- [x] Click sur un point → ouvre le StoryViewer de cette oeuvre
- [x] L'histoire de l'artiste (bio longue) reste accessible mais n'est plus le format principal

---

## PHASE 18 — SYSTEME D'ABONNEMENT ARTISTE (Semaines 34-36)

> **Pourquoi** : Un seul flux de revenus (commission 10%), c'est fragile. Les abonnements creent un revenu recurrent ET augmentent la retention. L'artiste avec des abonnes payants a une raison de publier regulierement.

### 18.1 — Schema BDD Abonnements

- [x] Creer les tables :
  ```sql
  -- Plans d'abonnement par artiste
  CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Atelier", "Coulisses", etc.
    description TEXT,
    price_monthly INTEGER NOT NULL, -- en centimes (ex: 500 = 5 EUR)
    currency TEXT DEFAULT 'eur',
    benefits JSONB DEFAULT '[]', -- ["Posts exclusifs", "Avant-premieres", "Q&A mensuel"]
    is_active BOOLEAN DEFAULT true,
    max_subscribers INTEGER, -- null = illimite
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Abonnements actifs
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subscriber_id, plan_id)
  );

  CREATE INDEX idx_subscriptions_artist ON subscriptions(artist_id, status);
  CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id, status);
  ```
- [x] RLS : plans visibles publiquement, abonnements visibles par artiste + subscriber
- [x] Ajouter un champ `access_level` dans `carnet_posts` :
  ```sql
  ALTER TABLE carnet_posts ADD COLUMN access_level TEXT
    DEFAULT 'public'
    CHECK (access_level IN ('public', 'followers', 'subscribers'));
  ```

### 18.2 — Integration Stripe Subscriptions

- [x] API route `POST /api/stripe/create-subscription` :
  - Cree un Stripe Subscription avec `application_fee_percent: 15` (la plateforme prend 15% sur les abonnements)
  - Le paiement va sur le compte Connect de l'artiste
  - Retourne le `client_secret` pour confirmer cote client
- [x] API route `POST /api/stripe/cancel-subscription` :
  - Annule a la fin de la periode en cours (pas immediat)
- [x] Webhook Stripe : gerer `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [x] Maj automatique du `status` dans la table `subscriptions`

### 18.3 — Dashboard Artiste — Gestion Abonnements

- [x] Page `/dashboard/subscriptions` — gerer les plans :
  - Creer/modifier un plan (nom, prix, description, avantages)
  - Voir le nombre d'abonnes actifs + revenus mensuels
  - Graphique evolution abonnes sur 30/90 jours
- [x] Max 3 plans par artiste (simplicite)
- [x] Minimum 3 EUR/mois, maximum 50 EUR/mois

### 18.4 — Experience Abonne

- [x] Page profil artiste : encart "Soutenir [artiste]" avec les plans disponibles
  - Card par plan : prix, avantages, bouton "S'abonner"
  - Nombre d'abonnes visible ("Rejoint par X personnes")
- [x] Posts exclusifs dans le feed : cadenas + blur + "Reservé aux abonnés" avec CTA
- [x] Badge "Abonne" a cote du nom dans les commentaires (reconnaissance sociale)
- [x] Fil exclusif accessible depuis le profil artiste (onglet filtre)

### 18.5 — Publication de Contenu Exclusif

- [x] Dans le formulaire de creation de post (`/dashboard/carnet/new`) :
  - Selecteur d'acces : "Public" / "Followers uniquement" / "Abonnes uniquement"
  - Preview de qui pourra voir le post
- [x] Posts `followers` : visibles par les utilisateurs qui suivent l'artiste
- [x] Posts `subscribers` : visibles uniquement par les abonnes payants
- [x] Les reactions et commentaires restent visibles par tous (pour creer l'envie)

---

## PHASE 19 — COMMANDES PERSONNALISEES (Semaines 36-37)

> **Pourquoi** : Beaucoup d'acheteurs veulent une oeuvre sur mesure — un portrait, une piece aux couleurs de leur interieur, un format precis. La messagerie existe deja, il faut formaliser le processus.

### 19.1 — Systeme de Commandes

- [x] Creer la table `custom_orders` :
  ```sql
  CREATE TABLE custom_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    artist_id UUID NOT NULL REFERENCES profiles(id),
    conversation_id UUID REFERENCES conversations(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    -- Specifications
    medium TEXT,
    dimensions_width INTEGER,
    dimensions_height INTEGER,
    reference_images JSONB DEFAULT '[]', -- URLs des images de reference
    -- Prix et statut
    proposed_price INTEGER, -- en centimes, propose par l'artiste
    currency TEXT DEFAULT 'eur',
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
      'requested',    -- l'acheteur a soumis la demande
      'discussing',   -- l'artiste a repondu, negociation en cours
      'quoted',       -- l'artiste a propose un prix
      'accepted',     -- l'acheteur a accepte le prix
      'in_progress',  -- l'artiste travaille dessus
      'review',       -- l'artiste a envoye un apercu
      'completed',    -- l'acheteur a valide, paiement effectue
      'declined',     -- l'artiste a refuse
      'canceled'      -- l'acheteur a annule
    )),
    estimated_delivery DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [x] RLS : CRUD par buyer_id et artist_id participants

### 19.2 — Flow Acheteur

- [x] Bouton "Commander une oeuvre sur mesure" sur le profil artiste (si l'artiste accepte les commandes)
- [x] Formulaire de demande :
  - Description libre (ce que l'acheteur veut)
  - Medium souhaite (select depuis les mediums de l'artiste)
  - Dimensions souhaitees (optionnel)
  - Budget indicatif (fourchette)
  - Images de reference (upload, max 5)
- [x] Soumission → cree une conversation automatiquement + notification a l'artiste

### 19.3 — Flow Artiste

- [x] Page `/dashboard/commissions` — liste des commandes recues avec filtres par statut
- [x] Actions par commande :
  - **Repondre** → ouvre la conversation
  - **Proposer un prix** → formulaire avec montant + delai estime
  - **Refuser** → avec message optionnel
  - **Marquer en cours** → l'artiste commence le travail
  - **Envoyer un apercu** → upload image de l'oeuvre en cours (visible uniquement par l'acheteur)
  - **Terminer** → envoie un lien de paiement via la messagerie
- [x] Toggle dans les settings artiste : "J'accepte les commandes personnalisees" (default: false)

### 19.4 — Paiement Commande

- [x] Quand l'artiste marque la commande comme terminee :
  - Lien de paiement Stripe genere automatiquement (meme flow que les liens de paiement existants)
  - Envoi dans la conversation
  - Commission plateforme : 10% (identique aux ventes normales)
- [x] Apres paiement : l'oeuvre est ajoutee a la collection de l'acheteur + certificat genere

---

## PHASE 20 — PRINT-ON-DEMAND (Semaines 37-39)

> **Pourquoi** : Les champs `is_print_available` et `print_price` existent deja dans le schema `artworks` mais ne font rien. Le print-on-demand permet a un artiste de vendre des reproductions sans gerer la logistique. Marge plateforme : ~20-30%.

### 20.1 — Integration Service d'Impression

- [x] Choisir le provider : **Gelato** (API, couverture EU, qualite) ou **Printful**
- [x] Creer le compte provider + API keys
- [x] Table `print_products` :
  ```sql
  CREATE TABLE print_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'gelato', -- gelato, printful
    provider_product_id TEXT, -- ID chez le provider
    product_type TEXT NOT NULL CHECK (product_type IN (
      'fine_art_print', 'canvas', 'poster', 'framed_print', 'postcard'
    )),
    sizes JSONB NOT NULL, -- [{ "name": "A4", "width_cm": 21, "height_cm": 30, "cost_cents": 1500, "price_cents": 3500 }]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [x] RLS : lecture publique si active, CRUD par l'artiste proprietaire de l'oeuvre

### 20.2 — Configuration par l'Artiste

- [x] Dans le formulaire d'edition d'oeuvre (`/dashboard/artworks/[id]/edit`) :
  - Section "Reproductions" (sous le prix de l'original)
  - Toggle "Proposer des reproductions"
  - Upload de l'image HD pour l'impression (resolution min 300 DPI, Cloudflare R2)
  - Selection des formats disponibles (fine art, canvas, poster, etc.)
  - Prix de vente par format (suggestion automatique = cout provider x 2.5)
- [x] Verification qualite image : resolution minimum selon le format choisi
- [x] Preview du rendu : mockup genere via l'API du provider

### 20.3 — Experience Achat Print

- [x] Sur la page oeuvre : section "Reproductions disponibles" sous le bouton d'achat de l'original
  - Grille des formats avec prix
  - Mockup par format (image generee)
  - Bouton "Commander ce format"
- [x] Checkout print :
  - Adresse de livraison obligatoire
  - Calcul des frais de port via l'API provider
  - Delai de livraison estime
  - Recapitulatif : prix print + frais de port + total
- [x] Le paiement split :
  - Cout de production + livraison → paye au provider
  - Marge artiste → compte Connect de l'artiste
  - Commission plateforme : 20% de la marge artiste

### 20.4 — Suivi de Commande

- [x] Table `print_orders` :
  ```sql
  CREATE TABLE print_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id),
    artwork_id UUID NOT NULL REFERENCES artworks(id),
    print_product_id UUID NOT NULL REFERENCES print_products(id),
    size_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    -- Adresse
    shipping_name TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    -- Prix
    print_cost_cents INTEGER NOT NULL,
    shipping_cost_cents INTEGER NOT NULL,
    sale_price_cents INTEGER NOT NULL,
    -- Statut
    status TEXT DEFAULT 'pending' CHECK (status IN (
      'pending', 'paid', 'production', 'shipped', 'delivered', 'canceled'
    )),
    provider_order_id TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [x] Page `/dashboard/orders` (acheteur) — suivi des commandes print
- [x] Notifications : "Votre reproduction est en cours d'impression", "Votre colis a ete expedie"
- [x] Webhook provider → mise a jour du statut automatique

---

## PHASE 21 — VIRALITE & CROISSANCE ORGANIQUE (Semaines 39-41)

> **Pourquoi** : La plateforme est actuellement fermee. Rien n'incite au partage externe. La croissance organique est le seul moyen viable pour un auto-entrepreneur sans budget pub.

### 21.1 — Programme de Referral Artiste

- [x] Ajouter dans `artist_profiles` :
  ```sql
  ALTER TABLE artist_profiles ADD COLUMN referral_code TEXT UNIQUE;
  ALTER TABLE artist_profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
  ALTER TABLE artist_profiles ADD COLUMN referral_count INTEGER DEFAULT 0;
  ```
- [x] Generation automatique du code referral a la creation du profil artiste (format : `BOZZ-XXXX`)
- [x] Page `/join/[referralCode]` — landing page personnalisee :
  - "Rejoint Bozzart sur l'invitation de [Artiste]"
  - Avatar + nom de l'artiste referent
  - Bouton "Creer mon profil artiste"
- [x] Avantages referral :
  - Le referent passe a **8% de commission** pendant 6 mois (au lieu de 10%)
  - Le nouveau passe a **8% de commission** pendant 3 mois
  - Le referent recoit un badge "Ambassadeur" apres 5 referrals
- [x] Dashboard referral dans les settings artiste : code, lien, nombre de referrals, statut des avantages

### 21.2 — Widget Embeddable

- [x] API route `GET /api/embed/[artistSlug]` — retourne un script JS + iframe
- [x] Le widget affiche :
  - 3 dernieres oeuvres de l'artiste en grille
  - Lien "Voir sur Bozzart"
  - Style minimaliste, customisable (theme clair/sombre)
- [x] Page `/dashboard/settings/embed` — generateur de code embed :
  - Copier le code HTML/JS
  - Preview du widget
  - Choix du theme et du nombre d'oeuvres
- [x] L'artiste colle le widget sur son site perso → flux de visiteurs entrant permanent

### 21.3 — SEO Social (Open Graph Avance)

- [x] OG images dynamiques sur TOUTES les pages publiques :
  - `/[artistSlug]` → image avec avatar, nom, compteur followers, derniere oeuvre
  - `/[artistSlug]/artwork/[artworkSlug]` → image de l'oeuvre + titre + artiste (deja partiellement fait)
  - `/drops` → image du drop actif avec countdown
  - `/collector/[username]` → image avec 4 oeuvres en grille + nom du collectionneur
- [x] Twitter Card meta tags (`twitter:card`, `twitter:image`, `twitter:title`)
- [x] Schema.org JSON-LD enrichi :
  - `ArtGallery` sur les profils artistes
  - `VisualArtwork` sur les pages oeuvres (complement du `Product` existant)
  - `CollectionPage` sur les collections publiques

### 21.4 — Partage Natif Ameliore

- [x] Bouton partage sur chaque oeuvre et chaque post :
  - Mobile web : `navigator.share()` API (partage natif OS)
  - App Expo : `expo-sharing` (partage natif iOS/Android)
  - Desktop : dropdown avec copier lien, Twitter/X, Facebook, email
- [x] Lien partage court : `/a/[shortId]` pour les oeuvres, `/p/[shortId]` pour les posts
  - Table `short_links` avec redirect 301 vers l'URL complete
  - Analytics : compteur de clics par lien
- [x] Quand un lien Bozzart est colle dans un chat/reseau social : belle preview OG automatique

### 21.5 — Landing Pages Thematiques

- [x] Pages SEO generees dynamiquement :
  - `/art/peinture` — toutes les oeuvres du medium "peinture"
  - `/art/sculpture` — medium "sculpture"
  - `/art/photographie`, `/art/ceramique`, etc.
  - `/art/moins-de-500-euros` — oeuvres abordables
  - `/art/[ville]` — artistes par ville (utilise l'index GiST)
- [x] Chaque page a un H1 SEO, une meta description unique, et une grille d'oeuvres filtrees
- [x] Sitemap dynamique mis a jour pour inclure ces pages
- [x] Objectif : capter le trafic de recherche "acheter art en ligne", "artiste peintre [ville]"

---

## PHASE 22 — NOTIFICATIONS INTELLIGENTES & RETENTION (Semaines 41-43)

> **Pourquoi** : Les notifications actuelles sont transactionnelles (vente, message, nouveau follower). Il manque les notifications qui RAMENENT l'utilisateur sur la plateforme.

### 22.1 — Nouvelles Categories de Notifications

- [ ] Ajouter dans l'enum `notification_type` :
  ```sql
  ALTER TYPE notification_type ADD VALUE 'new_artwork';       -- un artiste suivi publie une oeuvre
  ALTER TYPE notification_type ADD VALUE 'wishlist_drop';      -- une oeuvre en wishlist est dans un drop
  ALTER TYPE notification_type ADD VALUE 'wishlist_popular';   -- X personnes ont aussi wishliste cette oeuvre
  ALTER TYPE notification_type ADD VALUE 'price_change';       -- une oeuvre en wishlist a change de prix
  ALTER TYPE notification_type ADD VALUE 'artist_live';        -- un artiste suivi est en live (Phase 23)
  ALTER TYPE notification_type ADD VALUE 'weekly_digest';      -- resume hebdomadaire
  ALTER TYPE notification_type ADD VALUE 'subscription_post';  -- un artiste auquel on est abonne a publie
  ALTER TYPE notification_type ADD VALUE 'collection_reaction'; -- quelqu'un a reagi a une oeuvre de votre collection
  ```

### 22.2 — Triggers de Notifications

- [ ] Trigger `notify_new_artwork` :
  - Quand un artiste publie une oeuvre (INSERT artworks status=published)
  - Notifie tous ses followers
  - Regroupement : si l'artiste publie 5 oeuvres en 1h → une seule notif "[Artiste] a publie 5 nouvelles oeuvres"
- [ ] Trigger `notify_wishlist_popular` :
  - Quand une oeuvre atteint 10, 25, 50, 100 wishlists
  - Notifie tous les utilisateurs qui l'ont en wishlist
  - "L'oeuvre [titre] est populaire ! 50 personnes l'ont en wishlist"
- [ ] Trigger `notify_price_change` :
  - Quand le prix d'une oeuvre change (UPDATE artworks price)
  - Notifie les utilisateurs qui l'ont en wishlist
  - "Le prix de [titre] a baisse : XXX EUR → YYY EUR"
- [ ] Edge Function `send-weekly-digest` (cron hebdomadaire) :
  - Resume : nouveaux posts des artistes suivis, oeuvres populaires, nombre de reactions recues
  - Envoye par email (Resend) ET notification push
  - Lien "Voir votre semaine sur Bozzart"

### 22.3 — Preferences de Notifications

- [ ] Page `/dashboard/settings/notifications` :
  - Toggle par categorie : ventes, messages, social, marketing, digest
  - Choix du canal : push, email, les deux, aucun
  - Frequence du digest : hebdomadaire, bimensuel, desactive
- [ ] Table `notification_preferences` :
  ```sql
  CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    sale_push BOOLEAN DEFAULT true,
    sale_email BOOLEAN DEFAULT true,
    message_push BOOLEAN DEFAULT true,
    message_email BOOLEAN DEFAULT false,
    social_push BOOLEAN DEFAULT true,
    social_email BOOLEAN DEFAULT false,
    marketing_push BOOLEAN DEFAULT true,
    marketing_email BOOLEAN DEFAULT true,
    digest_frequency TEXT DEFAULT 'weekly' CHECK (digest_frequency IN ('weekly', 'biweekly', 'none')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

### 22.4 — Re-engagement Automatique

- [ ] Utilisateur inactif depuis 7 jours :
  - Push : "Vos artistes ont publie X posts cette semaine"
  - Email : resume + bouton "Decouvrir"
- [ ] Utilisateur inactif depuis 30 jours :
  - Email : "Quoi de neuf chez vos artistes favoris ?" avec les 3 posts les plus populaires
- [ ] Acheteur avec wishlist > 5 items inactif depuis 14 jours :
  - Push : "X oeuvres dans votre wishlist — l'une d'elles pourrait partir bientot"
- [ ] Logique implementee dans une Edge Function cron (daily check)
- [ ] Respect strict du RGPD : desabonnement en un clic, lien dans chaque email

---

## PHASE 23 — LIVE STREAMING ATELIER (Semaines 43-46)

> **Pourquoi** : "L'artiste est en train de peindre EN CE MOMENT" est le contenu le plus engageant possible. Le live cree l'urgence, la connexion intime, et peut driver des ventes impulsives.

### 23.1 — Integration Video Live

- [ ] Choisir le provider : **Mux** (API simple, pricing a l'usage) ou **LiveKit** (open source, self-hostable)
- [ ] Table `live_streams` :
  ```sql
  CREATE TABLE live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
      'scheduled', 'live', 'ended', 'canceled'
    )),
    -- Provider
    provider_stream_id TEXT,
    stream_key TEXT, -- cle RTMP pour OBS/Streamyard
    playback_url TEXT,
    -- Metadata
    thumbnail_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    peak_viewer_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    -- Replay
    recording_url TEXT,
    is_replay_available BOOLEAN DEFAULT false,
    -- Oeuvre liee (optionnel)
    artwork_id UUID REFERENCES artworks(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_live_streams_status ON live_streams(status, started_at DESC);
  CREATE INDEX idx_live_streams_artist ON live_streams(artist_id, status);
  ```
- [ ] RLS : lecture publique pour les streams live/ended, CRUD pour l'artiste proprietaire

### 23.2 — Dashboard Artiste — Gestion Lives

- [ ] Page `/dashboard/live` — gestion des lives :
  - **Programmer un live** : titre, description, date/heure, oeuvre associee (optionnel)
  - **Demarrer un live** : affiche la cle de stream (RTMP) + lien OBS
  - **Live en cours** : preview du flux, compteur de viewers, chat modere
  - **Historique** : replays disponibles
- [ ] Option "Demarrer depuis le navigateur" (WebRTC via provider SDK) — pas besoin d'OBS
- [ ] Option de lier une oeuvre au live : "Je travaille sur cette oeuvre" → card oeuvre affichee pendant le stream

### 23.3 — Experience Viewer

- [ ] Composant `LivePlayer` — player video adaptatif (HLS via provider)
- [ ] Page `/live/[streamId]` — page dediee au live :
  - Player video plein ecran
  - Titre + artiste + oeuvre liee
  - Compteur de viewers en temps reel
  - Chat en temps reel (Supabase Realtime channel `live:[streamId]`)
  - Bouton "Suivre l'artiste" pendant le live
  - Bouton "Acheter cette oeuvre" si une oeuvre est liee
- [ ] Chat live :
  - Table `live_chat_messages` (ephemere, TTL 24h apres fin du stream)
  - Messages en temps reel via Supabase Realtime Broadcast
  - Reactions emoji rapides (coeur, feu, applaudissement) en overlay sur la video
  - Moderation : l'artiste peut masquer un message / bannir un viewer

### 23.4 — Decouverte des Lives

- [ ] Banniere "EN DIRECT" en haut du feed si un artiste suivi est en live
- [ ] Section "Lives en cours" dans la page Discover (priorite absolue, au-dessus du scroll vertical)
- [ ] Notification push instantanee quand un artiste suivi demarre un live :
  - "[Artiste] est en direct : [titre]"
  - Deep link vers `/live/[streamId]`
- [ ] Indicateur live sur l'avatar de l'artiste (cercle rouge pulsant) — sur le feed et la page artistes

### 23.5 — Replays

- [ ] A la fin du stream, le recording est sauvegarde automatiquement (provider → R2)
- [ ] L'artiste choisit de rendre le replay disponible ou non
- [ ] Les replays apparaissent dans le Carnet comme un post special (type `live_replay`)
- [ ] Le chat est sauvegarde et synchronise avec le replay (timestamps)
- [ ] Les replays exclusifs (abonnes uniquement) sont possibles via `access_level`

---

## PHASE 24 — DATA & INTELLIGENCE (Semaines 46-48)

> **Pourquoi** : Les donnees collectees ont une valeur enorme. Les tendances du marche, les preferences des acheteurs, les performances par medium — tout ca peut informer les artistes ET creer un avantage concurrentiel.

### 24.1 — Dashboard Analytics Enrichi (Artiste)

- [ ] Nouvelles metriques dans `/dashboard/analytics` :
  - **Taux de conversion** : vues oeuvre → checkout → achat
  - **Sources de trafic** : feed, discover, profil direct, lien externe, recherche
  - **Engagement par type de post** : quel type (photo, video, texte) genere le plus de reactions
  - **Heures d'activite** : quand vos followers sont en ligne (pour optimiser le timing de publication)
  - **Top oeuvres** : classement par vues, wishlists, conversations initiees
  - **Revenus abonnements** : MRR, churn rate, nouveaux vs renouvellements
- [ ] Graphiques interactifs (Recharts ameliore) :
  - Comparaison periodes (ce mois vs mois precedent)
  - Filtres par medium, par serie
- [ ] Export CSV des analytics (pour les artistes qui veulent analyser eux-memes)

### 24.2 — Tendances du Marche (Public)

- [ ] Page `/trends` — accessible a tous :
  - **Mediums populaires** : classement par nombre de ventes sur 30 jours
  - **Fourchettes de prix** : distribution des ventes par tranche (< 100 EUR, 100-500, 500-2000, > 2000)
  - **Artistes en vue** : top 10 par croissance de followers sur 30 jours
  - **Villes actives** : carte des concentrations d'artistes et d'acheteurs
- [ ] Donnees anonymisees (pas de montants individuels)
- [ ] Mise a jour quotidienne via une vue materialisee
- [ ] SEO : "tendances art contemporain" — page indexable

### 24.3 — Estimation de Valeur (Experimentale)

- [ ] Fonction RPC `estimate_artwork_value(medium, width, height, artist_follower_count, artist_sales_count)` :
  - Basee sur les transactions historiques
  - Retourne une fourchette (prix bas, prix median, prix haut)
  - Seuil minimum : 50 ventes dans le meme medium pour activer l'estimation
- [ ] Affichage discret sur la page de creation d'oeuvre :
  - "Les oeuvres similaires se vendent entre X et Y EUR"
  - Aide l'artiste a fixer un prix competitif
- [ ] PAS affiche aux acheteurs (pour ne pas influencer la perception de valeur)

### 24.4 — Insights Acheteur

- [ ] Page `/dashboard/insights` (acheteur) :
  - "Vos artistes favoris" : top 5 par interactions (reactions, commentaires, temps passe)
  - "Votre collection vaut" : estimation basee sur les prix actuels des artistes (si assez de data)
  - "Artistes que vous pourriez aimer" : recommandations basees sur les gouts
  - "Votre activite" : graphique de reactions, commentaires, achats sur 30 jours

---

## PHASE 25 — MONETISATION AVANCEE (Semaines 48-50)

> **Pourquoi** : Trois flux de revenus minimum pour etre une plateforme, pas un hobby.

### 25.1 — Recap des Flux de Revenus

| Flux | Commission plateforme | Phase |
|------|----------------------|-------|
| Vente d'oeuvres originales | 10% (8% fondateurs) | V1 |
| Abonnements artistes | 15% | Phase 18 |
| Print-on-demand | 20% de la marge | Phase 20 |
| Commandes personnalisees | 10% | Phase 19 |
| Boost de visibilite (futur) | Prix fixe / jour | Phase 25.2 |

### 25.2 — Boost de Visibilite (Payant, Optionnel)

- [ ] L'artiste peut "booster" une oeuvre dans le feed Discover :
  - +100 au score de pertinence pendant 24h, 72h, ou 7 jours
  - Prix : 5 EUR / 12 EUR / 25 EUR
  - Max 1 boost actif par artiste (pas de spam)
  - Indicateur discret : "Mis en avant" (transparence)
- [ ] Paiement via Stripe (pas de split Connect, c'est un paiement a la plateforme)
- [ ] Page `/dashboard/promote` — selectionner une oeuvre, choisir la duree, payer
- [ ] Le boost editoriel (admin) et le boost payant sont cumulables

### 25.3 — Dashboard Revenus Plateforme (Admin)

- [ ] Page `/admin/revenue` — vue d'ensemble des revenus :
  - Commissions ventes (montant, nombre)
  - Commissions abonnements (MRR, churn)
  - Revenus print-on-demand
  - Revenus boosts
  - Total et graphique mensuel
- [ ] Export CSV pour la comptabilite auto-entrepreneur
- [ ] Alerte quand le CA approche le seuil TVA (36 800 EUR) ou le plafond micro (77 700 EUR)

### 25.4 — Guest → Membre (Conversion Tunnel)

- [ ] Apres un achat en guest checkout :
  - Page success : "Creez votre compte gratuit pour :"
    - Retrouver votre certificat d'authenticite
    - Suivre l'artiste
    - Decouvrir d'autres oeuvres
    - Constituer votre galerie de collectionneur
  - Email post-achat (J+1) : "Votre certificat vous attend — creez votre galerie"
  - Email post-achat (J+7) : "Nouvel oeuvre de [artiste que vous avez achete]"
- [ ] Le certificat est genere mais le lien de consultation requiert un compte
- [ ] Objectif : convertir 60% des guest checkouts en comptes

---

## RESUME PAR SEMAINE

| Semaine | Phase | Focus |
|---------|-------|-------|
| 23-26 | Phase 12 | PWA web, app Expo iOS/Android, push multi-plateforme, packages partages, soumission stores |
| 24-26 | Phase 13 | Feed Carnet principal, nav restructuree, creation posts enrichie |
| 26-28 | Phase 14 | Feed algo, score de pertinence, discover repense, suppression prix |
| 28-30 | Phase 15 | Graph social etendu, collections publiques, suggestions |
| 30-32 | Phase 16 | Activity feed, social proof, repost |
| 32-34 | Phase 17 | Stories visuelles, editeur de slides, lecteur plein ecran |
| 34-36 | Phase 18 | Abonnements artistes, Stripe Subscriptions, contenu exclusif |
| 36-37 | Phase 19 | Commandes personnalisees, flow devis/paiement |
| 37-39 | Phase 20 | Print-on-demand, integration Gelato/Printful |
| 39-41 | Phase 21 | Viralite, referral, widget embed, SEO social, pages thematiques |
| 41-43 | Phase 22 | Notifications intelligentes, digest, re-engagement, preferences |
| 43-46 | Phase 23 | Live streaming, chat live, replays, decouverte lives |
| 46-48 | Phase 24 | Analytics enrichi, tendances marche, estimation valeur |
| 48-50 | Phase 25 | Monetisation avancee, boosts, conversion guest, dashboard revenus |

---

## DEPENDANCES CRITIQUES V2

```
Phase 12 (PWA + Expo) ──→ Phase 13 (le feed web + mobile est la fondation)
Phase 13 (feed principal) ──→ Phase 14 (algo sur le feed)
Phase 13 (feed principal) ──→ Phase 16 (activity feed intercale dans le feed)
Phase 14 (algo) ──→ Phase 21.2 (boost de visibilite s'appuie sur le score)
Phase 15 (graph social) ──→ Phase 16 (activity feed a besoin du graph etendu)
Phase 15 (collections publiques) ──→ Phase 21.3 (OG images collections)
Phase 17 (stories) ──→ independant, peut commencer en parallele
Phase 18 (abonnements) ──→ Phase 22 (notifications abonnement)
Phase 18 (abonnements) ──→ Phase 25 (revenus abonnements)
Phase 19 (commandes) ──→ necessite Phase 4 (messagerie) — deja fait
Phase 20 (print) ──→ independant, peut commencer des Phase 18
Phase 22 (notifications) ──→ necessite Phase 12 (push web)
Phase 23 (live) ──→ independant mais beneficie de Phase 22 (notifications live)
Phase 24 (data) ──→ necessite Phase 14 (donnees d'engagement collectees)
Phase 25 (monetisation) ──→ necessite Phase 18 + 20 (flux de revenus)
```

**Chemin critique** : Phase 12 → 13 → 14 → 16 → 22

**Parallelisable** : Phase 17 (stories) + Phase 19 (commandes) + Phase 20 (print) peuvent avancer en parallele des phases 14-16.

---

## RISQUES ET POINTS D'ATTENTION V2

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Maintenance dual codebase (web + Expo) | Temps de dev double sur certaines features UI | Maximiser la logique dans `packages/` partages, UI specifique minimale par plateforme. L'app Expo gere les push iOS nativement (pas de limite PWA). |
| Feed algo qui cree une bulle | Les nouveaux artistes ne sont jamais decouverts | Slot de diversite obligatoire (20% du feed = artistes avec < 100 followers) |
| Abonnements qui cannibalisent les ventes | Artistes postent tout en exclusif, feed public vide | Limiter les posts exclusifs a 50% max du contenu |
| Live streaming couteux | Facture Mux/LiveKit elevee sans revenus directs | Limiter a 2h/live, max 4 lives/mois par artiste en V1. Monetiser via tips |
| Print-on-demand qualite variable | Plainte acheteur, reputation plateforme | Commander des echantillons avant de valider un provider |
| Seuil TVA 36 800 EUR atteint | Obligation de collecter la TVA, complexite admin | Alerte dashboard a 80% du seuil, prevoir le passage SAS |
| RGPD et donnees d'engagement | Tracking percu comme intrusif | Transparence totale, consentement explicite, page `/privacy` a jour |
| Solo dev et 14 phases | Burnout, qualite qui baisse | Prioriser : Phase 12-14 d'abord (fondation reseau social), le reste est incrementiel |
| Guest checkout et RGPD | Stockage email sans consentement | Email de suivi uniquement si consentement explicite au checkout |

---

## METRIQUES DE SUCCES (KPIs)

| Metrique | Objectif 6 mois | Objectif 12 mois |
|----------|-----------------|------------------|
| **DAU (Daily Active Users)** | 500 | 5 000 |
| **Temps moyen par session** | 8 min | 15 min |
| **Taux de retention J7** | 30% | 45% |
| **Taux de retention J30** | 15% | 25% |
| **Posts Carnet / semaine** | 100 | 1 000 |
| **Reactions / jour** | 500 | 5 000 |
| **Taux de conversion visiteur → inscrit** | 5% | 10% |
| **Taux de conversion inscrit → premier achat** | 3% | 8% |
| **Nombre d'artistes actifs** | 100 | 1 000 |
| **Nombre d'abonnes payants** | 50 | 500 |
| **MRR abonnements** | 250 EUR | 2 500 EUR |
| **GMV (Gross Merchandise Volume)** | 10 000 EUR/mois | 50 000 EUR/mois |
| **Revenu plateforme mensuel** | 1 500 EUR | 10 000 EUR |

---

## MOT DE LA FIN

> Cette roadmap transforme Bozzart d'un "Etsy pour l'art" en un "Instagram qui vend de l'art".
>
> La priorite absolue est le **chemin critique** : PWA + Expo → Feed Social → Algorithme → Social Proof → Notifications.
>
> Tout le reste (stories, abonnements, print, live) est un accelerateur, pas une fondation.
>
> **Regle d'or** : si une feature n'ameliore pas la boucle Creer → Distribuer → Engager → Notifier → Ramener, elle n'a pas sa place dans la V2.
