"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { validateSlug } from "@bozzart/core";
import { toast } from "sonner";

type Step = "slug" | "identity" | "first-artwork";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>("slug");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1 : slug
  const [slug, setSlug] = useState("");

  // Step 2 : identite
  const [fullName, setFullName] = useState(profile?.displayName || "");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("France");
  const [bio, setBio] = useState("");

  // Step 3 : premiere oeuvre
  const [artworkTitle, setArtworkTitle] = useState("");
  const [artworkPrice, setArtworkPrice] = useState("");
  const [artworkImageUrl, setArtworkImageUrl] = useState("");

  async function handleSlugStep() {
    setFieldErrors({});
    const validation = validateSlug(slug);
    if (!validation.valid) {
      setFieldErrors({ slug: validation.error || "Slug invalide" });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: existing, error } = await supabase
      .from("artist_profiles")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") {
      toast.error("Erreur lors de la vérification du slug : " + error.message);
      return;
    }

    if (existing) {
      setFieldErrors({ slug: "Ce slug est déjà pris" });
      return;
    }

    setStep("identity");
  }

  async function handleIdentityStep() {
    setFieldErrors({});
    if (!fullName.trim()) {
      setFieldErrors({ fullName: "Le nom est obligatoire" });
      return;
    }
    setStep("first-artwork");
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    setFieldErrors({});

    const supabase = createSupabaseBrowserClient();

    // Mettre à jour le rôle du profil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "artist", bio: bio || null })
      .eq("id", user.id);

    if (profileError) {
      toast.error("Erreur lors de la mise à jour du profil : " + profileError.message);
      setSaving(false);
      return;
    }

    // Creer le profil artiste
    const { data: artistProfile, error: artistError } = await supabase
      .from("artist_profiles")
      .insert({
        user_id: user.id,
        slug,
        full_name: fullName,
        location_city: locationCity || null,
        location_country: locationCountry || null,
      })
      .select()
      .single();

    if (artistError) {
      toast.error("Erreur lors de la création du profil artiste : " + artistError.message);
      setSaving(false);
      return;
    }

    // Creer la premiere oeuvre si renseignee
    if (artworkTitle && artworkPrice && artworkImageUrl && artistProfile) {
      const { error: artworkError } = await supabase.from("artworks").insert({
        artist_id: artistProfile.id,
        title: artworkTitle,
        price: parseFloat(artworkPrice),
        primary_image_url: artworkImageUrl,
        medium: "other",
        status: "published",
        published_at: new Date().toISOString(),
        slug: artworkTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      });

      if (artworkError) {
        toast.error("Erreur lors de la création de l'œuvre : " + artworkError.message);
        // Continue anyway since the artist profile was created
      }
    }

    toast.success("Galerie créée avec succès !");
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md rounded-xl bg-background p-8 shadow-lg">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {(["slug", "identity", "first-artwork"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                (["slug", "identity", "first-artwork"] as Step[]).indexOf(step) >= i
                  ? "bg-black"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {step === "slug" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Choisissez votre URL</h1>
              <p className="mt-1 text-gray-600">C&apos;est l&apos;adresse de votre galerie</p>
            </div>
            <div>
              <label htmlFor="onboarding-slug" className="block text-sm font-medium text-gray-700">Slug</label>
              <div className="mt-1 flex items-center rounded-md border border-gray-300">
                <span className="px-3 text-sm text-gray-500">bozzart.art/</span>
                <input
                  id="onboarding-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 rounded-r-md border-0 px-2 py-2 focus:outline-none"
                  placeholder="marie-dupont"
                />
              </div>
              {fieldErrors.slug && <p className="mt-1 text-sm text-red-600">{fieldErrors.slug}</p>}
            </div>
            <button onClick={handleSlugStep} className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
              Continuer
            </button>
          </div>
        )}

        {step === "identity" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Votre identité</h1>
              <p className="mt-1 text-gray-600">Comment les collectionneurs vous découvriront</p>
            </div>
            <div>
              <label htmlFor="onboarding-fullName" className="block text-sm font-medium text-gray-700">Nom complet *</label>
              <input id="onboarding-fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              {fieldErrors.fullName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="onboarding-locationCity" className="block text-sm font-medium text-gray-700">Ville</label>
                <input id="onboarding-locationCity" type="text" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label htmlFor="onboarding-locationCountry" className="block text-sm font-medium text-gray-700">Pays</label>
                <input id="onboarding-locationCountry" type="text" value={locationCountry} onChange={(e) => setLocationCountry(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
            </div>
            <div>
              <label htmlFor="onboarding-bio" className="block text-sm font-medium text-gray-700">Bio courte</label>
              <textarea id="onboarding-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="En quelques mots..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("slug")} className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">Retour</button>
              <button onClick={handleIdentityStep} className="flex-1 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">Continuer</button>
            </div>
          </div>
        )}

        {step === "first-artwork" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Votre première œuvre</h1>
              <p className="mt-1 text-gray-600">Optionnel — vous pourrez en ajouter plus tard</p>
            </div>
            <div>
              <label htmlFor="onboarding-artworkTitle" className="block text-sm font-medium text-gray-700">Titre</label>
              <input id="onboarding-artworkTitle" type="text" value={artworkTitle} onChange={(e) => setArtworkTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="onboarding-artworkPrice" className="block text-sm font-medium text-gray-700">Prix (EUR)</label>
              <input id="onboarding-artworkPrice" type="number" value={artworkPrice} onChange={(e) => setArtworkPrice(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="onboarding-artworkImageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
              <input id="onboarding-artworkImageUrl" type="url" value={artworkImageUrl} onChange={(e) => setArtworkImageUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("identity")} className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">Retour</button>
              <button onClick={handleFinish} disabled={saving} className="flex-1 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
                {saving ? "Création..." : artworkTitle ? "Créer ma galerie" : "Passer et créer ma galerie"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
