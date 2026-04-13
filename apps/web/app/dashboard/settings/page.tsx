"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { toast } from "sonner";

export default function SettingsPage() {
  const { profile, artistProfile, isArtist } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Champs artiste
  const [fullName, setFullName] = useState(artistProfile?.fullName || "");
  const [locationCity, setLocationCity] = useState(artistProfile?.locationCity || "");
  const [locationCountry, setLocationCountry] = useState(artistProfile?.locationCountry || "");
  const [websiteUrl, setWebsiteUrl] = useState(artistProfile?.websiteUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(artistProfile?.instagramUrl || "");
  const [storyHtml, setStoryHtml] = useState(artistProfile?.storyHtml || "");
  const [silenceMessaging, setSilenceMessaging] = useState(artistProfile?.silenceMessaging || false);
  const [messagingFilter, setMessagingFilter] = useState<string>(artistProfile?.messagingFilter || "all");

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    // Sauvegarder le profil de base
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("id", profile?.id);

    if (profileError) {
      toast.error("Erreur lors de la sauvegarde du profil : " + profileError.message);
      setSaving(false);
      return;
    }

    // Sauvegarder le profil artiste si applicable
    if (isArtist && artistProfile) {
      const { error: artistError } = await supabase
        .from("artist_profiles")
        .update({
          full_name: fullName,
          location_city: locationCity,
          location_country: locationCountry,
          website_url: websiteUrl || null,
          instagram_url: instagramUrl || null,
          story_html: storyHtml || null,
          silence_messaging: silenceMessaging,
          messaging_filter: messagingFilter,
        })
        .eq("id", artistProfile.id);

      if (artistError) {
        toast.error("Erreur lors de la sauvegarde du profil artiste : " + artistError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSaved(true);
    toast.success("Paramètres enregistrés !");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <div className="mt-8 max-w-lg space-y-6">
        <div>
          <label htmlFor="settings-displayName" className="block text-sm font-medium text-gray-700">Nom affiché</label>
          <input
            id="settings-displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="settings-bio" className="block text-sm font-medium text-gray-700">Bio courte</label>
          <textarea
            id="settings-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {isArtist && (
          <>
            <hr className="my-6" />
            <h2 className="text-lg font-semibold">Profil artiste</h2>

            <div>
              <label htmlFor="settings-fullName" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                id="settings-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-locationCity" className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  id="settings-locationCity"
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="settings-locationCountry" className="block text-sm font-medium text-gray-700">Pays</label>
                <input
                  id="settings-locationCountry"
                  type="text"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="settings-websiteUrl" className="block text-sm font-medium text-gray-700">Site web</label>
              <input
                id="settings-websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="settings-instagramUrl" className="block text-sm font-medium text-gray-700">Instagram</label>
              <input
                id="settings-instagramUrl"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mon histoire</label>
              <RichTextEditor
                content={storyHtml}
                onChange={setStoryHtml}
                placeholder="Racontez votre parcours artistique..."
              />
            </div>

            {/* Mode Silence & Messagerie */}
            <div className="rounded-md border bg-gray-50 p-4 space-y-3">
              <h3 className="font-medium">Messagerie & Mode Silence</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={silenceMessaging}
                  onChange={(e) => setSilenceMessaging(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Mode Silence — désactiver temporairement la messagerie</span>
              </label>
              <div>
                <label htmlFor="settings-messagingFilter" className="block text-sm text-gray-700">Qui peut me contacter</label>
                <select
                  id="settings-messagingFilter"
                  value={messagingFilter}
                  onChange={(e) => setMessagingFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">Tout le monde</option>
                  <option value="buyers_only">Acheteurs uniquement</option>
                </select>
              </div>
            </div>

            {/* Suppression de compte */}
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <h3 className="font-medium text-red-700">Zone de danger</h3>
              <Link href="/dashboard/settings/delete" className="mt-2 inline-block text-sm text-red-600 hover:underline">
                Supprimer mon compte
              </Link>
            </div>

            <div className="rounded-md border bg-gray-50 p-4">
              <h3 className="font-medium">Stripe Connect</h3>
              {artistProfile?.stripeOnboarded ? (
                <p className="mt-1 text-sm text-green-600">Paiements activés</p>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Configurez Stripe pour recevoir vos paiements.</p>
                  <Link
                    href="/dashboard/settings/stripe"
                    className="mt-2 inline-block rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Configurer Stripe
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
