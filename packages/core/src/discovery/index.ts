/**
 * Retourne le slot de decouverte courant (0-23).
 */
export function getCurrentSlotHour(): number {
  return new Date().getHours();
}

/**
 * Verifie si un drop est actuellement actif.
 */
export function isDropActive(startsAt: string, endsAt: string): boolean {
  const now = new Date();
  return now >= new Date(startsAt) && now <= new Date(endsAt);
}
