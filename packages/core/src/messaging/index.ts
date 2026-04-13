/**
 * Genere un ID de conversation unique a partir de l'oeuvre et l'acheteur.
 */
export function getConversationKey(artworkId: string, buyerId: string): string {
  return `${artworkId}:${buyerId}`;
}
