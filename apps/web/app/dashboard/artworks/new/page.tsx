"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { generateSlug, validatePrice } from "@bozzart/core";
import { ImageUpload } from "@/components/upload/image-upload";
import { toast } from "sonner";
import type { ArtworkMedium } from "@bozzart/api";

const mediums: { value: ArtworkMedium; label: string }[] = [
  { value: "painting", label: "Peinture" },
  { value: "photography", label: "Photographie" },
  { value: "illustration", label: "Illustration" },
  { value: "digital", label: "Digital" },
  { value: "sculpture", label: "Sculpture" },
  { value: "drawing", label: "Dessin" },
  { value: "print", label: "Estampe" },
  { value: "textile", label: "Textile" },
  { value: "video", label: "Vidéo" },
  { value: "audio", label: "Audio" },
  { value: "performance", label: "Performance" },
  { value: "mixed", label: "Mixte" },
  { value: "other", label: "Autre" },
];

export default function NewArtworkPage() {
  const router = useRouter();
  const { artistProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Champs du formulaire
  const [title, setTitle] = useState("");
  const [storyHtml, setStoryHtml] = useState("");
  const [medium, setMedium] = useState<ArtworkMedium>("painting");
  const [yearCreated, setYearCreated] = useState(new Date().getFullYear().toString());
  const [dimensions, setDimensions] = useState("");
  const [editionInfo, setEditionInfo] = useState("");
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("EUR");
  const [isPriceVisible, setIsPriceVisible] = useState(true);
  const [acceptsOffers, setAcceptsOffers] = useState(false);
  const [tags, setTags] = useState("");
  const [messagingEnabled, setMessagingEnabled] = useState(true);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");

  async function handleSave(publish: boolean) {
    if (!artistProfile) return;
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Le titre est obligatoire";
    }
    if (!primaryImageUrl.trim()) {
      errors.image = "L'image principale est obligatoire";
    }

    const priceNum = parseFloat(price);
    const priceValidation = validatePrice(priceNum);
    if (!priceValidation.valid) {
      errors.price = priceValidation.error || "Prix invalide";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const slug = generateSlug(title);
    const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const { data, error: insertError } = await supabase
      .from("artworks")
      .insert({
        artist_id: artistProfile.id,
        title,
        slug,
        story_html: storyHtml || null,
        medium,
        year_created: yearCreated ? parseInt(yearCreated) : null,
        dimensions: dimensions || null,
        edition_info: editionInfo || null,
        price: priceNum,
        price_currency: priceCurrency,
        is_price_visible: isPriceVisible,
        accepts_offers: acceptsOffers,
        tags: tagsArray,
        messaging_enabled: messagingEnabled,
        primary_image_url: primaryImageUrl,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      toast.error("Erreur lors de la création de l'œuvre : " + insertError.message);
      setSaving(false);
      return;
    }

    toast.success(publish ? "Œuvre publiée !" : "Brouillon enregistré !");
    router.push(`/dashboard/artworks/${data.id}/edit`);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Nouvelle œuvre</h1>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Image principale */}
        <div>
          <label htmlFor="primaryImageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image principale *</label>
          <ImageUpload
            bucket="artworks"
            path="new"
            currentUrl={primaryImageUrl || undefined}
            onUpload={(url) => setPrimaryImageUrl(url)}
          />
          <input
            id="primaryImageUrl"
            type="url"
            value={primaryImageUrl}
            onChange={(e) => setPrimaryImageUrl(e.target.value)}
            placeholder="Ou collez une URL directement"
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.image && <p className="mt-1 text-sm text-red-600">{fieldErrors.image}</p>}
        </div>

        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Aube sur Montmartre"
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
        </div>

        {/* Histoire */}
        <div>
          <label htmlFor="storyHtml" className="block text-sm font-medium text-gray-700">Histoire de l&apos;œuvre</label>
          <textarea
            id="storyHtml"
            value={storyHtml}
            onChange={(e) => setStoryHtml(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Racontez l'histoire de cette œuvre..."
          />
        </div>

        {/* Medium + Annee */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="medium" className="block text-sm font-medium text-gray-700">Technique *</label>
            <select
              id="medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value as ArtworkMedium)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {mediums.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="yearCreated" className="block text-sm font-medium text-gray-700">Année</label>
            <input
              id="yearCreated"
              type="number"
              value={yearCreated}
              onChange={(e) => setYearCreated(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Dimensions + Edition */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">Dimensions</label>
            <input
              id="dimensions"
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="60 x 80 cm"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="editionInfo" className="block text-sm font-medium text-gray-700">Edition</label>
            <input
              id="editionInfo"
              type="text"
              value={editionInfo}
              onChange={(e) => setEditionInfo(e.target.value)}
              placeholder="1/10"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Prix */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix *</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="1"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="1200.00"
            />
            {fieldErrors.price && <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>}
          </div>
          <div>
            <label htmlFor="priceCurrency" className="block text-sm font-medium text-gray-700">Devise</label>
            <select
              id="priceCurrency"
              value={priceCurrency}
              onChange={(e) => setPriceCurrency(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPriceVisible}
              onChange={(e) => setIsPriceVisible(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Afficher le prix publiquement</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptsOffers}
              onChange={(e) => setAcceptsOffers(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Accepter les offres</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={messagingEnabled}
              onChange={(e) => setMessagingEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Activer la messagerie pour cette œuvre</span>
          </label>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="peinture, paris, lumiere"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">Séparés par des virgules</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Publier"}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Enregistrer en brouillon
          </button>
        </div>
      </div>
    </div>
  );
}
