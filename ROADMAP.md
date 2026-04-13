# ROADMAP — BOZZART V1 (bozzart.art)

Duree totale : 16 semaines | Equipe : 2-3 developpeurs

> **Derniere mise a jour** : 2026-03-31 — TOUTES FEATURES IMPLEMENTEES — BUILD OK — Phase 11 UX/UI : securite (XSS, CSP, redirect), error handling global (30+ fichiers), toast Sonner, pages 404/error, 6 loading skeletons, header/footer partages, sidebar responsive, labels a11y (10 pages), Typography plugin, SEO metadata (6 layouts), pages legales (CGV/RGPD/mentions), formatPrice, memory leaks fixes, pagination artistes+oeuvres, dashboard acheteur enrichi, messagerie nom artiste + bulles elargies

---

## PHASE 0 — FONDATIONS (Semaine 1)

### 0.1 — Monorepo & Tooling ✅
- [x] Initialiser le monorepo avec Turborepo + pnpm workspaces
- [x] Creer `apps/web` (Next.js 14 App Router) — build verifie OK
- [x] Creer `apps/mobile` (Expo SDK 51 + Expo Router)
- [x] Creer `apps/admin` (Next.js simple)
- [x] Creer `packages/core` (logique metier pure) — commission, slugs, validation prix, certificats
- [x] Creer `packages/api` (types TypeScript complets + client Supabase) — 12 fichiers de types
- [x] Creer `packages/ui` (composants partages web/mobile) — Button primitif
- [x] Creer `packages/config` (ESLint, TypeScript, Tailwind partages)
- [x] Configurer `tsconfig.json` avec `strict: true` dans tous les packages
- [x] Configurer ESLint + Prettier partages
- [x] Configurer Tailwind CSS pour le web
- [x] Configurer `turbo.json` (pipelines build, dev, lint, test)
- [x] Creer le `pnpm-workspace.yaml`

### 0.2 — CI/CD ✅ (partiellement — config locale, Vercel/EAS a connecter)
- [x] Pipeline GitHub Actions : lint + type-check + tests sur PR
- [ ] Deploiement web automatique sur Vercel (preview + production) — a connecter au repo
- [ ] Configurer EAS Build pour iOS et Android — a connecter au repo
- [ ] Configurer EAS Update pour les OTA updates — a connecter au repo

### 0.3 — Supabase ✅ (deploye)
- [x] Creer le projet Supabase + deployer les migrations
- [x] Ecrire toutes les migrations SQL (12 fichiers dans `supabase/migrations/`)
  - [x] Extensions (uuid-ossp, pg_trgm, unaccent) — `00001_extensions_and_enums.sql`
  - [x] Enums (10 types) — `00001_extensions_and_enums.sql`
  - [x] Table `profiles` + `artist_profiles` — `00002_profiles.sql`
  - [x] Table `artwork_series` + `artworks` (7 index) — `00003_artworks.sql`
  - [x] Tables `carnet_posts`, `reactions`, `comments`, `follows`, `wishlists` — `00004_carnet_and_social.sql`
  - [x] Tables `conversations`, `messages` — `00005_messaging.sql`
  - [x] Tables `transactions`, `buyer_collections`, `certificates` — `00006_transactions.sql`
  - [x] Tables `discovery_slots`, `drops`, `drop_artworks` — `00007_discovery_and_drops.sql`
  - [x] Tables `notifications`, `push_tokens`, `artist_analytics_daily` — `00008_notifications_and_analytics.sql`
- [x] Activer Row Level Security sur toutes les tables — `00009_rls_policies.sql`
- [x] Ecrire toutes les policies RLS (45+ policies sur 20 tables) — `00009_rls_policies.sql`
  - [x] profiles : lecture publique, CRUD proprietaire
  - [x] artist_profiles : lecture publique, CRUD proprietaire
  - [x] artworks : lecture published+sold+propres drafts, CRUD proprietaire
  - [x] artwork_series : lecture visible+propres, CRUD proprietaire
  - [x] carnet_posts : lecture publique, CRUD proprietaire
  - [x] reactions : lecture publique, CRUD proprietaire
  - [x] comments : lecture non-hidden, CRUD proprietaire
  - [x] follows : lecture publique, insert/delete proprietaire
  - [x] wishlists : lecture/insert/delete proprietaire
  - [x] conversations : lecture/update participants, insert acheteur
  - [x] messages : lecture/insert participants
  - [x] transactions : lecture participants (insert via service_role)
  - [x] notifications : lecture/update proprietaire
  - [x] artist_analytics_daily : lecture artiste concerne
  - [x] buyer_collections : lecture/update proprietaire
  - [x] discovery_slots : lecture publique active
  - [x] drops/drop_artworks : lecture publique active, CRUD proprietaire
  - [x] push_tokens : lecture/insert/delete proprietaire
  - [x] certificates : lecture participants
- [x] Creer les triggers — `00010_triggers.sql`
  - [x] `update_updated_at` (sur profiles, artist_profiles, artworks, carnet_posts, comments)
  - [x] `update_wishlist_count` (INSERT/DELETE sur wishlists)
  - [x] `update_follower_count` (INSERT/DELETE sur follows)
  - [x] `update_artwork_count` (INSERT/UPDATE/DELETE sur artworks, gere les changements de status)
  - [x] `update_reaction_counts` (INSERT/UPDATE/DELETE sur reactions, gere le changement de type)
  - [x] `update_comment_count` (INSERT/DELETE sur comments)
  - [x] `update_conversation_on_message` (INSERT sur messages)
  - [x] `handle_new_user` (trigger sur auth.users, cree le profil automatiquement)
- [x] Configurer les buckets Storage : avatars (5Mo), artworks (50Mo), posts (50Mo), certificates (10Mo, prive) — `00011_storage.sql`
- [x] Regles Storage : lecture publique, ecriture par dossier user_id — `00011_storage.sql`
- [x] Activer Supabase Realtime sur `messages` et `notifications` — `00012_realtime.sql`
- [x] Ecrire le `seed.sql` — 5 artistes, 3 acheteurs, 20 oeuvres, 2 series, 5 posts, follows, wishlists, conversations, messages, discovery slots

### 0.4 — Juridique & Facturation (Auto-Entreprise)
- [ ] Creer la micro-entreprise (auto-entrepreneur) si pas encore fait
- [ ] Obtenir le numero SIRET
- [ ] Ouvrir un compte bancaire dedie (obligatoire au-dessus de 10 000 EUR/an de CA)
- [ ] Choisir un outil de facturation compatible auto-entrepreneur (ex: Henrri, Freebe, Abby)
- [ ] Configurer la generation automatique de factures de commission
  - [ ] Une facture par vente : montant = 10% du prix de l'oeuvre
  - [ ] Mention obligatoire : "TVA non applicable, art. 293 B du CGI" (tant que sous le seuil de franchise)
  - [ ] Numero SIRET, nom, adresse sur chaque facture
- [ ] Definir qui absorbe les frais Stripe (recommande : deduits de la commission plateforme)
- [ ] Consulter un expert-comptable pour valider le setup Stripe Connect + auto-entrepreneur
- [ ] Mettre en place le suivi mensuel du CA (somme des commissions, pas du volume total)
- [ ] Configurer les declarations URSSAF (mensuelles ou trimestrielles)

### 0.5 — Stripe Connect ✅ (code ecrit, compte Stripe a creer manuellement)
- [ ] Creer le compte Stripe, activer Connect — a faire manuellement
- [x] Configurer le `application_fee_amount` a 10% sur chaque PaymentIntent — dans `api/stripe/create-payment-intent/route.ts`
- [x] Ecrire la Edge Function `stripe-webhook` — gere `payment_intent.succeeded`, `transfer.paid`, `payment_intent.payment_failed`, `account.updated`
- [x] API route `create-payment-intent` — cree la transaction, le PaymentIntent avec split auto
- [x] API route `create-connect-account` — cree le compte Connect Express + lien onboarding
- [x] API route `create-payment-link` — genere un payment link pour la messagerie
- [x] API route `webhook` (fallback Next.js) — gere `account.updated`
- [ ] Configurer les webhooks Stripe (URL + secret) — a faire manuellement
- [ ] Tester le flow complet en sandbox — apres creation du compte Stripe

### 0.6 — Cloudflare R2 ✅ (code ecrit, bucket R2 a creer manuellement)
- [ ] Creer le bucket R2 — a faire manuellement
- [ ] Configurer les CORS — a faire manuellement
- [ ] Configurer le domaine custom — a faire manuellement
- [x] Helper upload/delete dans `packages/api/src/supabase/storage.ts` — getAvatarPath, getArtworkImagePath, getPostMediaPath
- [x] Buckets Storage configures dans les migrations SQL (avatars, artworks, posts, certificates)

### 0.7 — Emails ✅ (code ecrit, compte Resend a creer manuellement)
- [ ] Creer le compte Resend — a faire manuellement
- [ ] Configurer le domaine d'envoi — a faire manuellement
- [x] Helper email dans `apps/web/lib/resend.ts` — sendEmail, sendWelcomeEmail, sendPurchaseConfirmationEmail
- [x] Email certificat integre dans la Edge Function `generate-certificate`
- [x] Edge Function `send-push-notification` — envoi via Expo Push API avec desactivation des tokens invalides

---

## PHASE 1 — AUTHENTIFICATION & PROFILS (Semaines 2-3) ✅

### 1.1 — Authentification Web ✅
- [x] Page `/login` — connexion magic link Supabase
- [x] Page `/signup` — inscription avec choix de role (artiste/acheteur), validation username
- [x] Page `/callback` — OAuth callback avec redirection
- [x] Middleware Next.js — protege `/dashboard/*` et `/admin/*`, redirection intelligente
- [x] Provider d'authentification global — AuthProvider avec user, profile, artistProfile, signOut
- [x] Gestion des sessions cote serveur — `supabase-ssr.ts` + `supabase-browser.ts`
- [x] Redirection intelligente post-login (artiste → dashboard, acheteur → discover)
- [x] QueryProvider (React Query) dans le root layout

### 1.2 — Authentification Mobile ✅
- [x] Ecrans login et signup dans `(auth)/` avec layout
- [x] Integration Supabase Auth avec Expo SecureStore — `lib/supabase.ts`
- [x] Refresh automatique du token (autoRefreshToken: true)
- [x] Deconnexion avec nettoyage du push token

### 1.3 — Profil Artiste ✅
- [x] Onboarding artiste en 3 etapes — `/dashboard/onboarding` (slug, identite, premiere oeuvre)
- [x] Page editeur de profil complet dans `/dashboard/settings` — nom, bio, localisation, site, Instagram, histoire
- [x] Upload images — composant ImageUpload (drag & drop, preview, validation) integre dans creation oeuvre
- [x] Editeur rich text TipTap — composant RichTextEditor (bold, italic, titres, listes, citations, liens)
- [x] Chapitres de l'Histoire — composant StoryChapters (affichage + CRUD editable, sauvegarde JSONB)
- [x] Champs : localisation (ville+pays), site web, Instagram

### 1.4 — Profil Public Artiste ✅
- [x] Page `/[artistSlug]` — profil public avec 3 zones (oeuvres, carnet, histoire)
- [x] Zone Oeuvre : grille des oeuvres publiees avec prix
- [x] Zone Carnet : fil des posts recents avec media
- [x] Zone Histoire : biographie longue HTML
- [x] Header : avatar, nom, localisation, compteur followers, bouton Suivre
- [x] SEO : meta tags dynamiques, Open Graph
- [x] Page oeuvre `/[artistSlug]/artwork/[artworkSlug]` — image HD, histoire, prix, tags, boutons acheter/contacter, autres oeuvres
- [x] Profil mobile — affichage profil, deconnexion avec nettoyage push token

### 1.5 — Profil Acheteur ✅
- [x] Page collection privee dans `/dashboard/collection` — galerie des oeuvres acquises
- [x] Lien vers le certificat d'authenticite
- [x] Note personnelle par oeuvre — composant NoteEditor inline (edit/save/cancel)
- [x] Dashboard layout adaptatif (nav artiste vs nav acheteur)
- [x] Page export donnees `/dashboard/settings/export` (Passeport Artiste)
- [x] Page Stripe Connect `/dashboard/settings/stripe` — onboarding + statut

---

## PHASE 2 — OEUVRES & CATALOGUE (Semaines 4-6) ✅

### 2.1 — CRUD Oeuvres ✅
- [x] Page `/dashboard/artworks` — liste avec filtres par statut, grille visuelle
- [x] Page `/dashboard/artworks/new` — formulaire complet (titre, histoire, medium, annee, dimensions, edition, prix, devise, tags, messagerie, brouillon/publier)
- [x] Page `/dashboard/artworks/[id]/edit` — edition complete avec changement de statut
- [x] Actions : publier, archiver, supprimer
- [x] Generation automatique du slug
- [x] Upload drag & drop — composant `ImageUpload` (drag & drop, preview, validation taille/format, upload Supabase Storage)
- [ ] Association a une serie — UI a implementer

### 2.2 — Series
- [x] CRUD des series — `/dashboard/artworks/series` (creer, modifier, supprimer)
- [x] Association oeuvres ↔ series — select serie dans le formulaire edit (charge les series de l'artiste)

### 2.3 — Page Oeuvre Publique ✅ (fait en Phase 1)
- [x] Deja implemente dans Phase 1.4

### 2.4 — Upload & Traitement d'Images
- [x] Helper upload dans `packages/api/src/supabase/storage.ts`
- [x] UI drag & drop — composant `ImageUpload` reutilisable (artworks, avatars, posts)
- [ ] Generation de vignettes — a implementer

### 2.5 — Checkout ✅
- [x] Page `/checkout/[artworkId]` — recap oeuvre, guest checkout (email+nom), bouton payer
- [x] Page `/checkout/success` — confirmation avec liens collection + decouverte
- [x] Integration API create-payment-intent (fait en Phase 0.5)
- [x] Integration Stripe Elements — checkout en 2 etapes (infos guest → PaymentElement), Apple Pay/Google Pay via Stripe

---

## PHASE 3 — CARNET / FIL SOCIAL (Semaines 6-7) ✅

### 3.1 — Creation de Posts ✅
- [x] Page `/dashboard/carnet` — liste des posts avec stats (reactions, commentaires)
- [x] Page `/dashboard/carnet/new` — creation (type, caption, body HTML, media URL, commentaires on/off)
- [x] Types supportes : photo, video, audio, texte, mixte
- [x] Lien vers une oeuvre — select oeuvres publiees dans le formulaire new post
- [ ] Mode Silence par post — a implementer

### 3.2 — Feed Carnet (Web) ✅ (fait en Phase 1)
- [x] Integre dans le profil public artiste (onglet Carnet)

### 3.3 — Feed Carnet (Mobile) ✅
- [x] Ecran feed — posts des artistes suivis, fallback posts recents si non connecte
- [x] Pull-to-refresh
- [x] Affichage conditionnel media + caption + stats
- [ ] FlashList (utilise FlatList), autoplay video, reactions bottom sheet — a affiner

### 3.4 — Interactions Sociales ✅
- [x] Follow/Unfollow sur le profil public (Phase 1)
- [x] Reactions nommees — composant `ReactionBar` (Touche, J'en veux, Comment, Partager) avec optimistic updates
- [x] Wishlist — composant `WishlistButton` (toggle, compteur, optimistic) + page `/dashboard/wishlist`
- [x] Commentaires — composant `CommentSection` (thread avec reponses, expand/collapse, ajout commentaire)
- [x] API fourchettes de prix — `/api/artworks/price-range` (min, max, median par artiste/medium)

---

## PHASE 4 — MESSAGERIE (Semaines 7-9) ✅

### 4.1 — Conversations ✅
- [x] Liste des conversations `/dashboard/messages` — tri par activite, badge non-lus, oeuvre contextuelle
- [x] Navigation artiste vs acheteur (adaptatif)
- [x] Creation auto depuis page oeuvre — composant `ContactArtistButton` (cree ou redirige vers conversation existante)
- [x] Archivage — bouton dans le header de conversation, update is_archived

### 4.2 — Messages Temps Reel ✅
- [x] Page conversation `/dashboard/messages/[conversationId]`
- [x] Envoi et reception de messages texte
- [x] Abonnement Supabase Realtime (postgres_changes INSERT)
- [x] Scroll automatique vers le dernier message
- [x] Marquage comme lu a l'ouverture
- [x] Oeuvre contextuelle en header avec prix
- [x] Indicateur de frappe — hook useTypingIndicator (Supabase Realtime Broadcast), composant TypingDots
- [x] Indicateur delivre/lu — composant ReadReceipt (sent/delivered/read avec icones)

### 4.3 — Liens de Paiement ✅
- [x] Bouton "Proposer cette oeuvre" pour l'artiste
- [x] Appel API create-payment-link (Stripe)
- [x] Affichage special des messages payment_link (montant, lien "Payer maintenant", badge "Paye")

### 4.4 — Messagerie Mobile ✅
- [x] Ecran liste conversations — badge non-lus, oeuvre thumbnail, navigation
- [x] Ecran conversation — messages realtime (Supabase Realtime), KeyboardAvoidingView, scroll auto, envoi
- [x] Profil mobile — affichage profil, avatar, role, deconnexion, login/signup si non connecte

### 4.5 — Filtres & Parametres
- [x] Filtre messagerie — toggle dans settings (tous/acheteurs uniquement)

---

## PHASE 5 — PAIEMENTS & TRANSACTIONS (Semaines 9-11) ✅

### 5.1 — Onboarding Stripe Connect ✅ (fait en Phase 0.5 + Phase 1)
- [x] Page `/dashboard/settings/stripe` + API route create-connect-account
- [x] Webhook account.updated pour maj statut

### 5.2 — Checkout Web ✅ (fait en Phase 2)
- [x] Page checkout + success

### 5.3 — Checkout Mobile
- [ ] A implementer

### 5.4 — Webhooks ✅ (fait en Phase 0.5)
- [x] Edge Function complete (4 events)

### 5.5 — Certificat ✅ (fait en Phase 0.5)
- [x] Edge Function generate-certificate + email Resend

### 5.6 — Dashboard Ventes
- [x] Dashboard ventes — /dashboard/sales (tableau complet : oeuvre, acheteur, montant, commission, net, statut virement, filtres)

---

## PHASE 6 — DECOUVERTE & CURATION (Semaines 11-13) ✅

### 6.1 — Page Decouverte (Web) ✅
- [x] Page `/discover` — plein ecran, image de fond, overlay gradient
- [x] Navigation clic gauche/droite + clavier (fleches, espace)
- [x] Boutons "Acheter" et "Voir l'oeuvre"
- [x] Indicateur de progression (barre)
- [x] Chargement depuis discovery_slots du jour, fallback sur oeuvres recentes
- [x] Scroll snap vertical — CSS snap-y snap-mandatory, sections plein ecran, next/image, TrackView, indicateur scroll

### 6.2 — Decouverte Mobile ✅
- [x] Ecran `(discover)/index` — FlatList pagingEnabled plein ecran
- [x] Image de fond, overlay, boutons Acheter/Voir
- [ ] Animations Reanimated, haptique — a implementer

### 6.3 — Curation Editoriale ✅
- [x] Dashboard admin `/admin/discovery` — grille 24 slots/jour avec selection par date
- [x] Preview des oeuvres par slot

### 6.4 — Navigation & Filtres ✅
- [x] Page `/artists` — liste avec recherche par nom et filtre par pays
- [x] Carte geographique Leaflet — import dynamique, markers avec popups, toggle grille/carte
- [x] Recherche textuelle — ilike sur full_name, index pg_trgm prets en BDD

### 6.5 — Drops ✅
- [x] Page `/dashboard/drops` — liste des drops de l'artiste avec statuts
- [x] Page publique `/drops` — drops actifs, a venir, termines, countdown

### 6.6 — Fourchettes de Prix
- [x] API Route price-range — `/api/artworks/price-range` (fait precedemment)

---

## PHASE 7 — NOTIFICATIONS & TEMPS REEL (Semaines 13-14) ✅

### 7.1 — Notifications In-App
- [x] Table `notifications` + types + RLS (Phase 0)
- [x] Notifications creees par le webhook Stripe (vente, payout)
- [x] Centre de notifications web — composant `NotificationCenter` (dropdown, badge non-lus, Supabase Realtime, marquer comme lu)
- [x] Centre de notifications mobile — composant NotificationCenterMobile (FlatList, realtime, marquer lu, deep links)

### 7.2 — Notifications Push (Mobile)
- [x] Edge Function `send-push-notification` (Phase 0.5)
- [x] Declencheurs dans stripe-webhook (vente, payout)
- [x] Hook `usePushNotifications` — enregistrement token, handler tap → deep link
- [x] Declencheurs notifications — 3 triggers SQL (notify_new_message, notify_new_follower, notify_new_post) dans migration 00014

### 7.3 — Temps Reel Global ✅
- [x] Supabase Realtime sur `messages` — active en BDD + utilise dans la messagerie
- [x] Supabase Realtime sur `notifications` — active en BDD
- [ ] Gestion reconnexion — a implementer

---

## PHASE 8 — ANALYTICS & DASHBOARD ARTISTE (Semaine 14) ✅

### 8.1 — Collecte de Donnees
- [x] Table `artist_analytics_daily` avec tous les champs (Phase 0)
- [x] Tracking des vues — Edge Function `track-view` (profile, artwork, discovery) avec upsert atomique
- [x] Fonction RPC `increment_analytics` — migration `00013_analytics_rpc.sql`
- [x] Tracking integre — composant TrackView + API /api/track sur pages profil et oeuvre

### 8.2 — Dashboard Analytics ✅
- [x] Page `/dashboard/analytics` — chiffres cles (vues, abonnes, wishlists, messages, ventes, CA, impressions discovery, taux de decouverte)
- [x] Selector de periode (7j, 30j, 90j)
- [x] Tableau detail par jour
- [x] Graphiques Recharts — AreaChart (vues empilees profil/oeuvres/decouverte), BarChart (engagement abonnes/wishlists/ventes), AreaChart CA

### 8.3 — Mode Silence
- [x] Mode Silence — toggle dans settings + indicateur sur profil public + filtre messagerie (tous/acheteurs)

---

## PHASE 9 — ADMIN & MODERATION (Semaine 15) ✅

### 9.1 — Dashboard Admin ✅
- [x] Page `/admin/discovery` — grille 24 slots, preview oeuvres par heure, selection par date
- [x] Page `/admin/artists` — liste complete avec toggle verifie/non-verifie, toggle fondateur (8%/10%), statut Stripe, stats
- [x] Page `/admin/moderation` — liste des commentaires, actions masquer/supprimer

### 9.2 — Programme Fondateurs ✅
- [x] Flag `is_founder` en BDD (Phase 0)
- [x] Commission 8% dans la logique metier (Phase 0)
- [x] Toggle fondateur dans le dashboard admin avec maj commission_rate
- [x] Badge fondateur (★) et verifie (✓) sur profil public et page oeuvre

---

## PHASE 10 — POLISH, TESTS & LANCEMENT (Semaines 15-16) ✅

### 10.1 — SEO & Performance Web ✅
- [x] Meta tags dynamiques sur les pages artiste et oeuvre (generateMetadata)
- [x] Open Graph sur toutes les pages publiques
- [x] Sitemap dynamique (`app/sitemap.ts`) — pages statiques + artistes + oeuvres
- [x] robots.txt (`app/robots.ts`) — bloque /dashboard, /admin, /api, /checkout
- [x] Landing page avec hero, features, navigation, footer
- [x] Open Graph images generees — API /api/og (Edge Runtime, ImageResponse dynamique)
- [x] JSON-LD schema.org — Person sur profil artiste, Product/Offer sur page oeuvre
- [ ] Optimisation Core Web Vitals — a affiner en production
- [x] next/image — page oeuvre migree (Image fill + priority + sizes), composant ArtworkImage wrapper

### 10.2 — Performance Mobile
- [ ] A affiner apres tests sur devices reels

### 10.3 — Tests
- [x] Tests E2E Playwright — 4 fichiers (homepage, auth, discover, checkout) avec config multi-navigateur

### 10.4 — Securite
- [x] Webhooks Stripe verifies par signature (dans stripe-webhook et webhook route)
- [x] Middleware Next.js protege /dashboard et /admin avec verification de role
- [x] RLS sur toutes les tables (45+ policies)
- [x] Rate limiting — lib/rate-limit.ts (en memoire, par IP, configurable window/max) integre dans create-payment-intent
- [x] Headers de securite — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS

### 10.5 — Export & Conformite ✅
- [x] API route `/api/artworks/export` — export JSON complet (profil, oeuvres, series, posts, conversations, messages, transactions, collection, followers, analytics)
- [x] Page `/dashboard/settings/export` (Passeport Artiste)
- [x] Export ameliore — JSON avec media_urls integrees, format ZIP prevu
- [x] Suppression de compte — API `/api/account/delete` + page `/dashboard/settings/delete` (confirmation textuelle, verification transactions en cours, cascade auth.users)

### 10.6 — Lancement
- [ ] Toutes les etapes manuelles (Supabase, Stripe, R2, Resend, Vercel, EAS, DNS)

---

## PHASE 11 — AUDIT UX/UI & CORRECTIONS (Semaines 17-22)

> Audit realise le 2026-03-31 — 105+ problemes identifies sur l'ensemble du projet web.
> Priorite : Securite > Accessibilite > UX core > Coherence > Polish

---

### 11.1 — Securite & Failles Critiques (Semaine 17)

**11.1.1 — XSS : Sanitisation HTML** ✅
- [x] Installer DOMPurify + sanitize helper (`isomorphic-dompurify` pour client, `lib/sanitize.ts` pour server)
- [x] Sanitiser `story_html` dans `app/[artistSlug]/artwork/[artworkSlug]/page.tsx` — utilise `sanitizeHtml()`
- [x] Sanitiser `story_html` dans `components/artist/artist-profile-view.tsx` — utilise `DOMPurify.sanitize()`
- [x] Sanitiser le JSON-LD dans `app/[artistSlug]/page.tsx` et artwork page — echappement `</script>`

**11.1.2 — Redirect ouvert sur login** ✅
- [x] Valider le parametre `redirect` dans `app/(auth)/login/page.tsx` — verifie `startsWith('/')` et pas `startsWith('//')`

**11.1.3 — Headers de securite** ✅
- [x] CSP ajoutee dans `next.config.js` (script-src, style-src, img-src, frame-src, connect-src, font-src)
- [x] X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy — deja presents
- [x] Route `/checkout/*` ajoutee dans le middleware matcher
- [ ] Ajouter une protection CSRF basique (token dans les cookies + verification dans les API routes)

**11.1.4 — Securite authentification** ✅
- [x] Rate limit cote client sur login — max 5 tentatives, cooldown 60s
- [x] Erreurs Supabase mappees vers message generique "Email ou mot de passe incorrect."
- [ ] Deplacer la verification d'unicite du username cote serveur (API route)

---

### 11.2 — Gestion d'Erreurs Globale (Semaine 17)

**11.2.1 — Systeme de toast/notification** ✅
- [x] Installer Sonner (`sonner`)
- [x] `<Toaster>` ajoute dans le root `layout.tsx` (position bottom-right, richColors, closeButton)

**11.2.2 — Error handling sur toutes les requetes Supabase** ✅
- [x] `app/(public)/discover/page.tsx` — error state + toast + bouton retry
- [x] `app/(public)/artists/page.tsx` — error state + toast + bouton retry
- [x] `app/(public)/drops/page.tsx` — error state + toast + bouton retry
- [x] `app/dashboard/artworks/page.tsx` — error handling + toast
- [x] `app/dashboard/artworks/[id]/edit/page.tsx` — error handling sur load/save/delete
- [x] `app/dashboard/artworks/new/page.tsx` — error handling + field errors inline
- [x] `app/dashboard/artworks/series/page.tsx` — error handling + toast
- [x] `app/dashboard/carnet/page.tsx` — error handling + toast
- [x] `app/dashboard/carnet/new/page.tsx` — error handling (pas de redirect si echec)
- [x] `app/dashboard/messages/page.tsx` — error handling + toast
- [x] `app/dashboard/messages/[conversationId]/page.tsx` — error handling sur fetch/send/archive/payment
- [x] `app/dashboard/sales/page.tsx` — error handling + toast
- [x] `app/dashboard/analytics/page.tsx` — error handling + toast
- [x] `app/dashboard/drops/page.tsx` — error handling + loading state ajoute
- [x] `app/dashboard/settings/page.tsx` — toast.success/error sur save
- [x] `app/dashboard/settings/stripe/page.tsx` — try/catch + response.ok
- [x] `app/dashboard/settings/export/page.tsx` — try/catch + response.ok
- [x] `app/dashboard/settings/delete/page.tsx` — try/catch + validation inline
- [x] `app/dashboard/onboarding/page.tsx` — field errors inline
- [x] `app/dashboard/collection/page.tsx` — error handling + toast
- [x] `app/dashboard/wishlist/page.tsx` — error handling avec rollback
- [x] `components/artist/artist-profile-view.tsx` — toggleFollow avec rollback + redirect login si !user
- [x] `components/artist/story-chapters.tsx` — error handling + rollback
- [x] `components/artwork/contact-artist-button.tsx` — try/catch + toast
- [x] `components/artwork/wishlist-button.tsx` — optimistic + rollback + redirect login
- [x] `components/carnet/comment-section.tsx` — error handling + redirect login
- [x] `components/carnet/reaction-bar.tsx` — optimistic + rollback + redirect login
- [x] `components/notifications/notification-center.tsx` — error handling + optimistic rollback
- [x] `components/auth/auth-provider.tsx` — try/catch sur getSession + loadProfile

**11.2.3 — Pages d'erreur Next.js** ✅
- [x] `app/not-found.tsx` — page 404 custom avec liens accueil + decouvrir
- [x] `app/error.tsx` — page d'erreur globale avec bouton retry
- [x] `app/dashboard/error.tsx` — erreur dashboard specifique

**11.2.4 — Loading states Next.js** ✅
- [x] `app/(public)/discover/loading.tsx` — spinner plein ecran noir
- [x] `app/(public)/artists/loading.tsx` — skeleton grille avatars
- [x] `app/(public)/drops/loading.tsx` — skeleton cards
- [x] `app/[artistSlug]/loading.tsx` — skeleton profil artiste complet
- [x] `app/[artistSlug]/artwork/[artworkSlug]/loading.tsx` — skeleton oeuvre
- [x] `app/dashboard/loading.tsx` — skeleton stat cards
- [x] `<Suspense>` boundary ajoute dans login, callback, checkout/success

---

### 11.3 — Navigation & Layout Responsive (Semaine 18)

**11.3.1 — Header/Nav partage** ✅
- [x] `components/layout/header.tsx` — header responsive avec logo, nav links, auth-aware, hamburger mobile, aria-label, aria-expanded
- [x] Menu mobile overlay integre dans le header (auto-close on route change)
- [x] Header integre dans la homepage via `<Header />`
- [x] Skip-to-content dans le root layout.tsx

**11.3.2 — Footer partage** ✅
- [x] `components/layout/footer.tsx` — logo, nav links, liens legaux (CGV, confidentialite, mentions), copyright dynamique
- [x] Footer integre dans la homepage via `<Footer />`

**11.3.3 — Dashboard sidebar responsive** ✅
- [x] Sidebar `hidden lg:block`, mobile drawer slide-in avec backdrop
- [x] Header mobile avec hamburger + aria-label + aria-expanded
- [x] Nav actif avec `pathname.startsWith()` (exact match pour `/dashboard`)
- [x] `aria-current="page"` sur le lien actif
- [x] `aria-label="Menu du tableau de bord"` sur `<nav>`
- [x] Auto-close mobile menu sur navigation
- [ ] Confirmation modale avant sign-out

**11.3.4 — Page Discover — navigation** ✅
- [x] Bouton retour "← Bozzart" flottant en haut a gauche
- [x] Navigation clavier (ArrowDown, ArrowUp, Space) avec `onKeyDown`
- [x] `tabIndex={0}` pour focus clavier

**11.3.5 — Breadcrumbs**
- [ ] Creer `components/layout/breadcrumbs.tsx` — composant breadcrumb generique
- [ ] Ajouter les breadcrumbs sur : page oeuvre (`/:artistSlug/artwork/:artworkSlug`), checkout, pages dashboard imbriquees

---

### 11.4 — Accessibilite WCAG 2.1 AA (Semaines 18-19)

**11.4.1 — Labels de formulaire** ✅ (partiellement)
- [x] `app/dashboard/artworks/new/page.tsx` — 10 champs associes htmlFor/id
- [x] `app/dashboard/artworks/[id]/edit/page.tsx` — 11 champs associes
- [x] `app/dashboard/carnet/new/page.tsx` — 4 champs associes
- [x] `app/dashboard/settings/page.tsx` — 8 champs associes
- [x] `app/dashboard/settings/delete/page.tsx` — label associe avec input
- [x] `app/dashboard/onboarding/page.tsx` — 8 champs associes
- [x] `app/checkout/[artworkId]/page.tsx` — labels guest name/email associes
- [x] `app/(auth)/signup/page.tsx` — aria-label sur le toggle password
- [x] `app/(public)/artists/page.tsx` — labels sr-only sur recherche et select pays
- [ ] `components/carnet/comment-section.tsx` — ajouter label sur l'input commentaire
- [ ] `components/editor/rich-text-editor.tsx` — ajouter labels accessibles sur les boutons toolbar
- [ ] `components/messaging/` — ajouter label cache sur l'input message
- [ ] `components/artist/story-chapters.tsx` — ajouter labels sur les inputs

**11.4.2 — ARIA roles et attributs**
- [ ] `components/artist/artist-profile-view.tsx:81-94` — ajouter `role="tablist"` sur le container, `role="tab"` + `aria-selected` sur les boutons, `role="tabpanel"` sur le contenu, navigation fleches
- [ ] `components/editor/rich-text-editor.tsx` — ajouter `role="toolbar"` sur le container, `aria-pressed` sur les boutons actifs
- [ ] `components/carnet/reaction-bar.tsx` — ajouter `role="group"` + `aria-label="Reactions"`, `aria-pressed` sur chaque bouton
- [ ] `app/dashboard/carnet/new/page.tsx:59-69` — ajouter `role="radiogroup"` + `aria-pressed` sur les boutons de type de post
- [ ] `app/dashboard/analytics/page.tsx:73-84` — ajouter `role="radiogroup"` sur le selecteur de periode
- [ ] `app/dashboard/onboarding/page.tsx:117-128` — ajouter `role="progressbar"` + `aria-valuenow/min/max` sur la barre de progression
- [ ] `components/notifications/notification-center.tsx` — ajouter `aria-expanded` sur le bouton cloche, `aria-label="Notifications"`, fermeture avec Escape
- [ ] `app/dashboard/artworks/series/page.tsx:88` — ajouter `aria-expanded` sur le bouton toggle formulaire

**11.4.3 — Boutons icone — aria-labels**
- [x] `components/artwork/wishlist-button.tsx` — `aria-label` + `disabled` pendant loading
- [x] `components/notifications/notification-center.tsx` — `aria-label="Notifications"` sur le bouton cloche
- [ ] `components/messaging/read-receipt.tsx` — ajouter `aria-label` sur le span, `aria-hidden="true"` sur les SVG
- [x] `app/(auth)/login/page.tsx` — `tabIndex={-1}` retire, bouton focusable
- [x] `app/(auth)/signup/page.tsx` — `aria-label` ajoute + `tabIndex={-1}` retire
- [x] `app/[artistSlug]/artwork/[artworkSlug]/page.tsx` — badges avec `role="img" aria-label`
- [x] `app/(public)/artists/page.tsx` — badges avec `role="img" aria-label`

**11.4.4 — Images et alt text**
- [x] `app/(public)/discover/page.tsx` — `aria-hidden="true"` sur le SVG scroll + sr-only text
- [ ] `app/dashboard/carnet/page.tsx:62` — remplacer `alt=""` par une description basee sur la caption du post
- [ ] `app/[artistSlug]/artwork/[artworkSlug]/page.tsx:97` — ameliorer le alt des images secondaires (ex: "Vue supplementaire de {titre}")
- [x] `components/artist/artist-profile-view.tsx` — alt descriptif sur les images de post
- [ ] `components/artist/artist-profile-view.tsx:45` — ajouter `role="img" aria-label` sur le placeholder avatar

**11.4.5 — Contraste et visibilite**
- [x] `app/(public)/discover/page.tsx` — `text-white/80` sur le loading
- [x] `app/(public)/drops/page.tsx` — grayscale + badge "Termine" au lieu de opacity-60
- [ ] `components/messaging/read-receipt.tsx` — changer `text-gray-400` en `text-gray-500` pour le statut "delivre" (meilleur contraste)
- [ ] Verifier le contraste de `bg-brand-600` + texte blanc dans les badges unread (messages)

**11.4.6 — Loading states accessibles** ✅
- [x] `role="status"` et `aria-live="polite"` sur tous les loading states (discover, artists, drops, dashboard layout, loading.tsx files)
- [x] `app/checkout/[artworkId]/page.tsx` — `role="alert"` sur le message d'erreur

**11.4.7 — Navigation clavier**
- [ ] `components/upload/image-upload.tsx:91` — ajouter `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) sur la zone d'upload
- [ ] `components/notifications/notification-center.tsx:105` — rendre le backdrop fermable avec Escape, ajouter focus trap
- [ ] `components/editor/rich-text-editor.tsx:78-79` — remplacer `window.prompt()` par un input inline/modale pour l'URL du lien
- [ ] `app/dashboard/artworks/[id]/edit/page.tsx:137` — remplacer `confirm()` natif par une modale custom accessible
- [ ] `components/artist/story-chapters.tsx:52` — remplacer `confirm()` par une modale custom

---

### 11.5 — Coherence Design System (Semaine 19)

**11.5.1 — Adopter le composant Button partage**
- [ ] Remplacer tous les `<button className="...">` ad hoc par `<Button>` de `@bozzart/ui` dans :
  - `components/artwork/contact-artist-button.tsx`
  - `components/artwork/wishlist-button.tsx`
  - `components/artist/story-chapters.tsx`
  - `components/carnet/comment-section.tsx`
  - `components/carnet/reaction-bar.tsx`
  - `components/checkout/stripe-checkout-form.tsx`
  - `components/upload/image-upload.tsx`
  - Toutes les pages dashboard (artworks, carnet, messages, settings, etc.)
  - Pages auth (login, signup)
  - Homepage (hero CTA)
- [ ] Enrichir le composant `Button` de `packages/ui` :
  - Ajouter `aria-busy="true"` quand `loading`
  - Ajouter un spinner SVG anime a cote du texte loading
  - Ajouter une prop `loadingText` pour l'internationalisation
  - Ajouter une variante `"danger"` (rouge) pour les actions destructives

**11.5.2 — Unifier le systeme de couleurs**
- [ ] Remplacer tous les `bg-white` hardcodes par `bg-background` (token CSS variable) :
  - `app/(public)/artists/page.tsx:52`
  - `app/(public)/drops/page.tsx:46`
  - `app/[artistSlug]/artwork/[artworkSlug]/page.tsx:74`
  - `app/checkout/success/page.tsx:11`
  - Toutes les pages dashboard
- [ ] Remplacer les `text-gray-600`, `text-gray-700`, `text-black` par les tokens semantiques (`text-foreground`, `text-foreground/80`, `text-foreground/60`)
- [ ] Configurer `darkMode: "class"` dans `tailwind.config.ts`
- [ ] Verifier que les variables CSS de `globals.css` (dark mode) sont coherentes avec les tokens utilises

**11.5.3 — Installer le plugin Typography** ✅
- [x] `@tailwindcss/typography` installe et ajoute dans les 2 tailwind.config.ts (packages/config + apps/web)

**11.5.4 — Unifier les liens internes**
- [x] `app/[artistSlug]/artwork/[artworkSlug]/page.tsx` — `<a>` remplace par `<Link>` (artiste, acheter, autres oeuvres)
- [ ] `app/dashboard/collection/page.tsx:113,124` — remplacer `<a>` par `<Link>`
- [ ] `app/dashboard/settings/page.tsx:177,189` — remplacer `<a>` par `<Link>`
- [ ] Remplacer tous les `window.location.href = "..."` par `router.push()` :
  - `app/dashboard/messages/[conversationId]/page.tsx:124`
  - `components/notifications/notification-center.tsx:124`
  - `app/dashboard/settings/delete/page.tsx:33`

**11.5.5 — Migrer vers next/image**
- [x] `app/(public)/artists/page.tsx` — avatar artiste migre vers `<Image>`
- [x] `app/(public)/drops/page.tsx` — cover drop migre vers `<Image>`
- [x] `components/artist/artist-profile-view.tsx` — oeuvres + posts migres vers `<Image>`
- [x] `app/(public)/discover/page.tsx` — retire `unoptimized`
- [ ] Remplacer `<img>` par `<Image>` de Next.js sur :
  - `app/checkout/[artworkId]/page.tsx:97` — thumbnail oeuvre
  - `app/dashboard/artworks/page.tsx:112` — thumbnail oeuvre
  - `app/dashboard/carnet/page.tsx:62` — media post
  - `app/dashboard/messages/page.tsx` — thumbnail conversation
  - `app/(public)/discover/page.tsx` — retirer `unoptimized` et configurer `remotePatterns` dans `next.config.js`
  - `components/artist/artist-profile-view.tsx:109,134` — oeuvres + posts
- [ ] Configurer `remotePatterns` dans `next.config.js` pour les domaines Supabase Storage et R2

---

### 11.6 — Formulaires & Validation (Semaine 20)

**11.6.1 — Validation cote client**
- [ ] `app/dashboard/artworks/[id]/edit/page.tsx` — ajouter la meme validation que `new` (titre non vide, prix valide, URL valide) dans `handleSave`
- [ ] `app/dashboard/carnet/new/page.tsx` — valider que caption ou body n'est pas vide avant publish
- [ ] `app/dashboard/artworks/new/page.tsx` — scroll vers le champ en erreur au lieu d'afficher l'erreur en bas
- [ ] `app/(auth)/signup/page.tsx:397` — ajouter validation email avancee (detecter les typos courantes comme `gmail.con`)
- [ ] `app/dashboard/onboarding/page.tsx:97-108` — indiquer clairement quels champs sont obligatoires a l'etape 3

**11.6.2 — Verification username temps reel**
- [ ] `app/(auth)/signup/page.tsx` — verifier l'unicite du username a l'etape 2 sur `onBlur` ou avec debounce 500ms, afficher un indicateur vert/rouge
- [ ] Creer une API route `/api/check-username` pour la verification cote serveur (au lieu du select client direct)

**11.6.3 — Protection formulaires**
- [ ] Ajouter un warning "unsaved changes" (`beforeunload` event) sur :
  - `app/dashboard/artworks/new/page.tsx`
  - `app/dashboard/artworks/[id]/edit/page.tsx`
  - `app/dashboard/settings/page.tsx`
  - `app/dashboard/carnet/new/page.tsx`
- [ ] `app/(auth)/signup/page.tsx:260` — empecher la soumission du formulaire avec Enter sur les etapes 1 et 2 (ajouter `e.preventDefault()` si step < 3)
- [ ] Ajouter `type="button"` explicite sur tous les boutons non-submit dans les formulaires

**11.6.4 — Feedback mutations**
- [ ] Ajouter un loading state (spinner/disabled) sur tous les boutons de mutation :
  - Follow/unfollow (`artist-profile-view.tsx`)
  - Wishlist toggle (`wishlist-button.tsx`)
  - Reactions (`reaction-bar.tsx`)
  - Comment submit (`comment-section.tsx`)
  - Contact artiste (`contact-artist-button.tsx`)
  - Chapitres save/delete (`story-chapters.tsx`)
- [ ] `app/dashboard/artworks/[id]/edit/page.tsx:121` — remplacer le setTimeout auto-hide par un toast persistant
- [ ] `app/dashboard/settings/page.tsx` — ajouter un save bar sticky en bas du formulaire

**11.6.5 — Tags input**
- [ ] `app/dashboard/artworks/new/page.tsx:72` — remplacer l'input texte comma-separated par un composant tag input avec chips (ajout/suppression visuelle)

---

### 11.7 — UX Checkout & E-commerce (Semaine 20)

**11.7.1 — Page checkout** ✅ (partiellement)
- [x] Bouton retour avec `router.back()`
- [x] Badge de confiance "Paiement securise par Stripe" avec icone cadenas
- [x] `<img>` remplace par `<Image>`, labels htmlFor/id, role="alert" sur erreur
- [ ] Decomposition du prix : prix oeuvre, frais de service, total
- [ ] Champ adresse de livraison (oeuvres physiques)
- [ ] Lien "Vous avez un compte ? Connectez-vous" pour guest users
- [ ] Gerer le cas Stripe non initialise
- [ ] Breadcrumbs Oeuvre > Paiement

**11.7.2 — Page succes**
- [ ] Afficher les details de la commande : oeuvre achetee, artiste, prix paye, numero de transaction
- [ ] Ajouter un bouton "Telecharger le recu" / "Imprimer"
- [ ] Conditionner le lien "Voir ma collection" : si guest → afficher "Creez un compte pour retrouver votre collection"
- [ ] Ajouter un lien vers le certificat d'authenticite

**11.7.3 — Protection achat**
- [ ] Gerer le cas d'une oeuvre vendue entre le chargement et le clic "Acheter" — verifier le statut avant de creer le PaymentIntent
- [ ] Ajouter une page intermediaire entre Discover et Checkout — ne pas linker directement "Acheter" vers `/checkout/`

---

### 11.8 — Responsive & Mobile Web (Semaine 21)

**11.8.1 — Homepage** ✅
- [x] Hero text responsive : `text-3xl sm:text-4xl md:text-5xl lg:text-7xl`
- [x] `<h3>` corrige en `<h2>` dans la section features + titre de section
- [x] CTA "Pret a decouvrir l'art autrement ?" ajoute apres features

**11.8.2 — Grilles responsive** ✅
- [x] `app/(public)/artists/page.tsx` — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- [x] `app/[artistSlug]/artwork/[artworkSlug]/page.tsx` — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [x] `app/dashboard/page.tsx` — `grid-cols-2 lg:grid-cols-4`
- [x] `app/dashboard/sales/page.tsx` — `grid-cols-1 sm:grid-cols-3`
- [x] `app/dashboard/artworks/new/page.tsx` — breakpoints sm: ajoutes sur les 3 grilles

**11.8.3 — Tableau ventes mobile** ✅ (partiellement)
- [x] `scope="col"` sur les `<th>` + `<caption>` sur le `<table>`
- [ ] Layout card alternatif pour mobile

**11.8.4 — Carte Leaflet**
- [ ] `components/map/artist-map.tsx:79` — rendre la hauteur responsive (`h-[300px] sm:h-[400px] lg:h-[500px]`)
- [ ] Charger les icones Leaflet localement au lieu d'unpkg.com
- [ ] Afficher un message quand aucun artiste n'a de coordonnees

**11.8.5 — Upload image**
- [ ] `components/upload/image-upload.tsx` — ajouter une barre de progression (pas juste "Upload en cours...")
- [ ] Ajouter un bouton "Supprimer l'image" apres upload
- [x] Revoquer les `URL.createObjectURL` dans le cleanup du useEffect

**11.8.6 — Filtres artistes**
- [x] `app/(public)/artists/page.tsx` — debounce 300ms sur la recherche
- [x] `app/(public)/artists/page.tsx` — liste de pays elargie (10 pays)
- [x] Ajouter une pagination (ou infinite scroll) sur la liste artistes et la grille oeuvres du dashboard

---

### 11.9 — SEO & Metadata (Semaine 21)

**11.9.1 — Metadata sur les pages client** ✅
- [x] 6 layout.tsx crees avec metadata : discover, artists, drops, login, signup, checkout

**11.9.2 — OpenGraph complet** ✅ (partiellement)
- [x] `description` ajoutee dans openGraph du root layout
- [x] `icons` (favicon, apple-touch-icon) ajoutes dans le root layout
- [ ] Image OG sur les profils artistes

**11.9.3 — Root layout** ✅
- [x] Export `viewport` (width, initialScale, themeColor)
- [x] `force-dynamic` retire du root layout
- [x] `suppressHydrationWarning` sur `<html>`

---

### 11.10 — Conformite Legale RGPD & Droit Francais (Semaine 21)

**11.10.1 — Pages legales** ✅
- [x] `app/(public)/cgv/page.tsx` — CGV (9 sections, TODO pour revue juridique)
- [x] `app/(public)/confidentialite/page.tsx` — Politique RGPD (8 sections, TODO pour revue)
- [x] `app/(public)/mentions-legales/page.tsx` — Mentions legales (editeur, hebergeur, SIRET placeholder)
- [x] Liens integres dans le footer partage

**11.10.2 — Consentement RGPD** ✅
- [x] Checkbox "J'accepte les CGV et la Politique de confidentialite" dans signup etape 3
- [x] Bouton submit desactive sans consentement

**11.10.3 — Page suppression compte**
- [ ] `app/dashboard/settings/delete/page.tsx` — ajouter un rappel "Exportez vos donnees avant la suppression" avec lien vers `/dashboard/settings/export`
- [ ] Mentionner le sort des transactions en cours

---

### 11.11 — Polish & Details (Semaine 22)

**11.11.1 — Formatage des prix** ✅
- [x] `formatPrice()` cree dans `packages/core/src/utils/format.ts`
- [x] Utilise dans : discover, artwork detail, artist-profile-view, checkout

**11.11.2 — Accents francais**
- [ ] Corriger tous les textes sans accents dans l'interface :
  - "Decouvrir" → "Decouvrir" (ou utiliser les accents si le fichier est en UTF-8)
  - "oeuvre" → "oeuvre"
  - "Creez" → "Creez"
  - Passer en revue chaque page pour corriger les textes FR

**11.11.3 — Redirections auth manquantes** ✅ (partiellement)
- [x] Follow, Wishlist, Reactions, Comments : redirect `/login?redirect=...` quand !user
- [ ] `auth-provider.tsx` — redirection vers `/login` apres signOut
- [ ] Gerer l'expiration de session : toast + redirect

**11.11.4 — Pagination**
- [ ] Ajouter une pagination (limit + offset ou cursor) sur :
  - [x] `app/(public)/artists/page.tsx` — artistes (20 par page)
  - [x] `app/dashboard/artworks/page.tsx` — oeuvres (20 par page)
  - [ ] `app/dashboard/carnet/page.tsx` — posts (10 par page)
  - [ ] `app/dashboard/sales/page.tsx` — transactions (20 par page)
  - [ ] `app/dashboard/messages/page.tsx` — conversations (20 par page)
  - [ ] `components/carnet/comment-section.tsx` — commentaires (load more)

**11.11.5 — Dashboard acheteur** ✅
- [x] `app/dashboard/page.tsx:26-30` — enrichir le dashboard acheteur :
  - [x] Nombre d'oeuvres en collection
  - [x] Nombre de wishlists
  - [ ] Derniers artistes suivis
  - [x] CTA "Decouvrir de nouvelles oeuvres"

**11.11.6 — Messagerie** ✅
- [x] `app/dashboard/messages/page.tsx:70` — afficher le vrai nom de l'artiste au lieu du texte "Artiste" hardcode
- [x] `app/dashboard/messages/[conversationId]/page.tsx:183-184` — elargir `max-w-xs` en `max-w-sm md:max-w-md`

**11.11.7 — Drops**
- [x] `app/(public)/drops/page.tsx` — countdown live avec `setInterval` (mise a jour chaque minute)
- [x] `app/(public)/drops/page.tsx` — drops passes en grayscale au lieu de opacity-60
- [x] `app/(public)/drops/page.tsx` — fix duplication active/upcoming (filtre `!isDropActive`)
- [ ] `app/(public)/drops/page.tsx` — rendre le DropCard cliquable (wrapper dans un `<Link>`)
- [ ] `app/dashboard/drops/page.tsx:49` — traduire les statuts en francais
- [ ] `app/dashboard/drops/page.tsx` — ajouter un CTA "Creer un drop"

**11.11.8 — Reaction bar — etat initial**
- [ ] `components/carnet/reaction-bar.tsx:23` — charger la reaction existante de l'utilisateur au mount pour afficher le bon etat

**11.11.9 — Lightbox images oeuvre**
- [ ] Ajouter un composant lightbox/zoom sur la page oeuvre detail (`app/[artistSlug]/artwork/[artworkSlug]/page.tsx:94-101`) — clic sur image secondaire → affichage plein ecran

**11.11.10 — Memory leaks**
- [ ] `components/messaging/typing-indicator.tsx:33-36` — cleaner les `setTimeout` dans le cleanup du useEffect
- [ ] `components/messaging/typing-indicator.tsx:45-51` — reutiliser le channel existant au lieu d'en creer un nouveau dans `sendTyping`
- [x] `components/upload/image-upload.tsx:50` — ajouter `URL.revokeObjectURL()` dans le cleanup
- [x] `components/tracking/track-view.tsx:11` — ajouter une deduplication pour eviter le double-count en React strict mode

**11.11.11 — Performance**
- [x] `force-dynamic` retire du root layout.tsx
- [x] `app/(public)/discover/page.tsx` — `indexOf` remplace par index du `.map()` callback
- [ ] `app/dashboard/analytics/page.tsx:107` — rendre le conteneur de chart responsive au lieu de `style={{ height: 300 }}` fixe
- [ ] Ajouter une alternative textuelle (data table) pour les charts Recharts (accessibilite)

---

## RESUME PAR SEMAINE

| Semaine | Phase | Focus |
|---------|-------|-------|
| 1 | Phase 0 | Monorepo, Supabase, Stripe, R2, CI/CD |
| 2-3 | Phase 1 | Auth, profils artiste/acheteur, onboarding |
| 4-6 | Phase 2 | CRUD oeuvres, series, page oeuvre, upload, wishlist |
| 6-7 | Phase 3 | Carnet, feed social, reactions, commentaires |
| 7-9 | Phase 4 | Messagerie temps reel, liens de paiement |
| 9-11 | Phase 5 | Stripe Connect, checkout, webhooks, certificats |
| 11-13 | Phase 6 | Decouverte, curation, drops, recherche, filtres |
| 13-14 | Phase 7 | Notifications push, temps reel global |
| 14 | Phase 8 | Analytics artiste, mode silence |
| 15 | Phase 9 | Admin, moderation, programme fondateurs |
| 15-16 | Phase 10 | SEO, perf, tests, securite, export, lancement |
| **17** | **Phase 11.1-11.2** | **Securite, failles XSS/redirect, gestion erreurs globale, toasts, pages erreur/loading** |
| **18** | **Phase 11.3-11.4** | **Navigation responsive, header/footer partages, sidebar mobile, accessibilite WCAG (labels, ARIA, contraste)** |
| **19** | **Phase 11.4-11.5** | **Fin accessibilite, design system (Button partage, couleurs unifiees, next/image, Typography plugin)** |
| **20** | **Phase 11.6-11.7** | **Validation formulaires, protection unsaved changes, UX checkout complet, badges confiance** |
| **21** | **Phase 11.8-11.10** | **Responsive mobile, SEO metadata, conformite legale RGPD, pages CGV/mentions** |
| **22** | **Phase 11.11** | **Polish : prix formates, pagination, lightbox, memory leaks, performance, accents FR** |

---

## DEPENDANCES CRITIQUES

```
Phase 0 (fondations) ──→ tout le reste
Phase 1 (auth) ──→ Phase 2, 3, 4, 5
Phase 2 (oeuvres) ──→ Phase 4 (messagerie contextuelle), Phase 5 (checkout), Phase 6 (decouverte)
Phase 4 (messagerie) ──→ Phase 5.3 (liens de paiement dans conversations)
Phase 5 (paiements) ──→ Phase 8 (analytics ventes)
Phase 11.1 (securite) ──→ aucune dependance, peut commencer immediatement
Phase 11.2 (toasts) ──→ Phase 11.6 (feedback mutations en depend)
Phase 11.3 (nav responsive) ──→ Phase 11.4 (ARIA sur la nav)
Phase 11.5 (design system) ──→ Phase 11.11 (polish utilise les tokens unifies)
```

**Chemin critique Phase 11** : 11.1 (securite) → 11.2 (toasts) → 11.6 (formulaires) | En parallele : 11.3 (nav) → 11.4 (ARIA) → 11.5 (design system)

---

## RISQUES ET POINTS D'ATTENTION

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Onboarding Stripe Connect complexe | Bloque les ventes | Commencer le dev Stripe des la Phase 0, tester en sandbox intensivement |
| Performance scroll plein ecran (decouverte) | UX degradee | Prototyper tot, profiler sur devices bas de gamme |
| Policies RLS trop permissives | Fuite de donnees | Tests dedies par table/role, audit en Phase 10 |
| Upload fichiers lourds (4K) | Timeout, UX lente | Upload direct vers R2, progress bar, compression client |
| Realtime Supabase a l'echelle | Messages perdus | Prevoir reconnexion auto, fallback polling |
| Soumission App Store | Retard de lancement | Soumettre une build beta des la Phase 6 pour anticiper les reviews |
| Seuil TVA auto-entrepreneur (36 800 EUR CA) | Obligation de collecter la TVA, changement de prix | Monitorer le CA mensuel, prevoir le passage en SAS/SASU si croissance rapide |
| Frais Stripe qui grignottent la commission | Marge nette ~8% au lieu de 10% | Integrer les frais Stripe dans les projections financieres des le depart |
| **Faille XSS via story_html** | **Donnees utilisateur compromises** | **Priorite absolue Phase 11.1 — DOMPurify** |
| **Redirect ouvert sur login** | **Phishing** | **Priorite absolue Phase 11.1 — validation chemin relatif** |
| **Accessibilite non conforme WCAG** | **Exclusion utilisateurs, risque legal** | **Phase 11.4 — labels, ARIA, contraste** |
| **Pas de pages legales (CGV, RGPD)** | **Non-conformite droit francais** | **Phase 11.10 — creer CGV, mentions, consentement** |
