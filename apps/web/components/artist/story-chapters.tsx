"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Chapter {
  title: string;
  content: string;
  addedAt: string;
}

interface StoryChaptersProps {
  chapters: Chapter[];
  editable?: boolean;
  artistProfileId?: string;
}

export function StoryChapters({ chapters: initialChapters, editable = false, artistProfileId }: StoryChaptersProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  async function addChapter() {
    if (!artistProfileId || !newTitle.trim() || !newContent.trim()) return;
    setSaving(true);

    const newChapter: Chapter = {
      title: newTitle.trim(),
      content: newContent.trim(),
      addedAt: new Date().toISOString(),
    };

    const updated = [...chapters, newChapter];

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("artist_profiles")
      .update({ story_chapters: JSON.stringify(updated) })
      .eq("id", artistProfileId);

    if (error) {
      toast.error("Impossible d'ajouter le chapitre. Veuillez reessayer.");
      setSaving(false);
      return;
    }

    setChapters(updated);
    setNewTitle("");
    setNewContent("");
    setShowAdd(false);
    setSaving(false);
  }

  async function removeChapter(index: number) {
    if (!artistProfileId) return;
    setRemovingIndex(index);

    const previousChapters = chapters;
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("artist_profiles")
      .update({ story_chapters: JSON.stringify(updated) })
      .eq("id", artistProfileId);

    if (error) {
      setChapters(previousChapters);
      toast.error("Impossible de supprimer le chapitre. Veuillez reessayer.");
    }

    setRemovingIndex(null);
  }

  if (chapters.length === 0 && !editable) return null;

  return (
    <div className="space-y-8">
      {chapters.map((chapter, i) => (
        <div key={i} className="border-l-2 border-brand-200 pl-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{chapter.title}</h3>
            {editable && (
              <button
                onClick={() => setDeleteConfirmIndex(i)}
                disabled={removingIndex === i}
                aria-label={`Supprimer le chapitre ${chapter.title}`}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                Supprimer
              </button>
            )}
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{chapter.content}</p>
          <time className="mt-2 block text-xs text-gray-400">
            {new Date(chapter.addedAt).toLocaleDateString("fr-FR")}
          </time>
        </div>
      ))}

      <ConfirmModal
        open={deleteConfirmIndex !== null}
        title="Supprimer le chapitre"
        message="Voulez-vous vraiment supprimer ce chapitre ? Cette action est irreversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={async () => {
          const index = deleteConfirmIndex!;
          setDeleteConfirmIndex(null);
          await removeChapter(index);
        }}
        onCancel={() => setDeleteConfirmIndex(null)}
      />

      {editable && (
        <>
          {showAdd ? (
            <div className="space-y-3 rounded-lg border p-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre du chapitre"
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                placeholder="Contenu..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <div className="flex gap-2">
                <button onClick={addChapter} disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
                  {saving ? "..." : "Ajouter"}
                </button>
                <button onClick={() => setShowAdd(false)} className="rounded-md border px-4 py-2 text-sm">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} className="text-sm text-brand-600 hover:underline">
              + Ajouter un chapitre
            </button>
          )}
        </>
      )}
    </div>
  );
}
