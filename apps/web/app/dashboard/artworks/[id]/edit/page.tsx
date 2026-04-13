"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { ArtworkStatus, ArtworkMedium } from "@bozzart/api";

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

interface Props {
  params: { id: string };
}

export default function EditArtworkPage({ params }: Props) {
  const router = useRouter();
  const { artistProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [storyHtml, setStoryHtml] = useState("");
  const [medium, setMedium] = useState<ArtworkMedium>("painting");
  const [yearCreated, setYearCreated] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [editionInfo, setEditionInfo] = useState("");
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("EUR");
  const [isPriceVisible, setIsPriceVisible] = useState(true);
  const [acceptsOffers, setAcceptsOffers] = useState(false);
  const [tags, setTags] = useState("");
  const [messagingEnabled, setMessagingEnabled] = useState(true);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<{ id: string; title: string }[]>([]);
  const [status, setStatus] = useState<ArtworkStatus>("draft");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("artworks")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger l'œuvre : " + error.message);
          setLoading(false);
          return;
        }
        if (!data) return;
        setTitle(data.title);
        setStoryHtml(data.story_html || "");
        setMedium(data.medium);
        setYearCreated(data.year_created?.toString() || "");
        setDimensions(data.dimensions || "");
        setEditionInfo(data.edition_info || "");
        setPrice(data.price.toString());
        setPriceCurrency(data.price_currency);
        setIsPriceVisible(data.is_price_visible);
        setAcceptsOffers(data.accepts_offers);
        setTags((data.tags || []).join(", "));
        setMessagingEnabled(data.messaging_enabled);
        setPrimaryImageUrl(data.primary_image_url);
        setSeriesId(data.series_id || null);
        setStatus(data.status);
        setLoading(false);
      });

    // Charger les series de l'artiste
    if (artistProfile) {
      supabase
        .from("artwork_series")
        .select("id, title")
        .eq("artist_id", artistProfile.id)
        .order("title")
        .then(({ data: s, error }) => {
          if (error) {
            toast.error("Impossible de charger les séries : " + error.message);
          }
          setSeriesList((s as { id: string; title: string }[]) || []);
        });
    }
  }, [params.id, artistProfile]);

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const { error: updateError } = await supabase
      .from("artworks")
      .update({
        title,
        story_html: storyHtml || null,
        medium,
        year_created: yearCreated ? parseInt(yearCreated) : null,
        dimensions: dimensions || null,
        edition_info: editionInfo || null,
        price: parseFloat(price),
        price_currency: priceCurrency,
        is_price_visible: isPriceVisible,
        accepts_offers: acceptsOffers,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        messaging_enabled: messagingEnabled,
        primary_image_url: primaryImageUrl,
        series_id: seriesId || null,
      })
      .eq("id", params.id);

    if (updateError) {
      toast.error("Erreur lors de la sauvegarde : " + updateError.message);
    } else {
      setSaved(true);
      toast.success("Modifications enregistrées !");
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleStatusChange(newStatus: ArtworkStatus) {
    const supabase = createSupabaseBrowserClient();
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published" && status !== "published") {
      updates.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("artworks").update(updates).eq("id", params.id);
    if (error) {
      toast.error("Erreur lors du changement de statut : " + error.message);
      return;
    }
    setStatus(newStatus);
    toast.success(newStatus === "published" ? "Œuvre publiée !" : "Œuvre archivée !");
  }

  async function handleDelete() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("artworks").delete().eq("id", params.id);
    if (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
      return;
    }
    toast.success("Œuvre supprimée");
    router.push("/dashboard/artworks");
  }

  if (loading) {
    return <div className="p-8"><p className="text-gray-500" role="status" aria-live="polite">Chargement...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier l&apos;œuvre</h1>
        <div className="flex gap-2">
          {status === "draft" && (
            <button
              onClick={() => handleStatusChange("published")}
              className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              Publier
            </button>
          )}
          {status === "published" && (
            <button
              onClick={() => handleStatusChange("archived")}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Archiver
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-2xl space-y-6">
        <div>
          <label htmlFor="edit-primaryImageUrl" className="block text-sm font-medium text-gray-700">Image principale</label>
          <input id="edit-primaryImageUrl" type="url" value={primaryImageUrl} onChange={(e) => setPrimaryImageUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Titre</label>
          <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="edit-storyHtml" className="block text-sm font-medium text-gray-700">Histoire</label>
          <textarea id="edit-storyHtml" value={storyHtml} onChange={(e) => setStoryHtml(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-medium" className="block text-sm font-medium text-gray-700">Technique</label>
            <select id="edit-medium" value={medium} onChange={(e) => setMedium(e.target.value as ArtworkMedium)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              {mediums.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="edit-yearCreated" className="block text-sm font-medium text-gray-700">Année</label>
            <input id="edit-yearCreated" type="number" value={yearCreated} onChange={(e) => setYearCreated(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
        {/* Serie */}
        {seriesList.length > 0 && (
          <div>
            <label htmlFor="edit-seriesId" className="block text-sm font-medium text-gray-700">Série</label>
            <select
              id="edit-seriesId"
              value={seriesId || ""}
              onChange={(e) => setSeriesId(e.target.value || null)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Aucune série</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-dimensions" className="block text-sm font-medium text-gray-700">Dimensions</label>
            <input id="edit-dimensions" type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="edit-editionInfo" className="block text-sm font-medium text-gray-700">Edition</label>
            <input id="edit-editionInfo" type="text" value={editionInfo} onChange={(e) => setEditionInfo(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Prix</label>
            <input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="edit-priceCurrency" className="block text-sm font-medium text-gray-700">Devise</label>
            <select id="edit-priceCurrency" value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={isPriceVisible} onChange={(e) => setIsPriceVisible(e.target.checked)} className="rounded" /><span className="text-sm">Prix visible</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={acceptsOffers} onChange={(e) => setAcceptsOffers(e.target.checked)} className="rounded" /><span className="text-sm">Accepter les offres</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={messagingEnabled} onChange={(e) => setMessagingEnabled(e.target.checked)} className="rounded" /><span className="text-sm">Messagerie activée</span></label>
        </div>
        <div>
          <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700">Tags</label>
          <input id="edit-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>

        <button onClick={handleSave} disabled={saving} className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer"}
        </button>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer l'oeuvre"
        message="Cette action est irréversible. L'œuvre sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await handleDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
