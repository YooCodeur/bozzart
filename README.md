# Bozzart — Marketplace & Reseau Social Artistique

> **bozzart.art**

Plateforme qui fusionne reseau social artistique et marketplace de vente d'oeuvres.
Deux surfaces : un site web Next.js et une application mobile React Native. Un backend partage Supabase. Une seule source de verite.

---

## Concept

**L'Artiste** cree son profil, publie dans son Carnet (fil social), met en vente ses oeuvres avec leurs histoires et leurs prix, echange avec les acheteurs via messagerie, et encaisse ses ventes.

**L'Acheteur** decouvre des artistes via la page de decouverte ou la navigation, suit leur travail, reagit aux posts, contacte les artistes, achete avec un minimum de friction, et accumule une galerie privee de ses acquisitions.

**Modele economique** : 10% de commission fixe sur chaque transaction. Virement artiste en 48h. Programme Fondateurs a 8%.

---

## Modele Juridique V1 — Auto-Entreprise

La V1 est operee sous le statut **micro-entreprise (auto-entrepreneur)** en France. Ce statut permet de demarrer rapidement sans structure lourde.

### Comment la commission fonctionne

```
Acheteur paie 100 EUR
    │
    ├── 90 EUR → Compte Stripe Connect de l'artiste (virement auto 48h)
    ├── 10 EUR → Compte Stripe de la plateforme (ta commission)
    └── ~1.5% + 0.25 EUR → Frais Stripe (deduits de la commission plateforme)
```

Le split 90/10 est gere automatiquement par Stripe via `application_fee_amount` sur chaque PaymentIntent. Aucune logique de repartition dans le code applicatif.

### Facturation

- Chaque vente genere une facture de commission (10% du montant) emise par la plateforme vers l'artiste
- Le chiffre d'affaires declare = la somme des commissions encaissees (pas le volume total des ventes)
- Exemple : 50 ventes avec 10 EUR de commission chacune = 500 EUR de CA declare

### Plafonds et seuils

| Seuil | Montant | Impact |
|---|---|---|
| Plafond CA micro-entreprise (services) | 77 700 EUR/an | = 777 000 EUR de volume de ventes. Largement suffisant pour la V1 |
| Franchise TVA | 36 800 EUR/an de CA | En dessous : pas de TVA a facturer. Au-dessus : collecte de TVA obligatoire |
| Programme Fondateurs (8%) | Sur decision | Commission reduite, marge plus faible mais fidelisation artistes early |

### Frais Stripe a prevoir

Les frais Stripe (~1.5% + 0.25 EUR par transaction en Europe) sont **deduits de la commission plateforme**. Sur une vente a 100 EUR :
- Commission brute : 10 EUR
- Frais Stripe : ~1.75 EUR
- Commission nette : ~8.25 EUR

### Quand changer de statut

Passer en SAS/SASU quand :
- Le CA approche le plafond micro-entreprise
- Le seuil de TVA est depasse
- Une levee de fonds est envisagee
- Un associe rejoint le projet

> **Important** : consulter un expert-comptable avant le lancement pour valider le setup Stripe Connect + facturation auto-entrepreneur.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Web | Next.js 14 (App Router) |
| Mobile | Expo SDK 51 + React Native |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Paiements | Stripe Connect (split automatique 90/10) |
| Assets HD | Cloudflare R2 |
| Emails | Resend |
| CI/CD | GitHub Actions + Vercel (web) + EAS (mobile) |
| Langage | TypeScript strict partout |

---

## Architecture Monorepo

```
/
├── apps/
│   ├── web/          → Next.js 14 (App Router)
│   ├── mobile/       → Expo 51 (Expo Router)
│   └── admin/        → Dashboard curation interne
│
├── packages/
│   ├── core/         → Logique metier pure (artwork, artist, messaging, transaction, discovery)
│   ├── api/          → Types TypeScript partages, React Query hooks, client Supabase
│   ├── ui/           → Composants React partages web/mobile
│   └── config/       → Configs ESLint, TypeScript, Tailwind partagees
│
├── supabase/
│   ├── migrations/   → Migrations SQL
│   ├── seed.sql      → Donnees de test
│   └── functions/    → Edge Functions (webhooks Stripe, certificats, push)
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Fonctionnalites V1

### Artiste
- Profil complet avec 3 zones : Oeuvre, Carnet, Histoire
- Catalogue d'oeuvres avec series, prix, histoires
- Carnet (fil social) : posts photo, video, audio, texte
- Messagerie contextuelle par oeuvre avec liens de paiement
- Analytics prives (vues, followers, ventes, geographie)
- Onboarding Stripe Connect integre
- Mode Silence (masquer ses propres metriques)
- Export complet des donnees (Passeport Artiste)

### Acheteur
- Decouverte plein ecran (scroll vertical type TikTok)
- Navigation par artiste, medium, prix, localisation
- Follow, reactions nommees (Touche, J'en veux, Comment c'est fait, Partager)
- Messagerie directe depuis une page oeuvre
- Achat avec Apple Pay / Google Pay / Stripe
- Guest checkout (achat sans compte)
- Galerie privee des acquisitions
- Certificat d'authenticite PDF automatique

### Plateforme
- Curation editoriale (discovery slots horaires)
- Drops (evenements de vente limites dans le temps)
- Notifications push (Expo Notifications)
- Messagerie temps reel (Supabase Realtime)
- Dashboard admin interne pour la curation et moderation

---

## Base de Donnees

PostgreSQL via Supabase avec Row Level Security sur toutes les tables.

**Tables principales** : profiles, artist_profiles, artworks, artwork_series, carnet_posts, reactions, comments, follows, wishlists, conversations, messages, transactions, buyer_collections, discovery_slots, drops, notifications, push_tokens, artist_analytics_daily, certificates.

---

## Services Externes

| Service | Usage |
|---|---|
| **Supabase** | BDD, Auth (magic link + OAuth), Storage, Realtime |
| **Stripe Connect** | Paiements, split automatique, virements artiste |
| **Cloudflare R2** | Stockage assets HD (pas de frais de sortie) |
| **Resend** | Emails transactionnels (confirmation achat, certificat) |
| **Expo EAS** | Build cloud + OTA updates pour le mobile |
| **Vercel** | Hebergement web + serverless |

---

## Scripts

```bash
pnpm install              # Installer les dependances
pnpm dev                  # Lancer web + mobile en dev
pnpm dev:web              # Lancer uniquement le web
pnpm dev:mobile           # Lancer uniquement le mobile
pnpm build                # Build de production
pnpm lint                 # Linter tous les packages
pnpm test                 # Tests tous les packages
pnpm db:migrate           # Executer les migrations Supabase
pnpm db:seed              # Charger les donnees de test
pnpm db:reset             # Reset + migrate + seed
```

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=

# Expo
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Duree Cible

16 semaines avec 2-3 developpeurs.

---

## Principes

- Aucune feature a moitie. Aucun placeholder "a venir".
- TypeScript strict, pas de `any`.
- Row Level Security partout — la securite est dans la BDD.
- Le split 90/10 est dans Stripe, pas dans le code applicatif.
- Le code metier n'est jamais duplique entre web et mobile.
- Quand la reponse n'est pas dans le brief, on pose la question avant de coder.
