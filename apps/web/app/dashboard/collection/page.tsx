"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

function NoteEditor({ collectionId, initialNote }: { collectionId: string; initialNote: string | null }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialNote || "");
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("buyer_collections").update({ notes: note || null }).eq("id", collectionId);
    if (error) {
      toast.error("Erreur lors de la sauvegarde de la note : " + error.message);
    }
    setSaving(false);
    setEditing(false);
  }, [collectionId, note]);

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="mt-1 text-xs text-gray-400 hover:text-gray-600">
        {initialNote ? `"${initialNote.slice(0, 40)}${initialNote.length > 40 ? "..." : ""}"` : "+ Ajouter une note"}
      </button>
    );
  }

  return (
    <div className="mt-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="block w-full rounded border border-gray-300 px-2 py-1 text-xs"
        placeholder="Note personnelle..."
        autoFocus
      />
      <div className="mt-1 flex gap-1">
        <button onClick={save} disabled={saving} className="rounded bg-black px-2 py-0.5 text-xs text-white disabled:opacity-50">
          {saving ? "..." : "OK"}
        </button>
        <button onClick={() => setEditing(false)} className="rounded px-2 py-0.5 text-xs text-gray-500">
          Annuler
        </button>
      </div>
    </div>
  );
}

interface CollectionItem {
  id: string;
  purchased_at: string;
  notes: string | null;
  artwork: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string;
    price: number;
    price_currency: string;
  };
  artist: {
    full_name: string;
    slug: string;
  };
  transaction: {
    certificate_url: string | null;
  };
}

export default function CollectionPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();

    supabase
      .from("buyer_collections")
      .select(`
        *,
        artwork:artworks(id, title, slug, primary_image_url, price, price_currency),
        artist:artist_profiles(full_name, slug),
        transaction:transactions(certificate_url)
      `)
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger la collection : " + error.message);
        }
        setItems((data as unknown as CollectionItem[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Ma collection</h1>
        <p className="mt-4 text-gray-500" role="status" aria-live="polite">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Ma collection</h1>
      <p className="mt-1 text-gray-600">{items.length} œuvre{items.length !== 1 ? "s" : ""}</p>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Votre collection est vide pour le moment.</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Découvrir des œuvres
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group">
              <Link href={`/${item.artist.slug}/artwork/${item.artwork.slug}`}>
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.artwork.primary_image_url}
                    alt={item.artwork.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              </Link>
              <h3 className="mt-2 font-medium">{item.artwork.title}</h3>
              <p className="text-sm text-gray-500">par {item.artist.full_name}</p>
              <p className="text-sm text-gray-400">
                Acquis le {new Date(item.purchased_at).toLocaleDateString("fr-FR")}
              </p>
              {item.transaction.certificate_url && (
                <a
                  href={item.transaction.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-brand-600 hover:underline"
                >
                  Certificat d&apos;authenticité
                </a>
              )}
              {/* Note personnelle */}
              <NoteEditor collectionId={item.id} initialNote={item.notes} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
