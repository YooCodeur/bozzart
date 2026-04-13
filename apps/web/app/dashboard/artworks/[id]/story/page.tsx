"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { StoryViewer } from "@/components/stories/StoryViewer";
import type { StorySlide, StorySlideType } from "@/components/stories/types";
import { MAX_SLIDES } from "@/components/stories/types";

interface Props {
  params: { id: string };
}

// Helper : genere un id local (pas besoin de crypto pour un slide id)
function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptySlide(type: StorySlideType): StorySlide {
  switch (type) {
    case "text":
      return {
        id: newId(),
        type,
        caption: "Votre texte…",
        bg_color: "#111827",
        text_color: "#ffffff",
      };
    case "palette":
      return { id: newId(), type, colors: ["#111827"], bg_color: "#0f172a" };
    case "before_after":
      return { id: newId(), type };
    case "video":
      return { id: newId(), type };
    case "image":
    default:
      return { id: newId(), type: "image" };
  }
}

const SLIDE_TYPES: { value: StorySlideType; label: string }[] = [
  { value: "image", label: "Image + caption" },
  { value: "text", label: "Texte plein" },
  { value: "video", label: "Vidéo" },
  { value: "before_after", label: "Avant / Après" },
  { value: "palette", label: "Palette" },
];

export default function ArtworkStoryEditor({ params }: Props) {
  const router = useRouter();
  const { user, artistProfile } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [slides, setSlides] = useState<StorySlide[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [selected, setSelected] = useState<number>(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Chargement initial : verifie la propriete de l'oeuvre puis charge la story
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user || !artistProfile) return;
      const { data: art } = await supabase
        .from("artworks")
        .select("id, title, artist_id")
        .eq("id", params.id)
        .single();

      if (!active) return;
      if (!art || art.artist_id !== artistProfile.id) {
        toast.error("Oeuvre introuvable ou accès refusé");
        router.push("/dashboard/artworks");
        return;
      }
      setArtworkTitle(art.title);

      const { data: story } = await supabase
        .from("artwork_stories")
        .select("*")
        .eq("artwork_id", params.id)
        .maybeSingle();

      if (!active) return;
      if (story) {
        setStoryId(story.id);
        setSlides((story.slides as StorySlide[]) ?? []);
        setIsPublished(!!story.is_published);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, artistProfile, params.id, supabase, router]);

  const current = slides[selected];

  const addSlide = (type: StorySlideType) => {
    if (slides.length >= MAX_SLIDES) {
      toast.error(`Maximum ${MAX_SLIDES} slides par story`);
      return;
    }
    const s = emptySlide(type);
    setSlides((arr) => [...arr, s]);
    setSelected(slides.length);
  };

  const updateSlide = (idx: number, patch: Partial<StorySlide>) => {
    setSlides((arr) =>
      arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  };

  const removeSlide = (idx: number) => {
    setSlides((arr) => arr.filter((_, i) => i !== idx));
    setSelected((s) => Math.max(0, Math.min(s, slides.length - 2)));
  };

  // HTML5 drag + drop natif. TODO: migrer vers @dnd-kit pour le clavier/a11y.
  const onDragStart = (i: number) => setDragIndex(i);
  const onDrop = (i: number) => {
    if (dragIndex == null || dragIndex === i) return;
    setSlides((arr) => {
      const next = arr.slice();
      const [moved] = next.splice(dragIndex, 1);
      if (moved) next.splice(i, 0, moved);
      return next;
    });
    setSelected(i);
    setDragIndex(null);
  };

  const uploadFile = useCallback(
    async (file: File, folder: "images" | "videos" | "before" | "after") => {
      if (!user) throw new Error("Non authentifié");
      const ext = file.name.split(".").pop() ?? "bin";
      // Convention des storage policies existantes : premier segment = user.id
      const path = `${user.id}/${params.id}/${folder}/${newId()}.${ext}`;
      const { error } = await supabase.storage
        .from("stories")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("stories").getPublicUrl(path);
      return data.publicUrl;
    },
    [supabase, user, params.id],
  );

  const save = async (publish?: boolean) => {
    if (!artistProfile) return;
    if (slides.length > MAX_SLIDES) {
      toast.error(`Maximum ${MAX_SLIDES} slides`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        artwork_id: params.id,
        slides,
        is_published: publish ?? isPublished,
      };
      if (storyId) {
        const { error } = await supabase
          .from("artwork_stories")
          .update(payload)
          .eq("id", storyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("artwork_stories")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setStoryId(data.id);
      }
      if (publish !== undefined) setIsPublished(publish);
      toast.success(publish ? "Story publiée" : "Story enregistrée");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histoire de l&apos;œuvre</h1>
          <p className="text-sm text-gray-500">{artworkTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            disabled={slides.length === 0}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            Prévisualiser
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => save(!isPublished)}
            disabled={saving || slides.length === 0}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {isPublished ? "Dépublier" : "Publier"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr_420px]">
        {/* Liste slides (drag + drop) */}
        <aside>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Slides ({slides.length}/{MAX_SLIDES})
          </div>
          <ul className="space-y-2">
            {slides.map((s, i) => (
              <li
                key={s.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                onClick={() => setSelected(i)}
                className={`cursor-grab select-none rounded-md border px-3 py-2 text-sm ${
                  i === selected
                    ? "border-black bg-gray-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {i + 1}. {labelForType(s.type)}
                  </span>
                  <button
                    type="button"
                    aria-label="Supprimer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSlide(i);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ajouter
            </div>
            {SLIDE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => addSlide(t.value)}
                disabled={slides.length >= MAX_SLIDES}
                className="block w-full rounded-md border border-gray-200 px-3 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                + {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Editeur de slide */}
        <section className="min-h-[500px] rounded-lg border border-gray-200 bg-white p-6">
          {current ? (
            <SlideEditor
              slide={current}
              onChange={(patch) => updateSlide(selected, patch)}
              onUpload={uploadFile}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Ajoutez un slide pour commencer à raconter l&apos;histoire de
              cette œuvre.
            </p>
          )}
        </section>

        {/* Preview mobile 375px */}
        <aside className="hidden lg:block">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Aperçu mobile (375px)
          </div>
          <div
            className="relative mx-auto overflow-hidden rounded-[2rem] border-8 border-gray-800 bg-black shadow-lg"
            style={{ width: 375, height: 667 }}
          >
            {current ? (
              <MiniPreview slide={current} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-500">
                Aucun slide
              </div>
            )}
          </div>
        </aside>
      </div>

      {previewOpen && slides.length > 0 && (
        <StoryViewer
          slides={slides}
          onClose={() => setPreviewOpen(false)}
          headerTitle={artworkTitle}
          headerSubtitle="Aperçu"
        />
      )}
    </div>
  );
}

function labelForType(t: StorySlideType) {
  return SLIDE_TYPES.find((x) => x.value === t)?.label ?? t;
}

function MiniPreview({ slide }: { slide: StorySlide }) {
  if (slide.type === "text") {
    return (
      <div
        className="flex h-full w-full items-center justify-center p-6 text-center"
        style={{
          backgroundColor: slide.bg_color ?? "#111827",
          color: slide.text_color ?? "#ffffff",
        }}
      >
        <p className="whitespace-pre-wrap text-xl">{slide.caption}</p>
      </div>
    );
  }
  if (slide.type === "image" && slide.content) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.content}
        alt=""
        className="h-full w-full object-cover"
      />
    );
  }
  if (slide.type === "video" && slide.content) {
    return (
      <video src={slide.content} className="h-full w-full object-cover" muted />
    );
  }
  if (slide.type === "before_after") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xs text-white">
        Avant / Après
      </div>
    );
  }
  if (slide.type === "palette") {
    return (
      <div
        className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-6"
        style={{ backgroundColor: slide.bg_color ?? "#0f172a" }}
      >
        {(slide.colors ?? []).map((c, i) => (
          <div
            key={i}
            className="h-10 w-10 rounded-full border border-white/30"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    );
  }
  return <div className="h-full w-full bg-gray-700" />;
}

function SlideEditor({
  slide,
  onChange,
  onUpload,
}: {
  slide: StorySlide;
  onChange: (patch: Partial<StorySlide>) => void;
  onUpload: (
    file: File,
    folder: "images" | "videos" | "before" | "after",
  ) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    file: File,
    folder: "images" | "videos" | "before" | "after",
    key: "content" | "before_url" | "after_url",
  ) => {
    setUploading(true);
    try {
      const url = await onUpload(file, folder);
      onChange({ [key]: url } as Partial<StorySlide>);
    } catch (e) {
      console.error(e);
      toast.error("Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  if (slide.type === "image") {
    return (
      <div className="space-y-4">
        <Field label="Image">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "images", "content");
            }}
          />
          {slide.content && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.content}
              alt=""
              className="mt-3 max-h-64 rounded-md"
            />
          )}
        </Field>
        <Field label="Caption (optionnel)">
          <textarea
            value={slide.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
        {uploading && <p className="text-xs text-gray-500">Envoi en cours…</p>}
      </div>
    );
  }

  if (slide.type === "text") {
    return (
      <div className="space-y-4">
        <Field label="Texte">
          <textarea
            value={slide.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fond">
            <input
              type="color"
              value={slide.bg_color ?? "#111827"}
              onChange={(e) => onChange({ bg_color: e.target.value })}
            />
          </Field>
          <Field label="Texte">
            <input
              type="color"
              value={slide.text_color ?? "#ffffff"}
              onChange={(e) => onChange({ text_color: e.target.value })}
            />
          </Field>
        </div>
      </div>
    );
  }

  if (slide.type === "video") {
    return (
      <div className="space-y-4">
        <Field label="Vidéo (30s max recommandé)">
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "videos", "content");
            }}
          />
          {slide.content && (
            <video
              src={slide.content}
              controls
              className="mt-3 max-h-64 w-full rounded-md"
            />
          )}
        </Field>
        <Field label="Caption (optionnel)">
          <input
            value={slide.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
        {uploading && <p className="text-xs text-gray-500">Envoi en cours…</p>}
      </div>
    );
  }

  if (slide.type === "before_after") {
    return (
      <div className="space-y-4">
        <Field label="Image 'Avant'">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "before", "before_url");
            }}
          />
          {slide.before_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.before_url}
              alt=""
              className="mt-2 max-h-40 rounded-md"
            />
          )}
        </Field>
        <Field label="Image 'Après'">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f, "after", "after_url");
            }}
          />
          {slide.after_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.after_url}
              alt=""
              className="mt-2 max-h-40 rounded-md"
            />
          )}
        </Field>
        <Field label="Caption (optionnel)">
          <input
            value={slide.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>
    );
  }

  if (slide.type === "palette") {
    const colors = slide.colors ?? [];
    return (
      <div className="space-y-4">
        <Field label="Couleurs">
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="color"
                  value={c}
                  onChange={(e) => {
                    const next = colors.slice();
                    next[i] = e.target.value;
                    onChange({ colors: next });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({ colors: colors.filter((_, j) => j !== i) })
                  }
                  className="text-xs text-gray-400 hover:text-red-500"
                  aria-label="Retirer la couleur"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange({ colors: [...colors, "#888888"] })}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
            >
              + couleur
            </button>
          </div>
        </Field>
        <Field label="Caption (optionnel)">
          <input
            value={slide.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Fond">
          <input
            type="color"
            value={slide.bg_color ?? "#0f172a"}
            onChange={(e) => onChange({ bg_color: e.target.value })}
          />
        </Field>
      </div>
    );
  }

  return null;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}
