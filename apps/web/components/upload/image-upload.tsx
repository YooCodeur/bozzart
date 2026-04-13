"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface ImageUploadProps {
  bucket: "artworks" | "avatars" | "posts";
  path: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  className?: string;
  accept?: string;
  maxSizeMb?: number;
}

export function ImageUpload({
  bucket,
  path,
  onUpload,
  currentUrl,
  className = "",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMb = 50,
}: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!user) return;
      setError("");

      // Validation
      const allowedTypes = accept.split(",").map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError(`Format non supporte. Utilise : ${allowedTypes.join(", ")}`);
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Fichier trop lourd (max ${maxSizeMb} Mo)`);
        return;
      }

      // Revoke previous object URL to avoid memory leak
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      // Preview locale
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreview(objectUrl);

      // Upload
      setUploading(true);
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${path}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUpload(data.publicUrl);
      setUploading(false);
    },
    [user, bucket, path, accept, maxSizeMb, onUpload],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed transition ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 hover:border-gray-400"
        } ${preview ? "p-0" : "p-8"}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg object-cover"
              style={{ maxHeight: 300 }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                <p className="text-sm text-white">Upload en cours...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 20.25h10.5A2.25 2.25 0 0019.5 18V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Glissez-deposez ou <span className="text-brand-600">parcourez</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP — max {maxSizeMb} Mo</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
