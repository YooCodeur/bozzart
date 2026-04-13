import { calculateCommission, calculateArtistAmount } from "../artwork";

/**
 * Calcule le detail financier d'une transaction.
 */
export function calculateTransactionBreakdown(
  price: number,
  isFounder: boolean,
  currency = "EUR",
) {
  const platformFee = calculateCommission(price, isFounder);
  const artistAmount = calculateArtistAmount(price, isFounder);

  return {
    total: price,
    platformFee,
    artistAmount,
    currency,
    commissionRate: isFounder ? 0.08 : 0.1,
  };
}

/**
 * Genere un numero de certificat unique.
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${year}-${random}`;
}
