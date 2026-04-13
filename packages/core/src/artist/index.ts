/**
 * Valide un slug artiste.
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (slug.length < 3) return { valid: false, error: "Le slug doit faire au moins 3 caracteres" };
  if (slug.length > 40) return { valid: false, error: "Le slug ne peut pas depasser 40 caracteres" };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { valid: false, error: "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets" };
  }
  return { valid: true };
}

/**
 * Genere l'URL du profil artiste.
 */
export function getArtistProfileUrl(slug: string, baseUrl = "https://bozzart.art"): string {
  return `${baseUrl}/${slug}`;
}

/**
 * Genere l'URL du sous-domaine artiste.
 */
export function getArtistSubdomainUrl(slug: string): string {
  return `https://${slug}.bozzart.art`;
}
