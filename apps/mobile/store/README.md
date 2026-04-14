# Bozzart — Store Submission Assets

Tracks required assets and copy drafts for first submission to the App Store and Google Play.

## Required assets

### App Store (iOS)
- App icon 1024x1024 PNG (no alpha)
- Screenshots x5 per device class (6.7" iPhone, 6.5" iPhone, 5.5" iPhone, 12.9" iPad)
  - Home / Feed
  - Decouvrir (discover)
  - Profil artiste
  - Oeuvre detail + achat
  - Messages / Live
- Preview video (optional, 15-30s)

### Google Play (Android)
- Adaptive icon (foreground + background, 512x512)
- Feature graphic 1024x500 PNG
- Screenshots x8 (phone), x2 (7" tablet), x2 (10" tablet)
- Short description (80 chars max)
- Full description (4000 chars max)

## Copy drafts

### Name
Bozzart — Art & Artistes

### Short description (Android, 80 chars)
FR: Decouvrez, suivez et achetez l'art des artistes emergents.
EN: Discover, follow and buy art from emerging artists.

### Long description
FR:
Bozzart est la plateforme sociale dediee aux artistes et collectionneurs.
- Decouvrez des oeuvres originales selectionnees chaque jour
- Suivez vos artistes preferes et leur processus de creation (Le Carnet)
- Discutez en direct via sessions live
- Achetez en toute securite, paiement protege

EN:
Bozzart is the social platform for artists and collectors.
- Discover original artworks curated daily
- Follow your favorite artists and their creative process (The Carnet)
- Chat in real time during live sessions
- Buy securely with protected payment

### Keywords (App Store, 100 chars)
art, artiste, galerie, peinture, oeuvre, collectionneur, social, live, carnet, decouverte

### Category
- App Store: Art & Design (Lifestyle secondary)
- Play Store: Art & Design

## TODO
- [ ] Produce final PNG icon (1024x1024) at `apps/mobile/assets/icon.png`
- [ ] Produce splash (black bg) at `apps/mobile/assets/splash.png`
- [ ] Produce adaptive icon foreground at `apps/mobile/assets/adaptive-icon.png`
- [ ] Shoot 5 iOS screenshots on 6.7" simulator
- [ ] Shoot 8 Android screenshots on Pixel 7 emulator
- [ ] Design feature graphic 1024x500
- [ ] Fill `TEAMID` in `apps/web/public/.well-known/apple-app-site-association`
- [ ] Fill SHA256 fingerprint in `apps/web/public/.well-known/assetlinks.json` (from Play Console > App signing)
- [ ] Fill `eas.json` submit credentials (Apple ID, ASC App ID, Team ID, Play service account key)
