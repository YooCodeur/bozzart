/**
 * Calcule la commission plateforme sur une vente.
 * Standard: 10% | Fondateurs: 8%
 */
export function calculateCommission(price: number, isFounder: boolean): number {
  const rate = isFounder ? 0.08 : 0.1;
  return Math.round(price * rate * 100) / 100;
}

/**
 * Calcule le montant artiste apres commission.
 */
export function calculateArtistAmount(price: number, isFounder: boolean): number {
  return price - calculateCommission(price, isFounder);
}

/**
 * Genere un slug a partir d'un titre.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Valide le prix d'une oeuvre.
 */
export function validatePrice(price: number): { valid: boolean; error?: string } {
  if (price <= 0) return { valid: false, error: "Le prix doit etre superieur a 0" };
  if (price > 1_000_000) return { valid: false, error: "Le prix ne peut pas depasser 1 000 000 EUR" };
  if (!Number.isFinite(price)) return { valid: false, error: "Prix invalide" };
  return { valid: true };
}
