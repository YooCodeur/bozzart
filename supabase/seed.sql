-- ═══════════════════════════════════════════════
-- SEED DATA — Donnees de test Bozzart
-- ═══════════════════════════════════════════════
-- ⚠️  DONNEES DE TEST — A SUPPRIMER AVANT MISE EN PRODUCTION

-- ═══════════════════════════════════════════════
-- AUTH.USERS (requis avant profiles a cause de la FK)
-- Mot de passe pour tous : "password123"
-- Le trigger handle_new_user cree auto un profil basique,
-- on le surcharge ensuite avec notre INSERT ON CONFLICT.
-- ═══════════════════════════════════════════════

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data) VALUES
  -- Artistes (username dans raw_user_meta_data pour eviter les collisions dans le trigger)
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marie@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"marie-dupont","display_name":"Marie Dupont","role":"artist"}'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucas@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"lucas-martin","display_name":"Lucas Martin","role":"artist"}'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sophie@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"sophie-bernard","display_name":"Sophie Bernard","role":"artist"}'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'thomas@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"thomas-leroy","display_name":"Thomas Leroy","role":"artist"}'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'camille@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"camille-moreau","display_name":"Camille Moreau","role":"artist"}'),
  ('11111111-1111-1111-1111-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yuki@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"yuki-tanaka","display_name":"Yuki Tanaka","role":"artist"}'),
  ('11111111-1111-1111-1111-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elena@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"elena-rossi","display_name":"Elena Rossi","role":"artist"}'),
  ('11111111-1111-1111-1111-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'omar@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"omar-hassan","display_name":"Omar Hassan","role":"artist"}'),
  ('11111111-1111-1111-1111-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anna@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"anna-kowalski","display_name":"Anna Kowalski","role":"artist"}'),
  ('11111111-1111-1111-1111-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'felix@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"felix-dubois","display_name":"Felix Dubois","role":"artist"}'),
  ('11111111-1111-1111-1111-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clara@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"clara-silva","display_name":"Clara Silva","role":"artist"}'),
  ('11111111-1111-1111-1111-888888888888', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'noah@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"noah-berg","display_name":"Noah Berg","role":"artist"}'),
  ('11111111-1111-1111-1111-999999999999', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lea@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"lea-fontaine","display_name":"Lea Fontaine","role":"artist"}'),
  ('11111111-1111-1111-1111-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marco@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"marco-vitali","display_name":"Marco Vitali","role":"artist"}'),
  ('11111111-1111-1111-1111-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ines@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"ines-garcia","display_name":"Ines Garcia","role":"artist"}'),
  -- Acheteurs
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jean@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"jean-acheteur","display_name":"Jean Petit","role":"buyer"}'),
  ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"alice-collec","display_name":"Alice Roux","role":"buyer"}'),
  ('66666666-6666-6666-6666-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'paul@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"paul-mercier","display_name":"Paul Mercier","role":"buyer"}'),
  ('66666666-6666-6666-6666-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucie@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"lucie-lambert","display_name":"Lucie Lambert","role":"buyer"}'),
  ('66666666-6666-6666-6666-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hugo@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"hugo-blanc","display_name":"Hugo Blanc","role":"buyer"}'),
  ('66666666-6666-6666-6666-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"maya-chen","display_name":"Maya Chen","role":"both"}'),
  ('66666666-6666-6666-6666-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'romain@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"romain-faure","display_name":"Romain Faure","role":"buyer"}'),
  ('66666666-6666-6666-6666-888888888888', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chloe@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"chloe-duval","display_name":"Chloe Duval","role":"buyer"}'),
  -- Admin
  ('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '', '{"provider":"email","providers":["email"]}', '{"username":"admin","display_name":"Admin MG","role":"admin"}');

-- Identites pour que le login fonctionne
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"marie@test.com"}', 'email', '11111111-1111-1111-1111-111111111111', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"lucas@test.com"}', 'email', '22222222-2222-2222-2222-222222222222', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"sophie@test.com"}', 'email', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"thomas@test.com"}', 'email', '44444444-4444-4444-4444-444444444444', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '{"sub":"55555555-5555-5555-5555-555555555555","email":"camille@test.com"}', 'email', '55555555-5555-5555-5555-555555555555', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-222222222222', '{"sub":"11111111-1111-1111-1111-222222222222","email":"yuki@test.com"}', 'email', '11111111-1111-1111-1111-222222222222', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-333333333333', '{"sub":"11111111-1111-1111-1111-333333333333","email":"elena@test.com"}', 'email', '11111111-1111-1111-1111-333333333333', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-444444444444', '{"sub":"11111111-1111-1111-1111-444444444444","email":"omar@test.com"}', 'email', '11111111-1111-1111-1111-444444444444', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-555555555555', '{"sub":"11111111-1111-1111-1111-555555555555","email":"anna@test.com"}', 'email', '11111111-1111-1111-1111-555555555555', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-666666666666', '{"sub":"11111111-1111-1111-1111-666666666666","email":"felix@test.com"}', 'email', '11111111-1111-1111-1111-666666666666', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-777777777777', '{"sub":"11111111-1111-1111-1111-777777777777","email":"clara@test.com"}', 'email', '11111111-1111-1111-1111-777777777777', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-888888888888', '{"sub":"11111111-1111-1111-1111-888888888888","email":"noah@test.com"}', 'email', '11111111-1111-1111-1111-888888888888', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-999999999999', '{"sub":"11111111-1111-1111-1111-999999999999","email":"lea@test.com"}', 'email', '11111111-1111-1111-1111-999999999999', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-aaaaaaaaaaaa', '{"sub":"11111111-1111-1111-1111-aaaaaaaaaaaa","email":"marco@test.com"}', 'email', '11111111-1111-1111-1111-aaaaaaaaaaaa', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '11111111-1111-1111-1111-bbbbbbbbbbbb', '{"sub":"11111111-1111-1111-1111-bbbbbbbbbbbb","email":"ines@test.com"}', 'email', '11111111-1111-1111-1111-bbbbbbbbbbbb', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '{"sub":"66666666-6666-6666-6666-666666666666","email":"jean@test.com"}', 'email', '66666666-6666-6666-6666-666666666666', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', '{"sub":"77777777-7777-7777-7777-777777777777","email":"alice@test.com"}', 'email', '77777777-7777-7777-7777-777777777777', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-222222222222', '{"sub":"66666666-6666-6666-6666-222222222222","email":"paul@test.com"}', 'email', '66666666-6666-6666-6666-222222222222', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-333333333333', '{"sub":"66666666-6666-6666-6666-333333333333","email":"lucie@test.com"}', 'email', '66666666-6666-6666-6666-333333333333', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-444444444444', '{"sub":"66666666-6666-6666-6666-444444444444","email":"hugo@test.com"}', 'email', '66666666-6666-6666-6666-444444444444', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-555555555555', '{"sub":"66666666-6666-6666-6666-555555555555","email":"maya@test.com"}', 'email', '66666666-6666-6666-6666-555555555555', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-777777777777', '{"sub":"66666666-6666-6666-6666-777777777777","email":"romain@test.com"}', 'email', '66666666-6666-6666-6666-777777777777', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '66666666-6666-6666-6666-888888888888', '{"sub":"66666666-6666-6666-6666-888888888888","email":"chloe@test.com"}', 'email', '66666666-6666-6666-6666-888888888888', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '88888888-8888-8888-8888-888888888888', '{"sub":"88888888-8888-8888-8888-888888888888","email":"admin@test.com"}', 'email', '88888888-8888-8888-8888-888888888888', NOW(), NOW(), NOW());

-- ═══════════════════════════════════════════════
-- PROFILES (15 artistes + 8 acheteurs + 1 admin)
-- ═══════════════════════════════════════════════

INSERT INTO profiles (id, role, username, display_name, avatar_url, bio) VALUES
  -- Artistes (ON CONFLICT car le trigger handle_new_user les a deja crees)
  ('11111111-1111-1111-1111-111111111111', 'artist', 'marie-dupont', 'Marie Dupont', 'https://i.pravatar.cc/300?u=marie', 'Peintre et illustratrice basee a Paris. Exploratrice de lumiere et de couleur.'),
  ('22222222-2222-2222-2222-222222222222', 'artist', 'lucas-martin', 'Lucas Martin', 'https://i.pravatar.cc/300?u=lucas', 'Photographe de rue. Les villes sont mon studio.'),
  ('33333333-3333-3333-3333-333333333333', 'artist', 'sophie-bernard', 'Sophie Bernard', 'https://i.pravatar.cc/300?u=sophie', 'Art digital et generatif. Code is my brush.'),
  ('44444444-4444-4444-4444-444444444444', 'artist', 'thomas-leroy', 'Thomas Leroy', 'https://i.pravatar.cc/300?u=thomas', 'Sculpteur contemporain. La matiere raconte.'),
  ('55555555-5555-5555-5555-555555555555', 'artist', 'camille-moreau', 'Camille Moreau', 'https://i.pravatar.cc/300?u=camille', 'Textile et mixed media. Entre tradition et experimentation.'),
  ('11111111-1111-1111-1111-222222222222', 'artist', 'yuki-tanaka', 'Yuki Tanaka', 'https://i.pravatar.cc/300?u=yuki', 'Calligraphe et encre traditionnelle. Zen et modernite.'),
  ('11111111-1111-1111-1111-333333333333', 'artist', 'elena-rossi', 'Elena Rossi', 'https://i.pravatar.cc/300?u=elena', 'Ceramiste a Florence. La terre comme langage.'),
  ('11111111-1111-1111-1111-444444444444', 'artist', 'omar-hassan', 'Omar Hassan', 'https://i.pravatar.cc/300?u=omar', 'Street art et graffiti. Les murs sont mes toiles.'),
  ('11111111-1111-1111-1111-555555555555', 'artist', 'anna-kowalski', 'Anna Kowalski', 'https://i.pravatar.cc/300?u=anna', 'Aquarelliste. La delicatesse de l eau sur le papier.'),
  ('11111111-1111-1111-1111-666666666666', 'artist', 'felix-dubois', 'Felix Dubois', 'https://i.pravatar.cc/300?u=felix', 'Graveur et imprimeur. L art de la reproduction unique.'),
  ('11111111-1111-1111-1111-777777777777', 'artist', 'clara-silva', 'Clara Silva', 'https://i.pravatar.cc/300?u=clara', 'Performeuse et video-artiste. Le corps comme medium.'),
  ('11111111-1111-1111-1111-888888888888', 'artist', 'noah-berg', 'Noah Berg', 'https://i.pravatar.cc/300?u=noah', 'Peintre abstrait. Emotion pure sur toile.'),
  ('11111111-1111-1111-1111-999999999999', 'artist', 'lea-fontaine', 'Lea Fontaine', 'https://i.pravatar.cc/300?u=lea', 'Illustratrice jeunesse et BD. Le reve en images.'),
  ('11111111-1111-1111-1111-aaaaaaaaaaaa', 'artist', 'marco-vitali', 'Marco Vitali', 'https://i.pravatar.cc/300?u=marco', 'Photographe de paysage. La nature dans toute sa gloire.'),
  ('11111111-1111-1111-1111-bbbbbbbbbbbb', 'artist', 'ines-garcia', 'Ines Garcia', 'https://i.pravatar.cc/300?u=ines', 'Art sonore et installations immersives.'),

  -- Acheteurs
  ('66666666-6666-6666-6666-666666666666', 'buyer', 'jean-acheteur', 'Jean Petit', 'https://i.pravatar.cc/300?u=jean', 'Collectionneur passionne d art contemporain'),
  ('77777777-7777-7777-7777-777777777777', 'buyer', 'alice-collec', 'Alice Roux', 'https://i.pravatar.cc/300?u=alice', 'Amatrice d art contemporain et de design'),
  ('66666666-6666-6666-6666-222222222222', 'buyer', 'paul-mercier', 'Paul Mercier', 'https://i.pravatar.cc/300?u=paul', 'Entrepreneur et amateur d art digital'),
  ('66666666-6666-6666-6666-333333333333', 'buyer', 'lucie-lambert', 'Lucie Lambert', 'https://i.pravatar.cc/300?u=lucie', 'Architecte d interieur, cherche des pieces uniques'),
  ('66666666-6666-6666-6666-444444444444', 'buyer', 'hugo-blanc', 'Hugo Blanc', 'https://i.pravatar.cc/300?u=hugo', 'Galeriste independant a Bordeaux'),
  ('66666666-6666-6666-6666-555555555555', 'both', 'maya-chen', 'Maya Chen', 'https://i.pravatar.cc/300?u=maya', 'Artiste et collectionneuse. J achete ce qui me touche.'),
  ('66666666-6666-6666-6666-777777777777', 'buyer', 'romain-faure', 'Romain Faure', 'https://i.pravatar.cc/300?u=romain', 'Passione de photographie de rue'),
  ('66666666-6666-6666-6666-888888888888', 'buyer', 'chloe-duval', 'Chloe Duval', 'https://i.pravatar.cc/300?u=chloe', 'Decoratrice, j adore melanger les styles'),

  -- Admin
  ('88888888-8888-8888-8888-888888888888', 'admin', 'admin', 'Admin MG', 'https://i.pravatar.cc/300?u=admin', 'Administrateur plateforme')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio;

-- ═══════════════════════════════════════════════
-- ARTIST_PROFILES (15 artistes)
-- ═══════════════════════════════════════════════

INSERT INTO artist_profiles (id, user_id, slug, full_name, pronouns, location_city, location_country, location_lat, location_lng, website_url, instagram_url, story_html, messaging_enabled, is_founder, commission_rate, is_verified, is_featured) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'marie-dupont', 'Marie Dupont', 'elle', 'Paris', 'France', 48.8566, 2.3522, 'https://mariedupont.art', 'https://instagram.com/mariedupont.art', '<p>Je peins depuis que j ai 15 ans. Mon travail explore la lumiere urbaine et les emotions fugaces du quotidien.</p><p>Diplomee des Beaux-Arts de Paris, j ai expose dans plusieurs galeries parisiennes avant de me lancer en independante.</p>', true, true, 0.08, true, true),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'lucas-martin', 'Lucas Martin', 'il', 'Lyon', 'France', 45.7640, 4.8357, 'https://lucasmartin.photo', 'https://instagram.com/lucasmartin.photo', '<p>Photographe de rue depuis 10 ans. Je capture les instants de vie dans les grandes villes europeennes.</p>', true, true, 0.08, true, true),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'sophie-bernard', 'Sophie Bernard', 'elle', 'Berlin', 'Allemagne', 52.5200, 13.4050, 'https://sophiebernard.digital', NULL, '<p>Je cree des oeuvres generatives a l intersection de l art et de la technologie. Mes algorithmes transforment le bruit numerique en beaute.</p>', true, false, 0.10, true, true),
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'thomas-leroy', 'Thomas Leroy', 'il', 'Marseille', 'France', 43.2965, 5.3698, NULL, 'https://instagram.com/thomasleroy.sculpt', '<p>Mes sculptures explorent la tension entre materiaux bruts et formes organiques. L acier rencontre le bois, la pierre epouse le metal.</p>', true, false, 0.10, false, false),
  ('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'camille-moreau', 'Camille Moreau', 'iel', 'Bruxelles', 'Belgique', 50.8503, 4.3517, NULL, 'https://instagram.com/camille.moreau.textile', '<p>Je travaille le textile comme medium artistique, entre tradition et experimentation. Chaque fil raconte une histoire.</p>', true, false, 0.10, false, false),
  ('a6666666-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'yuki-tanaka', 'Yuki Tanaka', 'elle', 'Kyoto', 'Japon', 35.0116, 135.7681, 'https://yukitanaka.jp', 'https://instagram.com/yuki.ink', '<p>Calligraphe formee dans la tradition japonaise, j apporte un regard contemporain a cet art millenaire. L encre sumi et le washi sont mes compagnons quotidiens.</p>', true, false, 0.10, true, true),
  ('a7777777-1111-1111-1111-111111111111', '11111111-1111-1111-1111-333333333333', 'elena-rossi', 'Elena Rossi', 'elle', 'Florence', 'Italie', 43.7696, 11.2558, 'https://elenarossi.it', NULL, '<p>La ceramique est mon langage. Dans mon atelier florentin, je facconne la terre pour creer des formes qui oscillent entre l utile et le contemplatif.</p>', true, false, 0.10, true, false),
  ('a8888888-1111-1111-1111-111111111111', '11111111-1111-1111-1111-444444444444', 'omar-hassan', 'Omar Hassan', 'il', 'Casablanca', 'Maroc', 33.5731, -7.5898, NULL, 'https://instagram.com/omar.walls', '<p>Du street art au white cube, ma pratique navigue entre deux mondes. Les murs de Casablanca sont ma premiere galerie.</p>', true, false, 0.10, false, true),
  ('a9999999-1111-1111-1111-111111111111', '11111111-1111-1111-1111-555555555555', 'anna-kowalski', 'Anna Kowalski', 'elle', 'Cracovie', 'Pologne', 50.0647, 19.9450, 'https://annakowalski.art', NULL, '<p>L aquarelle est un art de l instant. Chaque couche de pigment capture un moment ephemere. Je peins surtout des paysages d Europe de l Est.</p>', true, true, 0.08, true, false),
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-666666666666', 'felix-dubois', 'Felix Dubois', 'il', 'Toulouse', 'France', 43.6047, 1.4442, NULL, 'https://instagram.com/felix.gravure', '<p>Graveur sur bois et linogravure. Chaque impression est unique, meme dans la reproduction. J aime le rituel de l encrage et du passage sous presse.</p>', true, false, 0.10, false, false),
  ('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-777777777777', 'clara-silva', 'Clara Silva', 'elle', 'Lisbonne', 'Portugal', 38.7223, -9.1393, 'https://clarasilva.art', 'https://instagram.com/clara.performance', '<p>Mon corps est mon medium. A travers la performance et la video, j explore les limites du visible et de l intime.</p>', true, false, 0.10, true, false),
  ('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-888888888888', 'noah-berg', 'Noah Berg', 'il', 'Copenhague', 'Danemark', 55.6761, 12.5683, 'https://noahberg.dk', NULL, '<p>Peintre abstrait. Mes toiles sont des paysages interieurs, des explosions de couleur pure. Acrylique, huile, tout ce qui laisse une trace.</p>', true, false, 0.10, false, true),
  ('dddddddd-1111-1111-1111-111111111111', '11111111-1111-1111-1111-999999999999', 'lea-fontaine', 'Lea Fontaine', 'elle', 'Nantes', 'France', 47.2184, -1.5536, 'https://leafontaine.fr', 'https://instagram.com/lea.illustre', '<p>Illustratrice jeunesse et autrice de BD. Mes dessins racontent des histoires de mondes imaginaires peuples de creatures fantastiques.</p>', true, false, 0.10, true, false),
  ('eeeeeeee-1111-1111-1111-111111111111', '11111111-1111-1111-1111-aaaaaaaaaaaa', 'marco-vitali', 'Marco Vitali', 'il', 'Venise', 'Italie', 45.4408, 12.3155, 'https://marcovitali.photo', 'https://instagram.com/marco.landscape', '<p>Photographe de paysage. De la lagune venitienne aux Dolomites, je capture la beaute sauvage de l Italie et au-dela.</p>', true, true, 0.08, true, true),
  ('ffffffff-1111-1111-1111-111111111111', '11111111-1111-1111-1111-bbbbbbbbbbbb', 'ines-garcia', 'Ines Garcia', 'elle', 'Barcelone', 'Espagne', 41.3874, 2.1686, 'https://inesgarcia.es', 'https://instagram.com/ines.sound', '<p>Artiste sonore et creatrice d installations immersives. Le son est invisible mais il peut tout transformer. Mes pieces explorent l espace par le son.</p>', true, false, 0.10, false, false);

-- ═══════════════════════════════════════════════
-- ARTWORK_SERIES (8 series)
-- ═══════════════════════════════════════════════

INSERT INTO artwork_series (id, artist_id, title, description, is_visible) VALUES
  ('50111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Lumieres de Paris', 'Serie sur la lumiere parisienne au fil des saisons', true),
  ('50222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Visages de Lyon', 'Portraits de rue dans les rues de Lyon', true),
  ('50333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Fractal Dreams', 'Exploration generative des fractales de Mandelbrot', true),
  ('50444444-4444-4444-4444-444444444444', 'a6666666-1111-1111-1111-111111111111', 'Quatre Saisons', 'Calligraphies inspirees des saisons japonaises', true),
  ('50555555-5555-5555-5555-555555555555', 'a7777777-1111-1111-1111-111111111111', 'Terre et Feu', 'Ceramiques cuites au bois dans un four anagama', true),
  ('50666666-6666-6666-6666-666666666666', 'cccccccc-1111-1111-1111-111111111111', 'Chromatic Explosions', 'Grandes toiles abstraites aux couleurs vibrantes', true),
  ('50777777-7777-7777-7777-777777777777', 'a9999999-1111-1111-1111-111111111111', 'Paysages d Europe de l Est', 'Aquarelles des plus beaux paysages polonais et tcheques', true),
  ('50888888-8888-8888-8888-888888888888', 'eeeeeeee-1111-1111-1111-111111111111', 'Italie Sauvage', 'Photographies grand format de la nature italienne', true);

-- ═══════════════════════════════════════════════
-- ARTWORKS (60+ oeuvres)
-- ═══════════════════════════════════════════════

INSERT INTO artworks (id, artist_id, title, story_html, medium, year_created, dimensions, price, status, primary_image_url, slug, series_id, series_order, published_at, tags, is_price_visible, accepts_offers, view_count, wishlist_count) VALUES
  -- ═══ Marie Dupont — Peinture (6 oeuvres) ═══
  ('a0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'Aube sur Montmartre', '<p>Peinte un matin de janvier depuis la fenetre de mon atelier. La brume se levait sur les toits de Paris.</p>', 'painting', 2025, '60 x 80 cm', 1200.00, 'published', 'https://picsum.photos/seed/aube-montmartre/800/600', 'aube-sur-montmartre', '50111111-1111-1111-1111-111111111111', 1, NOW() - INTERVAL '30 days', ARRAY['paris', 'lumiere', 'peinture', 'montmartre'], true, true, 342, 12),
  ('a0000001-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'Seine au crepuscule', '<p>Les reflets de la Seine un soir d ete. L eau capte les dernieres lueurs du jour.</p>', 'painting', 2025, '80 x 100 cm', 1800.00, 'published', 'https://picsum.photos/seed/seine-crepuscule/800/600', 'seine-au-crepuscule', '50111111-1111-1111-1111-111111111111', 2, NOW() - INTERVAL '25 days', ARRAY['paris', 'seine', 'peinture', 'crepuscule'], true, true, 287, 8),
  ('a0000001-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', 'Jardin secret', '<p>Huile sur toile inspiree du jardin du Luxembourg. Les ombres dansent entre les arbres.</p>', 'painting', 2024, '50 x 70 cm', 950.00, 'published', 'https://picsum.photos/seed/jardin-secret/800/600', 'jardin-secret', NULL, NULL, NOW() - INTERVAL '60 days', ARRAY['jardin', 'nature', 'peinture', 'luxembourg'], true, false, 198, 5),
  ('a0000001-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', 'Esquisse nocturne', NULL, 'illustration', 2025, '30 x 40 cm', 450.00, 'draft', 'https://picsum.photos/seed/esquisse-nocturne/800/600', 'esquisse-nocturne', NULL, NULL, NULL, ARRAY['esquisse', 'nuit'], true, false, 0, 0),
  ('a0000001-0000-0000-0000-000000000005', 'a1111111-1111-1111-1111-111111111111', 'Toits de Belleville', '<p>Vue plongeante sur les toits de Belleville au petit matin.</p>', 'painting', 2025, '70 x 90 cm', 1500.00, 'published', 'https://picsum.photos/seed/toits-belleville/800/600', 'toits-de-belleville', '50111111-1111-1111-1111-111111111111', 3, NOW() - INTERVAL '10 days', ARRAY['paris', 'belleville', 'toits', 'peinture'], true, true, 156, 7),
  ('a0000001-0000-0000-0000-000000000006', 'a1111111-1111-1111-1111-111111111111', 'Pont des Arts', '<p>Le pont des Arts un dimanche de mars. Aquarelle et encre sur papier.</p>', 'painting', 2024, '40 x 50 cm', 680.00, 'sold', 'https://picsum.photos/seed/pont-des-arts/800/600', 'pont-des-arts', '50111111-1111-1111-1111-111111111111', 4, NOW() - INTERVAL '90 days', ARRAY['paris', 'pont', 'aquarelle'], true, false, 423, 15),

  -- ═══ Lucas Martin — Photographie (6 oeuvres) ═══
  ('a0000002-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'Passage pietonne', '<p>Une femme traverse sous la pluie, place Bellecour. Le reflet sur le pave mouille.</p>', 'photography', 2025, '60 x 40 cm', 350.00, 'published', 'https://picsum.photos/seed/passage-pietonne/800/600', 'passage-pietonne', '50222222-2222-2222-2222-222222222222', 1, NOW() - INTERVAL '20 days', ARRAY['lyon', 'rue', 'pluie', 'noir-et-blanc'], true, false, 189, 6),
  ('a0000002-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', 'Le vendeur de journaux', '<p>Portrait d un kiosquier de la Presqu ile. Un metier en voie de disparition.</p>', 'photography', 2024, '40 x 60 cm', 280.00, 'published', 'https://picsum.photos/seed/vendeur-journaux/800/600', 'vendeur-journaux', '50222222-2222-2222-2222-222222222222', 2, NOW() - INTERVAL '45 days', ARRAY['lyon', 'portrait', 'rue', 'metier'], true, false, 145, 3),
  ('a0000002-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', 'Metro Berlin', '<p>Le U-Bahn a 6h du matin, personne. Le silence d une ville qui dort encore.</p>', 'photography', 2025, '80 x 53 cm', 420.00, 'published', 'https://picsum.photos/seed/metro-berlin/800/600', 'metro-berlin', NULL, NULL, NOW() - INTERVAL '15 days', ARRAY['berlin', 'metro', 'urbain', 'solitude'], true, true, 267, 9),
  ('a0000002-0000-0000-0000-000000000004', 'a2222222-2222-2222-2222-222222222222', 'Ombres jumelles', NULL, 'photography', 2025, '60 x 40 cm', 300.00, 'published', 'https://picsum.photos/seed/ombres-jumelles/800/600', 'ombres-jumelles', NULL, NULL, NOW() - INTERVAL '18 days', ARRAY['ombre', 'abstrait', 'geometrie'], true, false, 98, 2),
  ('a0000002-0000-0000-0000-000000000005', 'a2222222-2222-2222-2222-222222222222', 'Cafe du matin', '<p>Un homme lit son journal au comptoir. Lumiere doree a travers la vitre.</p>', 'photography', 2025, '50 x 70 cm', 380.00, 'published', 'https://picsum.photos/seed/cafe-matin/800/600', 'cafe-du-matin', '50222222-2222-2222-2222-222222222222', 3, NOW() - INTERVAL '8 days', ARRAY['cafe', 'lyon', 'lumiere', 'quotidien'], true, false, 112, 4),
  ('a0000002-0000-0000-0000-000000000006', 'a2222222-2222-2222-2222-222222222222', 'Escaliers de Croix-Rousse', '<p>Les traboules de Lyon, un labyrinthe de lumiere et d ombre.</p>', 'photography', 2024, '70 x 50 cm', 450.00, 'sold', 'https://picsum.photos/seed/escaliers-croix-rousse/800/600', 'escaliers-croix-rousse', '50222222-2222-2222-2222-222222222222', 4, NOW() - INTERVAL '80 days', ARRAY['lyon', 'traboule', 'escalier', 'architecture'], true, false, 356, 11),

  -- ═══ Sophie Bernard — Digital (6 oeuvres) ═══
  ('a0000003-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'Fractal Dream #01', '<p>Premiere piece de ma serie generative explorant les fractales de Mandelbrot. 10 000 iterations.</p>', 'digital', 2025, '4000 x 4000 px', 500.00, 'published', 'https://picsum.photos/seed/fractal-01/800/800', 'fractal-dream-01', '50333333-3333-3333-3333-333333333333', 1, NOW() - INTERVAL '35 days', ARRAY['generatif', 'fractal', 'digital', 'mandelbrot'], true, false, 534, 18),
  ('a0000003-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', 'Fractal Dream #02', '<p>Variation en bleu et or. Les spirales infinies se deploient.</p>', 'digital', 2025, '4000 x 4000 px', 500.00, 'published', 'https://picsum.photos/seed/fractal-02/800/800', 'fractal-dream-02', '50333333-3333-3333-3333-333333333333', 2, NOW() - INTERVAL '32 days', ARRAY['generatif', 'fractal', 'digital', 'bleu'], true, false, 412, 14),
  ('a0000003-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', 'Neural Garden', '<p>Paysage genere par un reseau de neurones entraine sur des jardins japonais. La machine reve de nature.</p>', 'digital', 2024, '6000 x 4000 px', 750.00, 'published', 'https://picsum.photos/seed/neural-garden/800/600', 'neural-garden', NULL, NULL, NOW() - INTERVAL '50 days', ARRAY['IA', 'jardin', 'digital', 'japonais'], true, true, 678, 22),
  ('a0000003-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 'Glitch Portrait', '<p>Autoportrait corrompu par algorithme. Les pixels racontent une autre verite.</p>', 'digital', 2025, '3000 x 3000 px', 600.00, 'published', 'https://picsum.photos/seed/glitch-portrait/800/800', 'glitch-portrait', NULL, NULL, NOW() - INTERVAL '22 days', ARRAY['glitch', 'portrait', 'digital', 'corruption'], true, false, 321, 10),
  ('a0000003-0000-0000-0000-000000000005', 'a3333333-3333-3333-3333-333333333333', 'Fractal Dream #03', '<p>Troisieme variation. Rouge et noir, comme une tempete de donnees.</p>', 'digital', 2025, '4000 x 4000 px', 500.00, 'published', 'https://picsum.photos/seed/fractal-03/800/800', 'fractal-dream-03', '50333333-3333-3333-3333-333333333333', 3, NOW() - INTERVAL '12 days', ARRAY['generatif', 'fractal', 'digital', 'rouge'], true, false, 198, 7),
  ('a0000003-0000-0000-0000-000000000006', 'a3333333-3333-3333-3333-333333333333', 'Data Flowers', '<p>Des fleurs qui poussent a partir de datasets. Chaque petale est un point de donnees.</p>', 'digital', 2025, '5000 x 5000 px', 850.00, 'published', 'https://picsum.photos/seed/data-flowers/800/800', 'data-flowers', NULL, NULL, NOW() - INTERVAL '5 days', ARRAY['data', 'fleur', 'generatif', 'digital'], true, true, 89, 3),

  -- ═══ Thomas Leroy — Sculpture (5 oeuvres) ═══
  ('a0000004-0000-0000-0000-000000000001', 'a4444444-4444-4444-4444-444444444444', 'Tension I', '<p>Acier et bois. La rencontre entre l industriel et l organique.</p>', 'sculpture', 2024, '120 x 40 x 40 cm', 3500.00, 'published', 'https://picsum.photos/seed/tension-1/800/600', 'tension-i', NULL, NULL, NOW() - INTERVAL '40 days', ARRAY['acier', 'bois', 'sculpture', 'tension'], true, true, 203, 6),
  ('a0000004-0000-0000-0000-000000000002', 'a4444444-4444-4444-4444-444444444444', 'Tension II', '<p>Suite de la serie. Pierre et metal. Le dialogue continue.</p>', 'sculpture', 2025, '80 x 30 x 30 cm', 2800.00, 'published', 'https://picsum.photos/seed/tension-2/800/600', 'tension-ii', NULL, NULL, NOW() - INTERVAL '28 days', ARRAY['pierre', 'metal', 'sculpture', 'tension'], true, true, 167, 4),
  ('a0000004-0000-0000-0000-000000000003', 'a4444444-4444-4444-4444-444444444444', 'Equilibre fragile', '<p>Ceramique en suspension. Un equilibre precaire qui defie la gravite.</p>', 'sculpture', 2025, '60 x 60 x 60 cm', 4200.00, 'published', 'https://picsum.photos/seed/equilibre-fragile/800/600', 'equilibre-fragile', NULL, NULL, NOW() - INTERVAL '16 days', ARRAY['ceramique', 'suspension', 'sculpture', 'equilibre'], true, false, 234, 8),
  ('a0000004-0000-0000-0000-000000000004', 'a4444444-4444-4444-4444-444444444444', 'Vague de fer', '<p>Tole pliee a la main. La rigidite du fer qui imite la fluidite de l eau.</p>', 'sculpture', 2024, '150 x 80 x 50 cm', 5500.00, 'published', 'https://picsum.photos/seed/vague-fer/800/600', 'vague-de-fer', NULL, NULL, NOW() - INTERVAL '55 days', ARRAY['fer', 'vague', 'sculpture', 'monumental'], true, true, 312, 11),
  ('a0000004-0000-0000-0000-000000000005', 'a4444444-4444-4444-4444-444444444444', 'Noeud', '<p>Bronze coule. Deux forces qui se lient et s opposent en meme temps.</p>', 'sculpture', 2025, '40 x 25 x 25 cm', 1800.00, 'reserved', 'https://picsum.photos/seed/noeud/800/600', 'noeud', NULL, NULL, NOW() - INTERVAL '7 days', ARRAY['bronze', 'noeud', 'sculpture'], true, false, 145, 5),

  -- ═══ Camille Moreau — Textile / Mixed (5 oeuvres) ═══
  ('a0000005-0000-0000-0000-000000000001', 'a5555555-5555-5555-5555-555555555555', 'Trame urbaine', '<p>Tissage sur metier integrant des fragments de plans de ville. Le tissu comme carte.</p>', 'textile', 2025, '150 x 100 cm', 1600.00, 'published', 'https://picsum.photos/seed/trame-urbaine/800/600', 'trame-urbaine', NULL, NULL, NOW() - INTERVAL '38 days', ARRAY['tissage', 'ville', 'textile', 'carte'], true, true, 178, 6),
  ('a0000005-0000-0000-0000-000000000002', 'a5555555-5555-5555-5555-555555555555', 'Carte sensible', '<p>Broderie et impression sur lin. Chaque point est un lieu visite.</p>', 'textile', 2024, '80 x 60 cm', 900.00, 'published', 'https://picsum.photos/seed/carte-sensible/800/600', 'carte-sensible', NULL, NULL, NOW() - INTERVAL '65 days', ARRAY['broderie', 'lin', 'textile', 'voyage'], true, false, 134, 4),
  ('a0000005-0000-0000-0000-000000000003', 'a5555555-5555-5555-5555-555555555555', 'Memoire de fil', '<p>Installation textile suspendue. Coton teint naturellement avec des plantes.</p>', 'mixed', 2025, '200 x 150 x 100 cm', 2200.00, 'published', 'https://picsum.photos/seed/memoire-fil/800/600', 'memoire-de-fil', NULL, NULL, NOW() - INTERVAL '20 days', ARRAY['installation', 'coton', 'mixed', 'teinture'], true, true, 223, 9),
  ('a0000005-0000-0000-0000-000000000004', 'a5555555-5555-5555-5555-555555555555', 'Fragment #7', '<p>Piece de la serie Fragments — collage textile et papier. Memoire et deconstruction.</p>', 'mixed', 2025, '40 x 40 cm', 380.00, 'published', 'https://picsum.photos/seed/fragment-7/800/600', 'fragment-7', NULL, NULL, NOW() - INTERVAL '14 days', ARRAY['collage', 'papier', 'mixed', 'fragment'], true, false, 87, 2),
  ('a0000005-0000-0000-0000-000000000005', 'a5555555-5555-5555-5555-555555555555', 'Racines', '<p>Tapisserie grand format. Les fils s entremelent comme des racines.</p>', 'textile', 2024, '180 x 120 cm', 2800.00, 'sold', 'https://picsum.photos/seed/racines/800/600', 'racines', NULL, NULL, NOW() - INTERVAL '100 days', ARRAY['tapisserie', 'racines', 'textile', 'nature'], true, false, 445, 16),

  -- ═══ Yuki Tanaka — Calligraphie / Encre (5 oeuvres) ═══
  ('a0000006-0000-0000-0000-000000000001', 'a6666666-1111-1111-1111-111111111111', 'Printemps — 春', '<p>Le kanji du printemps, trace d un seul geste. Encre sumi sur washi.</p>', 'drawing', 2025, '50 x 70 cm', 800.00, 'published', 'https://picsum.photos/seed/printemps-kanji/800/600', 'printemps-haru', '50444444-4444-4444-4444-444444444444', 1, NOW() - INTERVAL '42 days', ARRAY['calligraphie', 'japon', 'encre', 'printemps'], true, false, 298, 11),
  ('a0000006-0000-0000-0000-000000000002', 'a6666666-1111-1111-1111-111111111111', 'Ete — 夏', '<p>L ete en un trait. La chaleur se lit dans l epaisseur de l encre.</p>', 'drawing', 2025, '50 x 70 cm', 800.00, 'published', 'https://picsum.photos/seed/ete-kanji/800/600', 'ete-natsu', '50444444-4444-4444-4444-444444444444', 2, NOW() - INTERVAL '36 days', ARRAY['calligraphie', 'japon', 'encre', 'ete'], true, false, 245, 9),
  ('a0000006-0000-0000-0000-000000000003', 'a6666666-1111-1111-1111-111111111111', 'Automne — 秋', '<p>Les feuilles tombent dans le trait du pinceau.</p>', 'drawing', 2025, '50 x 70 cm', 800.00, 'published', 'https://picsum.photos/seed/automne-kanji/800/600', 'automne-aki', '50444444-4444-4444-4444-444444444444', 3, NOW() - INTERVAL '28 days', ARRAY['calligraphie', 'japon', 'encre', 'automne'], true, false, 212, 8),
  ('a0000006-0000-0000-0000-000000000004', 'a6666666-1111-1111-1111-111111111111', 'Hiver — 冬', '<p>Le silence de l hiver. Encre diluee, presque transparente.</p>', 'drawing', 2025, '50 x 70 cm', 800.00, 'published', 'https://picsum.photos/seed/hiver-kanji/800/600', 'hiver-fuyu', '50444444-4444-4444-4444-444444444444', 4, NOW() - INTERVAL '18 days', ARRAY['calligraphie', 'japon', 'encre', 'hiver'], true, false, 189, 7),
  ('a0000006-0000-0000-0000-000000000005', 'a6666666-1111-1111-1111-111111111111', 'Montagne et Eau', '<p>Sansui — paysage traditionnel reinterprete. Encre sur soie.</p>', 'drawing', 2024, '80 x 120 cm', 1500.00, 'published', 'https://picsum.photos/seed/montagne-eau/800/600', 'montagne-et-eau', NULL, NULL, NOW() - INTERVAL '70 days', ARRAY['sansui', 'paysage', 'encre', 'soie'], true, true, 367, 14),

  -- ═══ Elena Rossi — Ceramique (4 oeuvres) ═══
  ('a0000007-0000-0000-0000-000000000001', 'a7777777-1111-1111-1111-111111111111', 'Vase Lune', '<p>Grand vase tourne a la main. Email celadon inspire des Song.</p>', 'sculpture', 2025, '35 x 35 x 50 cm', 1200.00, 'published', 'https://picsum.photos/seed/vase-lune/800/600', 'vase-lune', '50555555-5555-5555-5555-555555555555', 1, NOW() - INTERVAL '25 days', ARRAY['ceramique', 'vase', 'celadon', 'florence'], true, false, 178, 6),
  ('a0000007-0000-0000-0000-000000000002', 'a7777777-1111-1111-1111-111111111111', 'Bol Wabi', '<p>Bol a the dans l esprit wabi-sabi. Les imperfections sont sa beaute.</p>', 'sculpture', 2025, '12 x 12 x 8 cm', 280.00, 'published', 'https://picsum.photos/seed/bol-wabi/800/600', 'bol-wabi', '50555555-5555-5555-5555-555555555555', 2, NOW() - INTERVAL '20 days', ARRAY['ceramique', 'bol', 'wabi-sabi', 'the'], true, false, 145, 5),
  ('a0000007-0000-0000-0000-000000000003', 'a7777777-1111-1111-1111-111111111111', 'Plat Terre', '<p>Grand plat en gres. Cuisson au bois pendant 72 heures.</p>', 'sculpture', 2024, '45 x 45 x 5 cm', 650.00, 'published', 'https://picsum.photos/seed/plat-terre/800/600', 'plat-terre', '50555555-5555-5555-5555-555555555555', 3, NOW() - INTERVAL '55 days', ARRAY['ceramique', 'gres', 'cuisson-bois', 'plat'], true, false, 198, 7),
  ('a0000007-0000-0000-0000-000000000004', 'a7777777-1111-1111-1111-111111111111', 'Sculpture Organique', '<p>Forme libre en porcelaine. Emaillage a la cendre de bois.</p>', 'sculpture', 2025, '25 x 20 x 30 cm', 950.00, 'published', 'https://picsum.photos/seed/sculpture-organique/800/600', 'sculpture-organique', NULL, NULL, NOW() - INTERVAL '10 days', ARRAY['porcelaine', 'organique', 'ceramique', 'cendre'], true, true, 112, 4),

  -- ═══ Omar Hassan — Street Art / Peinture (4 oeuvres) ═══
  ('a0000008-0000-0000-0000-000000000001', 'a8888888-1111-1111-1111-111111111111', 'Mur de Casablanca #1', '<p>Fresque realisee dans le quartier de l ancienne medina. Spray et acrylique.</p>', 'painting', 2025, '300 x 200 cm', 2500.00, 'published', 'https://picsum.photos/seed/mur-casa-1/800/600', 'mur-de-casablanca-1', NULL, NULL, NOW() - INTERVAL '33 days', ARRAY['street-art', 'casablanca', 'graffiti', 'medina'], true, true, 456, 15),
  ('a0000008-0000-0000-0000-000000000002', 'a8888888-1111-1111-1111-111111111111', 'Visage Mosaic', '<p>Portrait en mosaique de spray. 50 couches de couleur superposees.</p>', 'painting', 2025, '150 x 150 cm', 1800.00, 'published', 'https://picsum.photos/seed/visage-mosaic/800/600', 'visage-mosaic', NULL, NULL, NOW() - INTERVAL '22 days', ARRAY['portrait', 'mosaique', 'spray', 'street-art'], true, false, 334, 12),
  ('a0000008-0000-0000-0000-000000000003', 'a8888888-1111-1111-1111-111111111111', 'Calligraphie Urbaine', '<p>Fusion de calligraphie arabe et graffiti. L identite en lettres.</p>', 'mixed', 2024, '200 x 100 cm', 3200.00, 'published', 'https://picsum.photos/seed/calligraphie-urbaine/800/600', 'calligraphie-urbaine', NULL, NULL, NOW() - INTERVAL '48 days', ARRAY['calligraphie', 'arabe', 'graffiti', 'identite'], true, true, 523, 19),
  ('a0000008-0000-0000-0000-000000000004', 'a8888888-1111-1111-1111-111111111111', 'Fenetre sur Cour', '<p>Peinture sur fenetre recuperee. Le cadre fait partie de l oeuvre.</p>', 'mixed', 2025, '80 x 60 cm', 900.00, 'published', 'https://picsum.photos/seed/fenetre-cour/800/600', 'fenetre-sur-cour', NULL, NULL, NOW() - INTERVAL '11 days', ARRAY['recup', 'fenetre', 'mixed', 'street-art'], true, false, 98, 3),

  -- ═══ Anna Kowalski — Aquarelle (4 oeuvres) ═══
  ('a0000009-0000-0000-0000-000000000001', 'a9999999-1111-1111-1111-111111111111', 'Tatras au petit matin', '<p>Les montagnes Tatras dans la brume matinale. Aquarelle wet-on-wet.</p>', 'painting', 2025, '40 x 60 cm', 550.00, 'published', 'https://picsum.photos/seed/tatras-matin/800/600', 'tatras-au-petit-matin', '50777777-7777-7777-7777-777777777777', 1, NOW() - INTERVAL '26 days', ARRAY['aquarelle', 'tatras', 'pologne', 'montagne'], true, false, 167, 6),
  ('a0000009-0000-0000-0000-000000000002', 'a9999999-1111-1111-1111-111111111111', 'Prague en automne', '<p>Le pont Charles sous les feuilles d automne. Aquarelle et encre.</p>', 'painting', 2024, '50 x 35 cm', 480.00, 'published', 'https://picsum.photos/seed/prague-automne/800/600', 'prague-en-automne', '50777777-7777-7777-7777-777777777777', 2, NOW() - INTERVAL '52 days', ARRAY['aquarelle', 'prague', 'automne', 'pont'], true, false, 234, 9),
  ('a0000009-0000-0000-0000-000000000003', 'a9999999-1111-1111-1111-111111111111', 'Lac Morskie Oko', '<p>Le lac le plus celebre de Pologne. L eau turquoise reflete les sommets.</p>', 'painting', 2025, '60 x 40 cm', 620.00, 'published', 'https://picsum.photos/seed/morskie-oko/800/600', 'lac-morskie-oko', '50777777-7777-7777-7777-777777777777', 3, NOW() - INTERVAL '15 days', ARRAY['aquarelle', 'lac', 'pologne', 'nature'], true, true, 189, 7),
  ('a0000009-0000-0000-0000-000000000004', 'a9999999-1111-1111-1111-111111111111', 'Cracovie sous la neige', '<p>La place du marche couverte de neige. Le temps s arrete.</p>', 'painting', 2025, '45 x 55 cm', 520.00, 'published', 'https://picsum.photos/seed/cracovie-neige/800/600', 'cracovie-sous-la-neige', NULL, NULL, NOW() - INTERVAL '8 days', ARRAY['aquarelle', 'cracovie', 'neige', 'hiver'], true, false, 78, 2),

  -- ═══ Felix Dubois — Gravure (4 oeuvres) ═══
  ('a0000010-0000-0000-0000-000000000001', 'aaaaaaaa-1111-1111-1111-111111111111', 'Foret noire', '<p>Linogravure grand format. Arbres en negatif, le vide dessine la forme.</p>', 'print', 2025, '60 x 80 cm', 350.00, 'published', 'https://picsum.photos/seed/foret-noire/800/600', 'foret-noire', NULL, NULL, NOW() - INTERVAL '30 days', ARRAY['linogravure', 'foret', 'noir-et-blanc', 'print'], true, false, 145, 5),
  ('a0000010-0000-0000-0000-000000000002', 'aaaaaaaa-1111-1111-1111-111111111111', 'Vol de corbeaux', '<p>Gravure sur bois. Edition de 30 exemplaires numerotes.</p>', 'print', 2024, '40 x 50 cm', 220.00, 'published', 'https://picsum.photos/seed/vol-corbeaux/800/600', 'vol-de-corbeaux', NULL, NULL, NOW() - INTERVAL '45 days', ARRAY['gravure', 'oiseau', 'bois', 'edition'], true, false, 112, 3),
  ('a0000010-0000-0000-0000-000000000003', 'aaaaaaaa-1111-1111-1111-111111111111', 'Portrait a l eau-forte', '<p>Eau-forte sur cuivre. Le visage emerge de l acide.</p>', 'print', 2025, '30 x 40 cm', 280.00, 'published', 'https://picsum.photos/seed/eau-forte/800/600', 'portrait-eau-forte', NULL, NULL, NOW() - INTERVAL '18 days', ARRAY['eau-forte', 'portrait', 'cuivre', 'print'], true, false, 98, 4),
  ('a0000010-0000-0000-0000-000000000004', 'aaaaaaaa-1111-1111-1111-111111111111', 'Carte du Monde', '<p>Linogravure sur papier japonais. Notre monde en deux couleurs.</p>', 'print', 2025, '100 x 70 cm', 450.00, 'published', 'https://picsum.photos/seed/carte-monde/800/600', 'carte-du-monde', NULL, NULL, NOW() - INTERVAL '6 days', ARRAY['linogravure', 'carte', 'monde', 'papier-japonais'], true, true, 67, 1),

  -- ═══ Clara Silva — Performance / Video (3 oeuvres) ═══
  ('a0000011-0000-0000-0000-000000000001', 'bbbbbbbb-1111-1111-1111-111111111111', 'Corps / Espace #1', '<p>Documentation video d une performance de 4 heures. Le corps occupe l espace vide.</p>', 'video', 2025, '1920 x 1080 px, 12 min', 1200.00, 'published', 'https://picsum.photos/seed/corps-espace/800/600', 'corps-espace-1', NULL, NULL, NOW() - INTERVAL '35 days', ARRAY['performance', 'video', 'corps', 'espace'], true, false, 187, 6),
  ('a0000011-0000-0000-0000-000000000002', 'bbbbbbbb-1111-1111-1111-111111111111', 'Echoes', '<p>Installation video a 3 ecrans. Les gestes se repetent et se transforment.</p>', 'video', 2024, '3x 4K, 8 min loop', 2500.00, 'published', 'https://picsum.photos/seed/echoes/800/600', 'echoes', NULL, NULL, NOW() - INTERVAL '60 days', ARRAY['installation', 'video', 'loop', 'geste'], true, true, 234, 8),
  ('a0000011-0000-0000-0000-000000000003', 'bbbbbbbb-1111-1111-1111-111111111111', 'Respiration', '<p>Performance filmee. Un souffle, amplifie et visualise en temps reel.</p>', 'performance', 2025, 'Duree variable', 800.00, 'published', 'https://picsum.photos/seed/respiration/800/600', 'respiration', NULL, NULL, NOW() - INTERVAL '12 days', ARRAY['performance', 'souffle', 'temps-reel', 'corps'], true, false, 123, 4),

  -- ═══ Noah Berg — Peinture abstraite (5 oeuvres) ═══
  ('a0000012-0000-0000-0000-000000000001', 'cccccccc-1111-1111-1111-111111111111', 'Explosion Bleu', '<p>Grande toile. Le bleu cobalt envahit tout. Acrylique et pigment pur.</p>', 'painting', 2025, '200 x 150 cm', 4500.00, 'published', 'https://picsum.photos/seed/explosion-bleu/800/600', 'explosion-bleu', '50666666-6666-6666-6666-666666666666', 1, NOW() - INTERVAL '24 days', ARRAY['abstrait', 'bleu', 'acrylique', 'grand-format'], true, true, 345, 13),
  ('a0000012-0000-0000-0000-000000000002', 'cccccccc-1111-1111-1111-111111111111', 'Rouge Incandescent', '<p>Huile sur toile. Le rouge vibre, pulse, respire.</p>', 'painting', 2025, '180 x 120 cm', 3800.00, 'published', 'https://picsum.photos/seed/rouge-incandescent/800/600', 'rouge-incandescent', '50666666-6666-6666-6666-666666666666', 2, NOW() - INTERVAL '19 days', ARRAY['abstrait', 'rouge', 'huile', 'vibration'], true, true, 278, 10),
  ('a0000012-0000-0000-0000-000000000003', 'cccccccc-1111-1111-1111-111111111111', 'Noir Lumiere', '<p>Le noir n est pas l absence de lumiere. C est toutes les lumieres ensemble.</p>', 'painting', 2024, '150 x 150 cm', 3200.00, 'published', 'https://picsum.photos/seed/noir-lumiere/800/600', 'noir-lumiere', '50666666-6666-6666-6666-666666666666', 3, NOW() - INTERVAL '50 days', ARRAY['abstrait', 'noir', 'lumiere', 'monochrome'], true, false, 412, 15),
  ('a0000012-0000-0000-0000-000000000004', 'cccccccc-1111-1111-1111-111111111111', 'Jaune Solaire', '<p>Pigment de cadmium sur toile brute. Le soleil en peinture.</p>', 'painting', 2025, '120 x 120 cm', 2600.00, 'published', 'https://picsum.photos/seed/jaune-solaire/800/600', 'jaune-solaire', '50666666-6666-6666-6666-666666666666', 4, NOW() - INTERVAL '9 days', ARRAY['abstrait', 'jaune', 'solaire', 'cadmium'], true, true, 134, 5),
  ('a0000012-0000-0000-0000-000000000005', 'cccccccc-1111-1111-1111-111111111111', 'Horizon Zero', '<p>La ligne d horizon n existe pas. Acrylique diluee sur toile non preparee.</p>', 'painting', 2025, '250 x 100 cm', 5200.00, 'published', 'https://picsum.photos/seed/horizon-zero/800/600', 'horizon-zero', NULL, NULL, NOW() - INTERVAL '3 days', ARRAY['abstrait', 'horizon', 'panoramique', 'minimal'], true, true, 56, 2),

  -- ═══ Lea Fontaine — Illustration (4 oeuvres) ═══
  ('a0000013-0000-0000-0000-000000000001', 'dddddddd-1111-1111-1111-111111111111', 'La Foret des Lucioles', '<p>Illustration pour un album jeunesse. Aquarelle et encre.</p>', 'illustration', 2025, '30 x 40 cm', 450.00, 'published', 'https://picsum.photos/seed/foret-lucioles/800/600', 'la-foret-des-lucioles', NULL, NULL, NOW() - INTERVAL '28 days', ARRAY['illustration', 'jeunesse', 'foret', 'lucioles'], true, false, 234, 9),
  ('a0000013-0000-0000-0000-000000000002', 'dddddddd-1111-1111-1111-111111111111', 'Dragon des Neiges', '<p>Creature imaginaire pour une BD en cours. Encre et aquarelle.</p>', 'illustration', 2025, '40 x 50 cm', 380.00, 'published', 'https://picsum.photos/seed/dragon-neiges/800/600', 'dragon-des-neiges', NULL, NULL, NOW() - INTERVAL '17 days', ARRAY['illustration', 'dragon', 'fantastique', 'BD'], true, false, 312, 12),
  ('a0000013-0000-0000-0000-000000000003', 'dddddddd-1111-1111-1111-111111111111', 'Ville Flottante', '<p>Paysage imaginaire. Une cite qui vole au-dessus des nuages.</p>', 'illustration', 2024, '50 x 70 cm', 520.00, 'published', 'https://picsum.photos/seed/ville-flottante/800/600', 'ville-flottante', NULL, NULL, NOW() - INTERVAL '40 days', ARRAY['illustration', 'fantastique', 'ville', 'ciel'], true, true, 267, 10),
  ('a0000013-0000-0000-0000-000000000004', 'dddddddd-1111-1111-1111-111111111111', 'Le Chat Cosmonaute', '<p>Mon personnage fetiche. Un chat qui explore l espace.</p>', 'illustration', 2025, '25 x 25 cm', 250.00, 'published', 'https://picsum.photos/seed/chat-cosmonaute/800/600', 'le-chat-cosmonaute', NULL, NULL, NOW() - INTERVAL '5 days', ARRAY['illustration', 'chat', 'espace', 'cute'], true, false, 456, 18),

  -- ═══ Marco Vitali — Photographie paysage (4 oeuvres) ═══
  ('a0000014-0000-0000-0000-000000000001', 'eeeeeeee-1111-1111-1111-111111111111', 'Dolomites au lever', '<p>Les Tre Cime di Lavaredo au lever du soleil. 4h de marche pour ce cliche.</p>', 'photography', 2025, '120 x 80 cm', 850.00, 'published', 'https://picsum.photos/seed/dolomites-lever/800/600', 'dolomites-au-lever', '50888888-8888-8888-8888-888888888888', 1, NOW() - INTERVAL '21 days', ARRAY['dolomites', 'montagne', 'lever', 'italie'], true, false, 389, 14),
  ('a0000014-0000-0000-0000-000000000002', 'eeeeeeee-1111-1111-1111-111111111111', 'Lagune de Venise', '<p>La lagune a maree basse. Le silence entre terre et mer.</p>', 'photography', 2025, '100 x 60 cm', 720.00, 'published', 'https://picsum.photos/seed/lagune-venise/800/600', 'lagune-de-venise', '50888888-8888-8888-8888-888888888888', 2, NOW() - INTERVAL '15 days', ARRAY['venise', 'lagune', 'eau', 'silence'], true, true, 267, 10),
  ('a0000014-0000-0000-0000-000000000003', 'eeeeeeee-1111-1111-1111-111111111111', 'Toscane Doree', '<p>Les collines de Toscane au coucher du soleil. L or liquide.</p>', 'photography', 2024, '90 x 60 cm', 680.00, 'published', 'https://picsum.photos/seed/toscane-doree/800/600', 'toscane-doree', '50888888-8888-8888-8888-888888888888', 3, NOW() - INTERVAL '45 days', ARRAY['toscane', 'collines', 'coucher', 'or'], true, false, 345, 12),
  ('a0000014-0000-0000-0000-000000000004', 'eeeeeeee-1111-1111-1111-111111111111', 'Etna Fumant', '<p>L Etna vu depuis Taormina. Le volcan crache un filet de fumee blanche.</p>', 'photography', 2025, '80 x 120 cm', 950.00, 'published', 'https://picsum.photos/seed/etna-fumant/800/600', 'etna-fumant', NULL, NULL, NOW() - INTERVAL '7 days', ARRAY['etna', 'volcan', 'sicile', 'fumee'], true, true, 123, 4),

  -- ═══ Ines Garcia — Audio / Installation (3 oeuvres) ═══
  ('a0000015-0000-0000-0000-000000000001', 'ffffffff-1111-1111-1111-111111111111', 'Frequences de Barcelone', '<p>Installation sonore 8 canaux. Les sons de la ville captures et retransmis en boucle.</p>', 'audio', 2025, '8 canaux, 45 min loop', 1800.00, 'published', 'https://picsum.photos/seed/frequences-bcn/800/600', 'frequences-de-barcelone', NULL, NULL, NOW() - INTERVAL '30 days', ARRAY['son', 'installation', 'barcelone', 'immersif'], true, false, 156, 5),
  ('a0000015-0000-0000-0000-000000000002', 'ffffffff-1111-1111-1111-111111111111', 'Murmures', '<p>Piece sonore pour casque. 100 voix superposees chuchotent.</p>', 'audio', 2024, 'Stereo, 20 min', 600.00, 'published', 'https://picsum.photos/seed/murmures/800/600', 'murmures', NULL, NULL, NOW() - INTERVAL '50 days', ARRAY['voix', 'audio', 'intime', 'chuchotement'], true, false, 98, 3),
  ('a0000015-0000-0000-0000-000000000003', 'ffffffff-1111-1111-1111-111111111111', 'Resonance', '<p>Installation dans une eglise desacralisee. Le son sculpte l espace.</p>', 'audio', 2025, 'Site specific, 60 min', 3500.00, 'published', 'https://picsum.photos/seed/resonance/800/600', 'resonance', NULL, NULL, NOW() - INTERVAL '14 days', ARRAY['resonance', 'eglise', 'installation', 'spatial'], true, true, 87, 2);

-- ═══════════════════════════════════════════════
-- CARNET_POSTS (15 posts)
-- ═══════════════════════════════════════════════

INSERT INTO carnet_posts (id, artist_id, type, caption, body_html, media_urls, linked_artwork_id, comments_enabled) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'photo', 'En cours de travail sur une nouvelle piece de la serie Lumieres de Paris...', NULL, ARRAY['https://picsum.photos/seed/post-marie-1/800/600'], 'a0000001-0000-0000-0000-000000000001', true),
  ('b0000001-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'text', NULL, '<p>Reflexion du jour : la lumiere hivernale a quelque chose de melancolique que j essaie de capturer dans chaque toile. Ce matin, le soleil rasant sur les toits de zinc avait une qualite presque surnaturelle.</p>', ARRAY[]::text[], NULL, true),
  ('b0000002-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'photo', 'Session photo dans le Vieux Lyon ce matin. Lumiere parfaite.', NULL, ARRAY['https://picsum.photos/seed/post-lucas-1/800/600'], NULL, true),
  ('b0000003-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'photo', 'Preview de Neural Garden — bientot disponible sur ma galerie.', NULL, ARRAY['https://picsum.photos/seed/post-sophie-1/800/600'], 'a0000003-0000-0000-0000-000000000003', true),
  ('b0000005-0000-0000-0000-000000000001', 'a5555555-5555-5555-5555-555555555555', 'photo', 'Nouveau metier, nouvelles possibilites. Preparation de Trame urbaine.', NULL, ARRAY['https://picsum.photos/seed/post-camille-1/800/600'], 'a0000005-0000-0000-0000-000000000001', true),
  ('b0000006-0000-0000-0000-000000000001', 'a6666666-1111-1111-1111-111111111111', 'photo', 'Le pinceau trempe dans l encre sumi. L attente avant le geste.', NULL, ARRAY['https://picsum.photos/seed/post-yuki-1/800/600'], 'a0000006-0000-0000-0000-000000000001', true),
  ('b0000006-0000-0000-0000-000000000002', 'a6666666-1111-1111-1111-111111111111', 'text', NULL, '<p>La calligraphie c est 90% de meditation et 10% de geste. Aujourd hui j ai passe 3 heures a preparer mon encre. Le resultat : un seul trait. Parfait.</p>', ARRAY[]::text[], NULL, true),
  ('b0000008-0000-0000-0000-000000000001', 'a8888888-1111-1111-1111-111111111111', 'photo', 'Nouveau mur en cours dans le quartier Habous. 3 jours de travail.', NULL, ARRAY['https://picsum.photos/seed/post-omar-1/800/600', 'https://picsum.photos/seed/post-omar-2/800/600'], NULL, true),
  ('b0000012-0000-0000-0000-000000000001', 'cccccccc-1111-1111-1111-111111111111', 'photo', 'L atelier ce matin. Du bleu partout, sur les murs, sur moi, sur le sol.', NULL, ARRAY['https://picsum.photos/seed/post-noah-1/800/600'], 'a0000012-0000-0000-0000-000000000001', true),
  ('b0000013-0000-0000-0000-000000000001', 'dddddddd-1111-1111-1111-111111111111', 'photo', 'Le Chat Cosmonaute est ne ! Voici les premieres esquisses.', NULL, ARRAY['https://picsum.photos/seed/post-lea-1/800/600'], 'a0000013-0000-0000-0000-000000000004', true),
  ('b0000014-0000-0000-0000-000000000001', 'eeeeeeee-1111-1111-1111-111111111111', 'photo', '4h du matin. Reveil dans les Dolomites. La lumiere valait le sacrifice du sommeil.', NULL, ARRAY['https://picsum.photos/seed/post-marco-1/800/600'], 'a0000014-0000-0000-0000-000000000001', true),
  ('b0000014-0000-0000-0000-000000000002', 'eeeeeeee-1111-1111-1111-111111111111', 'text', NULL, '<p>La photographie de paysage est un exercice de patience. Attendre la bonne lumiere, le bon nuage, le bon moment. Hier, j ai attendu 6 heures pour une photo. Et elle est parfaite.</p>', ARRAY[]::text[], NULL, true),
  ('b0000007-0000-0000-0000-000000000001', 'a7777777-1111-1111-1111-111111111111', 'photo', 'Ouverture du four anagama apres 72 heures de cuisson. Chaque piece est une surprise.', NULL, ARRAY['https://picsum.photos/seed/post-elena-1/800/600', 'https://picsum.photos/seed/post-elena-2/800/600'], 'a0000007-0000-0000-0000-000000000001', true),
  ('b0000009-0000-0000-0000-000000000001', 'a9999999-1111-1111-1111-111111111111', 'photo', 'Seance aquarelle en plein air dans les Tatras. Le vent complique tout mais le resultat est la.', NULL, ARRAY['https://picsum.photos/seed/post-anna-1/800/600'], 'a0000009-0000-0000-0000-000000000001', true),
  ('b0000015-0000-0000-0000-000000000001', 'ffffffff-1111-1111-1111-111111111111', 'text', NULL, '<p>Enregistrement dans l eglise desacralisee ce matin. L acoustique est incroyable. 12 secondes de reverb. Le silence lui-meme devient du son.</p>', ARRAY[]::text[], NULL, true);

-- ═══════════════════════════════════════════════
-- REACTIONS (35+ reactions)
-- ═══════════════════════════════════════════════

INSERT INTO reactions (user_id, post_id, type) VALUES
  -- Jean aime beaucoup de posts
  ('66666666-6666-6666-6666-666666666666', 'b0000001-0000-0000-0000-000000000001', 'touched'),
  ('66666666-6666-6666-6666-666666666666', 'b0000002-0000-0000-0000-000000000001', 'want'),
  ('66666666-6666-6666-6666-666666666666', 'b0000003-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-666666666666', 'b0000006-0000-0000-0000-000000000001', 'touched'),
  ('66666666-6666-6666-6666-666666666666', 'b0000008-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-666666666666', 'b0000012-0000-0000-0000-000000000001', 'want'),
  ('66666666-6666-6666-6666-666666666666', 'b0000013-0000-0000-0000-000000000001', 'touched'),
  -- Alice aussi
  ('77777777-7777-7777-7777-777777777777', 'b0000001-0000-0000-0000-000000000001', 'want'),
  ('77777777-7777-7777-7777-777777777777', 'b0000005-0000-0000-0000-000000000001', 'touched'),
  ('77777777-7777-7777-7777-777777777777', 'b0000006-0000-0000-0000-000000000001', 'touched'),
  ('77777777-7777-7777-7777-777777777777', 'b0000014-0000-0000-0000-000000000001', 'want'),
  ('77777777-7777-7777-7777-777777777777', 'b0000013-0000-0000-0000-000000000001', 'share'),
  -- Paul
  ('66666666-6666-6666-6666-222222222222', 'b0000003-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-222222222222', 'b0000012-0000-0000-0000-000000000001', 'want'),
  ('66666666-6666-6666-6666-222222222222', 'b0000008-0000-0000-0000-000000000001', 'share'),
  -- Lucie
  ('66666666-6666-6666-6666-333333333333', 'b0000001-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-333333333333', 'b0000007-0000-0000-0000-000000000001', 'touched'),
  ('66666666-6666-6666-6666-333333333333', 'b0000014-0000-0000-0000-000000000001', 'want'),
  ('66666666-6666-6666-6666-333333333333', 'b0000009-0000-0000-0000-000000000001', 'touched'),
  -- Hugo
  ('66666666-6666-6666-6666-444444444444', 'b0000001-0000-0000-0000-000000000001', 'share'),
  ('66666666-6666-6666-6666-444444444444', 'b0000006-0000-0000-0000-000000000002', 'touched'),
  ('66666666-6666-6666-6666-444444444444', 'b0000012-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-444444444444', 'b0000008-0000-0000-0000-000000000001', 'want'),
  -- Chloe
  ('66666666-6666-6666-6666-888888888888', 'b0000013-0000-0000-0000-000000000001', 'want'),
  ('66666666-6666-6666-6666-888888888888', 'b0000005-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-888888888888', 'b0000001-0000-0000-0000-000000000002', 'touched'),
  -- Romain
  ('66666666-6666-6666-6666-777777777777', 'b0000002-0000-0000-0000-000000000001', 'how'),
  ('66666666-6666-6666-6666-777777777777', 'b0000014-0000-0000-0000-000000000001', 'touched'),
  ('66666666-6666-6666-6666-777777777777', 'b0000014-0000-0000-0000-000000000002', 'touched');

-- ═══════════════════════════════════════════════
-- COMMENTS (20+ commentaires)
-- ═══════════════════════════════════════════════

INSERT INTO comments (id, post_id, user_id, body, parent_id) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Magnifique ! J adore la serie Lumieres de Paris. Hate de voir la suite.', NULL),
  ('c1000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Merci Jean ! La suite arrive tres bientot.', 'c1000001-0000-0000-0000-000000000001'),
  ('c1000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Les couleurs sont incroyables. C est de l huile ?', NULL),
  ('c1000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Oui, huile sur toile de lin. Merci Alice !', 'c1000001-0000-0000-0000-000000000003'),
  ('c1000002-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000001', '66666666-6666-6666-6666-777777777777', 'Le Vieux Lyon en photo, toujours un regal. Tu utilises quoi comme boitier ?', NULL),
  ('c1000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Leica M11, toujours fidele au poste ! Merci Romain.', 'c1000002-0000-0000-0000-000000000001'),
  ('c1000003-0000-0000-0000-000000000001', 'b0000003-0000-0000-0000-000000000001', '66666666-6666-6666-6666-222222222222', 'Fascinant. Quel langage tu utilises pour la generation ?', NULL),
  ('c1000003-0000-0000-0000-000000000002', 'b0000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Processing principalement, avec du GLSL pour les shaders. Je publierai le code source bientot !', 'c1000003-0000-0000-0000-000000000001'),
  ('c1000006-0000-0000-0000-000000000001', 'b0000006-0000-0000-0000-000000000001', '66666666-6666-6666-6666-333333333333', 'C est hypnotisant. La calligraphie japonaise m a toujours fascinee.', NULL),
  ('c1000006-0000-0000-0000-000000000002', 'b0000006-0000-0000-0000-000000000002', '66666666-6666-6666-6666-444444444444', '3 heures pour un trait... c est la definition de la maitrise.', NULL),
  ('c1000008-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Omar, tes fresques sont toujours aussi impressionnantes. Tu seras a Paris bientot ?', NULL),
  ('c1000008-0000-0000-0000-000000000002', 'b0000008-0000-0000-0000-000000000001', '11111111-1111-1111-1111-444444444444', 'Possible en juin ! Je vous tiendrai au courant.', 'c1000008-0000-0000-0000-000000000001'),
  ('c1000012-0000-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Du bleu partout 😂 Le resultat vaut le nettoyage j imagine ?', NULL),
  ('c1000012-0000-0000-0000-000000000002', 'b0000012-0000-0000-0000-000000000001', '11111111-1111-1111-1111-888888888888', 'Toujours ! Le bleu c est la couleur la plus difficile a enlever des mains.', 'c1000012-0000-0000-0000-000000000001'),
  ('c1000013-0000-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000001', '66666666-6666-6666-6666-888888888888', 'Le Chat Cosmonaute !! 😍 Je veux un tirage !', NULL),
  ('c1000013-0000-0000-0000-000000000002', 'b0000013-0000-0000-0000-000000000001', '11111111-1111-1111-1111-999999999999', 'Les tirages arrivent bientot sur la boutique ! Stay tuned.', 'c1000013-0000-0000-0000-000000000001'),
  ('c1000014-0000-0000-0000-000000000001', 'b0000014-0000-0000-0000-000000000001', '66666666-6666-6666-6666-777777777777', 'La lumiere est folle. 4h du mat, ca paie toujours en photo.', NULL),
  ('c1000007-0000-0000-0000-000000000001', 'b0000007-0000-0000-0000-000000000001', '66666666-6666-6666-6666-333333333333', 'La ceramique au bois c est tellement beau. Les couleurs sont naturelles ?', NULL),
  ('c1000007-0000-0000-0000-000000000002', 'b0000007-0000-0000-0000-000000000001', '11111111-1111-1111-1111-333333333333', 'Oui, tout est naturel ! Les cendres du bois creent l email pendant la cuisson. Chaque piece est unique.', 'c1000007-0000-0000-0000-000000000001'),
  ('c1000009-0000-0000-0000-000000000001', 'b0000009-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'L aquarelle en plein air avec du vent, c est du sport ! Bravo Anna.', NULL);

-- ═══════════════════════════════════════════════
-- FOLLOWS (30+ abonnements)
-- ═══════════════════════════════════════════════

INSERT INTO follows (follower_id, artist_id) VALUES
  -- Jean suit 6 artistes
  ('66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333'),
  ('66666666-6666-6666-6666-666666666666', 'a6666666-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', 'a8888888-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', 'cccccccc-1111-1111-1111-111111111111'),
  -- Alice suit 5 artistes
  ('77777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'a5555555-5555-5555-5555-555555555555'),
  ('77777777-7777-7777-7777-777777777777', 'a6666666-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'dddddddd-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'eeeeeeee-1111-1111-1111-111111111111'),
  -- Paul suit 4 artistes
  ('66666666-6666-6666-6666-222222222222', 'a3333333-3333-3333-3333-333333333333'),
  ('66666666-6666-6666-6666-222222222222', 'a8888888-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-222222222222', 'cccccccc-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-222222222222', 'ffffffff-1111-1111-1111-111111111111'),
  -- Lucie suit 5 artistes
  ('66666666-6666-6666-6666-333333333333', 'a1111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-333333333333', 'a6666666-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-333333333333', 'a7777777-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-333333333333', 'a9999999-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-333333333333', 'eeeeeeee-1111-1111-1111-111111111111'),
  -- Hugo suit 6 artistes
  ('66666666-6666-6666-6666-444444444444', 'a1111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-444444444444', 'a4444444-4444-4444-4444-444444444444'),
  ('66666666-6666-6666-6666-444444444444', 'a6666666-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-444444444444', 'a8888888-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-444444444444', 'cccccccc-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-444444444444', 'dddddddd-1111-1111-1111-111111111111'),
  -- Maya suit 3 artistes
  ('66666666-6666-6666-6666-555555555555', 'a1111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-555555555555', 'a3333333-3333-3333-3333-333333333333'),
  ('66666666-6666-6666-6666-555555555555', 'bbbbbbbb-1111-1111-1111-111111111111'),
  -- Romain suit 4 artistes
  ('66666666-6666-6666-6666-777777777777', 'a2222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-777777777777', 'eeeeeeee-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-777777777777', 'a9999999-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-777777777777', 'a8888888-1111-1111-1111-111111111111'),
  -- Chloe suit 5 artistes
  ('66666666-6666-6666-6666-888888888888', 'a5555555-5555-5555-5555-555555555555'),
  ('66666666-6666-6666-6666-888888888888', 'a7777777-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-888888888888', 'dddddddd-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-888888888888', 'a1111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-888888888888', 'cccccccc-1111-1111-1111-111111111111');

-- ═══════════════════════════════════════════════
-- WISHLISTS (25+ favoris)
-- ═══════════════════════════════════════════════

INSERT INTO wishlists (user_id, artwork_id) VALUES
  -- Jean
  ('66666666-6666-6666-6666-666666666666', 'a0000001-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-666666666666', 'a0000003-0000-0000-0000-000000000003'),
  ('66666666-6666-6666-6666-666666666666', 'a0000006-0000-0000-0000-000000000005'),
  ('66666666-6666-6666-6666-666666666666', 'a0000008-0000-0000-0000-000000000003'),
  ('66666666-6666-6666-6666-666666666666', 'a0000012-0000-0000-0000-000000000001'),
  -- Alice
  ('77777777-7777-7777-7777-777777777777', 'a0000001-0000-0000-0000-000000000002'),
  ('77777777-7777-7777-7777-777777777777', 'a0000005-0000-0000-0000-000000000001'),
  ('77777777-7777-7777-7777-777777777777', 'a0000006-0000-0000-0000-000000000001'),
  ('77777777-7777-7777-7777-777777777777', 'a0000013-0000-0000-0000-000000000004'),
  ('77777777-7777-7777-7777-777777777777', 'a0000014-0000-0000-0000-000000000001'),
  -- Paul
  ('66666666-6666-6666-6666-222222222222', 'a0000003-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-222222222222', 'a0000003-0000-0000-0000-000000000006'),
  ('66666666-6666-6666-6666-222222222222', 'a0000012-0000-0000-0000-000000000005'),
  -- Lucie
  ('66666666-6666-6666-6666-333333333333', 'a0000006-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-333333333333', 'a0000007-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-333333333333', 'a0000009-0000-0000-0000-000000000002'),
  ('66666666-6666-6666-6666-333333333333', 'a0000014-0000-0000-0000-000000000003'),
  -- Hugo
  ('66666666-6666-6666-6666-444444444444', 'a0000004-0000-0000-0000-000000000004'),
  ('66666666-6666-6666-6666-444444444444', 'a0000008-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-444444444444', 'a0000012-0000-0000-0000-000000000003'),
  -- Romain
  ('66666666-6666-6666-6666-777777777777', 'a0000002-0000-0000-0000-000000000003'),
  ('66666666-6666-6666-6666-777777777777', 'a0000014-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-777777777777', 'a0000002-0000-0000-0000-000000000005'),
  -- Chloe
  ('66666666-6666-6666-6666-888888888888', 'a0000005-0000-0000-0000-000000000003'),
  ('66666666-6666-6666-6666-888888888888', 'a0000013-0000-0000-0000-000000000004'),
  ('66666666-6666-6666-6666-888888888888', 'a0000007-0000-0000-0000-000000000002');

-- ═══════════════════════════════════════════════
-- CONVERSATIONS (8 conversations)
-- ═══════════════════════════════════════════════

INSERT INTO conversations (id, artwork_id, buyer_id, artist_id, last_message_at, buyer_unread, artist_unread) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours', 0, 0),
  ('c0000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day', 1, 0),
  ('c0000001-0000-0000-0000-000000000003', 'a0000008-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'a8888888-1111-1111-1111-111111111111', NOW() - INTERVAL '3 hours', 0, 1),
  ('c0000001-0000-0000-0000-000000000004', 'a0000012-0000-0000-0000-000000000001', '66666666-6666-6666-6666-444444444444', 'cccccccc-1111-1111-1111-111111111111', NOW() - INTERVAL '5 hours', 0, 0),
  ('c0000001-0000-0000-0000-000000000005', 'a0000006-0000-0000-0000-000000000001', '66666666-6666-6666-6666-333333333333', 'a6666666-1111-1111-1111-111111111111', NOW() - INTERVAL '12 hours', 0, 1),
  ('c0000001-0000-0000-0000-000000000006', 'a0000004-0000-0000-0000-000000000004', '66666666-6666-6666-6666-444444444444', 'a4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day', 0, 0),
  ('c0000001-0000-0000-0000-000000000007', 'a0000014-0000-0000-0000-000000000001', '66666666-6666-6666-6666-777777777777', 'eeeeeeee-1111-1111-1111-111111111111', NOW() - INTERVAL '6 hours', 1, 0),
  ('c0000001-0000-0000-0000-000000000008', 'a0000013-0000-0000-0000-000000000004', '66666666-6666-6666-6666-888888888888', 'dddddddd-1111-1111-1111-111111111111', NOW() - INTERVAL '30 minutes', 0, 1);

-- ═══════════════════════════════════════════════
-- MESSAGES (25+ messages)
-- ═══════════════════════════════════════════════

INSERT INTO messages (conversation_id, sender_id, body, type, status) VALUES
  -- Conv 1 : Jean <-> Marie (Aube sur Montmartre)
  ('c0000001-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Bonjour Marie, je suis interesse par Aube sur Montmartre. Est-elle toujours disponible ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Bonjour Jean ! Oui, elle est toujours disponible. Souhaitez-vous plus de details sur les dimensions ou la technique ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Oui, j aimerais savoir si le cadre est inclus et si vous faites la livraison ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Le cadre en bois de chene est inclus. La livraison est possible en region parisienne, sinon j utilise un transporteur specialise.', 'text', 'read'),

  -- Conv 2 : Alice <-> Sophie (Neural Garden)
  ('c0000001-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'Bonjour, Neural Garden est magnifique. Quel est le format d impression ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Merci beaucoup ! L impression est sur papier Hahnemuhle Photo Rag 308g, format 60x40cm. Edition limitee a 10 exemplaires.', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'Parfait. Il en reste combien de disponibles ?', 'text', 'delivered'),

  -- Conv 3 : Jean <-> Omar (Calligraphie Urbaine)
  ('c0000001-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'Salam Omar ! Calligraphie Urbaine est incroyable. C est une piece unique ou il y a des prints ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-444444444444', 'Salam Jean ! C est une piece unique, originale. Pas de print prevus pour celle-ci.', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'D accord. Le prix est negociable ?', 'text', 'sent'),

  -- Conv 4 : Hugo <-> Noah (Explosion Bleu)
  ('c0000001-0000-0000-0000-000000000004', '66666666-6666-6666-6666-444444444444', 'Bonjour Noah, je suis galeriste a Bordeaux et Explosion Bleu m interesse pour une exposition collective. On peut en discuter ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-888888888888', 'Bonjour Hugo ! Avec plaisir. L exposition est prevue pour quand ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000004', '66666666-6666-6666-6666-444444444444', 'Debut septembre. On prepare un accrochage sur le theme de la couleur pure.', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-888888888888', 'Ca m interesse beaucoup ! Je peux aussi proposer Rouge Incandescent qui irait bien avec.', 'text', 'read'),

  -- Conv 5 : Lucie <-> Yuki (Printemps)
  ('c0000001-0000-0000-0000-000000000005', '66666666-6666-6666-6666-333333333333', 'Bonjour Yuki, la serie des Quatre Saisons est sublime. Est-ce possible d acheter les 4 ensemble ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-222222222222', 'Bonjour Lucie ! Oui, c est possible. Je peux offrir un prix special pour l ensemble de la serie.', 'text', 'sent'),

  -- Conv 6 : Hugo <-> Thomas (Vague de fer)
  ('c0000001-0000-0000-0000-000000000006', '66666666-6666-6666-6666-444444444444', 'Thomas, Vague de fer est spectaculaire. Le transport est-il complique pour une piece de cette taille ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'Elle fait 50kg, il faut un transporteur specialise. Je travaille avec Cadre en Seine qui gere l art de grand format.', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000006', '66666666-6666-6666-6666-444444444444', 'Ok parfait, j ai deja travaille avec eux. On peut avancer.', 'text', 'read'),

  -- Conv 7 : Romain <-> Marco (Dolomites)
  ('c0000001-0000-0000-0000-000000000007', '66666666-6666-6666-6666-777777777777', 'Marco, tes photos des Dolomites sont a couper le souffle. Tu vends aussi en grand format ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-aaaaaaaaaaaa', 'Ciao Romain ! Oui, je peux faire des tirages jusqu a 180x120cm sur alu Dibond. Le rendu est incroyable.', 'text', 'delivered'),

  -- Conv 8 : Chloe <-> Lea (Chat Cosmonaute)
  ('c0000001-0000-0000-0000-000000000008', '66666666-6666-6666-6666-888888888888', 'Lea ! Le Chat Cosmonaute est trop mignon. Tu fais des prints ?', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-999999999999', 'Oui ! J ai des prints A4 a 25€ et A3 a 45€. L original est aussi disponible bien sur !', 'text', 'read'),
  ('c0000001-0000-0000-0000-000000000008', '66666666-6666-6666-6666-888888888888', 'Je prends un A3 ! Et en fait... l original aussi ca m interesse. On peut negocier ?', 'text', 'sent');

-- ═══════════════════════════════════════════════
-- TRANSACTIONS (8 ventes completees + 2 en cours)
-- ═══════════════════════════════════════════════

INSERT INTO transactions (id, artwork_id, buyer_id, artist_id, conversation_id, amount, platform_fee, artist_amount, currency, status, paid_at, transferred_at, guest_email, guest_name) VALUES
  -- Ventes completees
  ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', NULL, 680.00, 54.40, 625.60, 'eur', 'completed', NOW() - INTERVAL '85 days', NOW() - INTERVAL '82 days', NULL, NULL),
  ('d0000001-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000006', '66666666-6666-6666-6666-777777777777', 'a2222222-2222-2222-2222-222222222222', NULL, 450.00, 36.00, 414.00, 'eur', 'completed', NOW() - INTERVAL '75 days', NOW() - INTERVAL '72 days', NULL, NULL),
  ('d0000001-0000-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000005', '77777777-7777-7777-7777-777777777777', 'a5555555-5555-5555-5555-555555555555', NULL, 2800.00, 280.00, 2520.00, 'eur', 'completed', NOW() - INTERVAL '95 days', NOW() - INTERVAL '92 days', NULL, NULL),
  ('d0000001-0000-0000-0000-000000000004', 'a0000003-0000-0000-0000-000000000001', '66666666-6666-6666-6666-222222222222', 'a3333333-3333-3333-3333-333333333333', NULL, 500.00, 50.00, 450.00, 'eur', 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '27 days', NULL, NULL),
  -- Vente par un acheteur invite (guest checkout)
  ('d0000001-0000-0000-0000-000000000005', 'a0000009-0000-0000-0000-000000000002', NULL, 'a9999999-1111-1111-1111-111111111111', NULL, 480.00, 48.00, 432.00, 'eur', 'completed', NOW() - INTERVAL '45 days', NOW() - INTERVAL '42 days', 'guest@example.com', 'Pierre Durand'),
  -- Vente internationale
  ('d0000001-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000005', '66666666-6666-6666-6666-333333333333', 'a6666666-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000005', 1500.00, 150.00, 1350.00, 'eur', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', NULL, NULL),
  -- Grosse vente sculpture
  ('d0000001-0000-0000-0000-000000000007', 'a0000004-0000-0000-0000-000000000004', '66666666-6666-6666-6666-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c0000001-0000-0000-0000-000000000006', 5500.00, 550.00, 4950.00, 'eur', 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '17 days', NULL, NULL),
  -- Vente completee Fractal
  ('d0000001-0000-0000-0000-000000000008', 'a0000003-0000-0000-0000-000000000002', '66666666-6666-6666-6666-555555555555', 'a3333333-3333-3333-3333-333333333333', NULL, 500.00, 50.00, 450.00, 'eur', 'completed', NOW() - INTERVAL '28 days', NOW() - INTERVAL '25 days', NULL, NULL),

  -- Transactions en cours
  ('d0000001-0000-0000-0000-000000000009', 'a0000004-0000-0000-0000-000000000005', '66666666-6666-6666-6666-666666666666', 'a4444444-4444-4444-4444-444444444444', NULL, 1800.00, 180.00, 1620.00, 'eur', 'processing', NULL, NULL, NULL, NULL),
  ('d0000001-0000-0000-0000-000000000010', 'a0000012-0000-0000-0000-000000000001', '66666666-6666-6666-6666-444444444444', 'cccccccc-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000004', 4500.00, 450.00, 4050.00, 'eur', 'pending', NULL, NULL, NULL, NULL);

-- ═══════════════════════════════════════════════
-- BUYER_COLLECTIONS (pieces achetees)
-- ═══════════════════════════════════════════════

INSERT INTO buyer_collections (user_id, transaction_id, artwork_id, artist_id, purchased_at, notes) VALUES
  ('66666666-6666-6666-6666-666666666666', 'd0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006', 'a1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '85 days', 'Ma premiere acquisition sur Bozzart !'),
  ('66666666-6666-6666-6666-777777777777', 'd0000001-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000006', 'a2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '75 days', 'Superbe photo pour le bureau'),
  ('77777777-7777-7777-7777-777777777777', 'd0000001-0000-0000-0000-000000000003', 'a0000005-0000-0000-0000-000000000005', 'a5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '95 days', 'Piece maitresse du salon'),
  ('66666666-6666-6666-6666-222222222222', 'd0000001-0000-0000-0000-000000000004', 'a0000003-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '30 days', NULL),
  ('66666666-6666-6666-6666-333333333333', 'd0000001-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000005', 'a6666666-1111-1111-1111-111111111111', NOW() - INTERVAL '15 days', 'Calligraphie magnifique, accrochee dans l entree'),
  ('66666666-6666-6666-6666-444444444444', 'd0000001-0000-0000-0000-000000000007', 'a0000004-0000-0000-0000-000000000004', 'a4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '20 days', 'Pour l expo Bordeaux septembre'),
  ('66666666-6666-6666-6666-555555555555', 'd0000001-0000-0000-0000-000000000008', 'a0000003-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '28 days', 'Art digital accrocheee sur ecran dans le studio');

-- ═══════════════════════════════════════════════
-- DROPS (3 evenements)
-- ═══════════════════════════════════════════════

INSERT INTO drops (id, artist_id, title, description, cover_url, status, starts_at, ends_at, is_sponsored) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'Fractal Dreams Collection', 'Lancement de la collection complete Fractal Dreams. 3 pieces generatives uniques.', 'https://picsum.photos/seed/drop-fractal/1200/600', 'active', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', false),
  ('e0000001-0000-0000-0000-000000000002', 'cccccccc-1111-1111-1111-111111111111', 'Chromatic Explosions', 'Exposition virtuelle des nouvelles toiles grand format de Noah Berg.', 'https://picsum.photos/seed/drop-chromatic/1200/600', 'scheduled', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days', true),
  ('e0000001-0000-0000-0000-000000000003', 'a6666666-1111-1111-1111-111111111111', 'Les Quatre Saisons — Yuki Tanaka', 'La serie complete des calligraphies saisonnieres de Yuki Tanaka.', 'https://picsum.photos/seed/drop-saisons/1200/600', 'ended', NOW() - INTERVAL '20 days', NOW() - INTERVAL '13 days', false);

-- ═══════════════════════════════════════════════
-- DROP_ARTWORKS
-- ═══════════════════════════════════════════════

INSERT INTO drop_artworks (drop_id, artwork_id, sort_order) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000001', 1),
  ('e0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000002', 2),
  ('e0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000005', 3),
  ('e0000001-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000001', 1),
  ('e0000001-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000002', 2),
  ('e0000001-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000003', 3),
  ('e0000001-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000004', 4),
  ('e0000001-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000005', 5),
  ('e0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000001', 1),
  ('e0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000002', 2),
  ('e0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000003', 3),
  ('e0000001-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000004', 4);

-- ═══════════════════════════════════════════════
-- DISCOVERY_SLOTS (14 creneaux sur 2 jours)
-- ═══════════════════════════════════════════════

INSERT INTO discovery_slots (artwork_id, curator_id, slot_date, slot_hour, notes) VALUES
  -- Aujourd'hui
  ('a0000001-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 8, 'Lumiere matinale, parfait pour cette piece'),
  ('a0000008-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 10, 'Street art pour le public du matin'),
  ('a0000003-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 12, 'Art digital pour la pause dejeuner'),
  ('a0000006-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 14, 'Calligraphie japonaise, moment zen'),
  ('a0000014-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 16, 'Paysage pour l apres-midi'),
  ('a0000012-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 18, 'Abstrait pour le soir'),
  ('a0000013-0000-0000-0000-000000000004', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, 20, 'Chat Cosmonaute pour finir en douceur'),
  -- Demain
  ('a0000002-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 8, NULL),
  ('a0000007-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 10, NULL),
  ('a0000009-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 12, NULL),
  ('a0000005-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 14, NULL),
  ('a0000011-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 16, NULL),
  ('a0000015-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 18, NULL),
  ('a0000004-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', CURRENT_DATE + 1, 20, NULL);

-- ═══════════════════════════════════════════════
-- NOTIFICATIONS (echantillon)
-- ═══════════════════════════════════════════════

INSERT INTO notifications (user_id, type, title, body, data, is_read, deep_link) VALUES
  -- Marie recoit des notifs
  ('11111111-1111-1111-1111-111111111111', 'sale', 'Vente !', 'Pont des Arts a ete vendu a Jean Petit pour 680€', '{"artwork_id": "a00000001-0000-0000-0000-000000000006", "amount": 680}', true, '/dashboard/sales'),
  ('11111111-1111-1111-1111-111111111111', 'new_follower', 'Nouvel abonne', 'Lucie Lambert vous suit maintenant', '{"follower_id": "66666666-6666-6666-6666-333333333333"}', true, '/artist/marie-dupont/followers'),
  ('11111111-1111-1111-1111-111111111111', 'message', 'Nouveau message', 'Jean Petit vous a envoye un message a propos de Aube sur Montmartre', '{"conversation_id": "c0000001-0000-0000-0000-000000000001"}', false, '/messages/c0000001-0000-0000-0000-000000000001'),
  -- Sophie
  ('33333333-3333-3333-3333-333333333333', 'sale', 'Vente !', 'Fractal Dream #01 vendu a Paul Mercier pour 500€', '{"artwork_id": "a00000003-0000-0000-0000-000000000001", "amount": 500}', true, '/dashboard/sales'),
  ('33333333-3333-3333-3333-333333333333', 'message', 'Nouveau message', 'Alice Roux a une question sur Neural Garden', '{"conversation_id": "c0000001-0000-0000-0000-000000000002"}', false, '/messages/c0000001-0000-0000-0000-000000000002'),
  ('33333333-3333-3333-3333-333333333333', 'drop_starting', 'Drop en cours', 'Votre drop Fractal Dreams Collection est actif !', '{"drop_id": "e0000001-0000-0000-0000-000000000001"}', true, '/drops/e0000001-0000-0000-0000-000000000001'),
  -- Yuki
  ('11111111-1111-1111-1111-222222222222', 'sale', 'Vente !', 'Montagne et Eau vendu a Lucie Lambert pour 1500€', '{"artwork_id": "a00000006-0000-0000-0000-000000000005", "amount": 1500}', true, '/dashboard/sales'),
  ('11111111-1111-1111-1111-222222222222', 'new_follower', 'Nouvel abonne', 'Hugo Blanc vous suit maintenant', '{"follower_id": "66666666-6666-6666-6666-444444444444"}', false, '/artist/yuki-tanaka/followers'),
  -- Thomas
  ('44444444-4444-4444-4444-444444444444', 'sale', 'Vente !', 'Vague de fer vendu a Hugo Blanc pour 5500€', '{"artwork_id": "a00000004-0000-0000-0000-000000000004", "amount": 5500}', true, '/dashboard/sales'),
  -- Noah
  ('11111111-1111-1111-1111-888888888888', 'new_follower', 'Nouvel abonne', 'Paul Mercier vous suit maintenant', '{"follower_id": "66666666-6666-6666-6666-222222222222"}', false, '/artist/noah-berg/followers'),
  ('11111111-1111-1111-1111-888888888888', 'message', 'Nouveau message', 'Hugo Blanc s interesse a Explosion Bleu', '{"conversation_id": "c0000001-0000-0000-0000-000000000004"}', true, '/messages/c0000001-0000-0000-0000-000000000004'),
  -- Lea
  ('11111111-1111-1111-1111-999999999999', 'new_follower', 'Nouvel abonne', 'Alice Roux vous suit', '{"follower_id": "77777777-7777-7777-7777-777777777777"}', false, '/artist/lea-fontaine/followers'),
  ('11111111-1111-1111-1111-999999999999', 'reaction', 'Nouvelle reaction', 'Chloe Duval veut Le Chat Cosmonaute', '{"post_id": "b00000013-0000-0000-0000-000000000001"}', false, '/carnet/p0000013-0000-0000-0000-000000000001'),
  -- Notifications acheteurs
  ('66666666-6666-6666-6666-666666666666', 'new_post', 'Nouveau post', 'Marie Dupont a publie dans son carnet', '{"post_id": "b00000001-0000-0000-0000-000000000001"}', true, '/carnet/p0000001-0000-0000-0000-000000000001'),
  ('66666666-6666-6666-6666-444444444444', 'drop_starting', 'Nouveau drop', 'Chromatic Explosions de Noah Berg commence dans 7 jours', '{"drop_id": "e0000001-0000-0000-0000-000000000002"}', false, '/drops/e0000001-0000-0000-0000-000000000002');

-- ═══════════════════════════════════════════════
-- ARTIST_ANALYTICS_DAILY (30 jours pour 5 artistes)
-- ═══════════════════════════════════════════════

-- Marie Dupont — artiste populaire
INSERT INTO artist_analytics_daily (artist_id, date, profile_views, artwork_views, new_followers, new_wishlists, messages_received, sales_count, sales_amount, discovery_impressions) VALUES
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 30, 45, 120, 2, 3, 1, 0, 0, 500),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 29, 52, 135, 1, 2, 0, 0, 0, 480),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 28, 38, 98, 0, 1, 2, 0, 0, 520),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 27, 61, 156, 3, 4, 1, 0, 0, 550),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 26, 55, 142, 1, 2, 0, 0, 0, 510),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 25, 72, 189, 4, 5, 3, 1, 680, 600),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 24, 48, 115, 1, 1, 0, 0, 0, 490),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 23, 43, 108, 0, 2, 1, 0, 0, 470),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 22, 56, 145, 2, 3, 0, 0, 0, 530),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 21, 67, 172, 2, 4, 2, 0, 0, 580),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 20, 51, 130, 1, 1, 1, 0, 0, 500),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 19, 44, 112, 0, 2, 0, 0, 0, 460),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 18, 58, 148, 1, 3, 1, 0, 0, 540),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 17, 63, 165, 2, 2, 0, 0, 0, 560),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 16, 47, 118, 0, 1, 1, 0, 0, 480),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 15, 54, 138, 1, 3, 0, 0, 0, 510),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 14, 69, 178, 3, 4, 2, 0, 0, 590),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 13, 42, 105, 0, 1, 0, 0, 0, 450),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 12, 57, 150, 1, 2, 1, 0, 0, 530),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 11, 65, 168, 2, 3, 0, 0, 0, 570),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 10, 78, 210, 5, 6, 3, 0, 0, 650),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 9, 53, 132, 1, 2, 1, 0, 0, 500),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 8, 46, 115, 0, 1, 0, 0, 0, 470),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 7, 59, 152, 2, 3, 1, 0, 0, 540),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 6, 71, 185, 3, 4, 2, 0, 0, 600),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 5, 49, 125, 1, 2, 0, 0, 0, 490),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 4, 55, 140, 1, 1, 1, 0, 0, 510),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 3, 64, 168, 2, 3, 0, 0, 0, 560),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 2, 73, 192, 3, 5, 2, 0, 0, 620),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 1, 58, 148, 1, 2, 1, 0, 0, 530);

-- Sophie Bernard — artiste digital tres suivie
INSERT INTO artist_analytics_daily (artist_id, date, profile_views, artwork_views, new_followers, new_wishlists, messages_received, sales_count, sales_amount, discovery_impressions) VALUES
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 14, 89, 234, 5, 7, 2, 0, 0, 800),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 13, 76, 198, 3, 5, 1, 0, 0, 750),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 12, 95, 256, 6, 8, 3, 1, 500, 850),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 11, 82, 215, 4, 6, 1, 0, 0, 780),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 10, 110, 298, 8, 10, 4, 0, 0, 920),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 9, 73, 189, 2, 4, 1, 0, 0, 720),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 8, 88, 228, 5, 6, 2, 0, 0, 790),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 7, 67, 175, 2, 3, 0, 0, 0, 680),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 6, 98, 265, 7, 9, 3, 1, 500, 860),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 5, 125, 340, 12, 15, 5, 0, 0, 1050),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 4, 102, 278, 6, 8, 2, 0, 0, 880),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 3, 85, 220, 4, 5, 1, 0, 0, 770),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 2, 93, 248, 5, 7, 3, 0, 0, 830),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE - 1, 108, 290, 7, 9, 2, 0, 0, 900);

-- Omar Hassan — en montee
INSERT INTO artist_analytics_daily (artist_id, date, profile_views, artwork_views, new_followers, new_wishlists, messages_received, sales_count, sales_amount, discovery_impressions) VALUES
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 7, 34, 89, 2, 3, 1, 0, 0, 350),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 6, 42, 112, 3, 4, 0, 0, 0, 400),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 5, 56, 145, 4, 5, 2, 0, 0, 480),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 4, 78, 198, 6, 8, 3, 0, 0, 600),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 3, 95, 256, 8, 10, 4, 0, 0, 720),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 2, 112, 302, 10, 12, 5, 0, 0, 850),
  ('a8888888-1111-1111-1111-111111111111', CURRENT_DATE - 1, 135, 368, 14, 16, 6, 0, 0, 980);

-- Marco Vitali — regulier
INSERT INTO artist_analytics_daily (artist_id, date, profile_views, artwork_views, new_followers, new_wishlists, messages_received, sales_count, sales_amount, discovery_impressions) VALUES
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 7, 28, 75, 1, 2, 0, 0, 0, 280),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 6, 32, 85, 2, 2, 1, 0, 0, 300),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 5, 35, 92, 1, 3, 0, 0, 0, 320),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 4, 30, 78, 1, 1, 1, 0, 0, 290),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 3, 38, 98, 2, 3, 0, 0, 0, 340),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 2, 42, 110, 2, 4, 1, 0, 0, 370),
  ('eeeeeeee-1111-1111-1111-111111111111', CURRENT_DATE - 1, 36, 95, 1, 2, 0, 0, 0, 330);

-- Lea Fontaine — pic viral avec Le Chat Cosmonaute
INSERT INTO artist_analytics_daily (artist_id, date, profile_views, artwork_views, new_followers, new_wishlists, messages_received, sales_count, sales_amount, discovery_impressions) VALUES
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 7, 15, 42, 1, 1, 0, 0, 0, 150),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 6, 18, 48, 1, 2, 0, 0, 0, 170),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 5, 145, 456, 25, 18, 8, 0, 0, 1200),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 4, 312, 890, 48, 35, 15, 0, 0, 2500),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 3, 245, 678, 32, 24, 12, 0, 0, 1800),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 2, 156, 423, 18, 14, 6, 0, 0, 1100),
  ('dddddddd-1111-1111-1111-111111111111', CURRENT_DATE - 1, 98, 278, 10, 8, 4, 0, 0, 750);

-- ═══════════════════════════════════════════════
-- UPDATE des compteurs denormalises sur artist_profiles
-- (les triggers ne s executent que sur INSERT/UPDATE en temps reel)
-- ═══════════════════════════════════════════════

UPDATE artist_profiles SET follower_count = 8, artwork_count = 5, total_sales_count = 1, total_sales_amount = 680 WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 2, artwork_count = 5, total_sales_count = 1, total_sales_amount = 450 WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE artist_profiles SET follower_count = 3, artwork_count = 6, total_sales_count = 2, total_sales_amount = 1000 WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE artist_profiles SET follower_count = 1, artwork_count = 5, total_sales_count = 2, total_sales_amount = 7300 WHERE id = 'a4444444-4444-4444-4444-444444444444';
UPDATE artist_profiles SET follower_count = 2, artwork_count = 4, total_sales_count = 1, total_sales_amount = 2800 WHERE id = 'a5555555-5555-5555-5555-555555555555';
UPDATE artist_profiles SET follower_count = 4, artwork_count = 5, total_sales_count = 1, total_sales_amount = 1500 WHERE id = 'a6666666-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 2, artwork_count = 4 WHERE id = 'a7777777-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 4, artwork_count = 4 WHERE id = 'a8888888-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 2, artwork_count = 4, total_sales_count = 1, total_sales_amount = 480 WHERE id = 'a9999999-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 0, artwork_count = 4 WHERE id = 'aaaaaaaa-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 1, artwork_count = 3 WHERE id = 'bbbbbbbb-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 4, artwork_count = 5 WHERE id = 'cccccccc-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 3, artwork_count = 4 WHERE id = 'dddddddd-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 3, artwork_count = 4 WHERE id = 'eeeeeeee-1111-1111-1111-111111111111';
UPDATE artist_profiles SET follower_count = 1, artwork_count = 3 WHERE id = 'ffffffff-1111-1111-1111-111111111111';

