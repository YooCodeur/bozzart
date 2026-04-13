import { supabase } from "./client";

export type StorageBucket = "avatars" | "artworks" | "posts" | "certificates";

interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File | Blob;
  contentType?: string;
}

interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload un fichier vers Supabase Storage (R2 en backend).
 * Le path doit commencer par le user_id pour respecter les policies Storage.
 */
export async function uploadFile({ bucket, path, file, contentType }: UploadOptions): Promise<UploadResult> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
}

/**
 * Supprime un fichier de Supabase Storage.
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Genere le path de stockage pour un avatar.
 */
export function getAvatarPath(userId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  return `${userId}/avatar.${ext}`;
}

/**
 * Genere le path de stockage pour une image d'oeuvre.
 */
export function getArtworkImagePath(userId: string, artworkId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  const timestamp = Date.now();
  return `${userId}/${artworkId}/${timestamp}.${ext}`;
}

/**
 * Genere le path de stockage pour un media de post.
 */
export function getPostMediaPath(userId: string, postId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  const timestamp = Date.now();
  return `${userId}/${postId}/${timestamp}.${ext}`;
}
