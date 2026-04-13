import type { TransactionStatus, CertificateType } from "./enums";

export interface Transaction {
  id: string;
  artworkId: string;
  buyerId?: string;
  artistId: string;
  conversationId?: string;
  amount: number;
  platformFee: number;
  artistAmount: number;
  currency: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  status: TransactionStatus;
  paidAt?: string;
  transferredAt?: string;
  payoutAt?: string;
  guestEmail?: string;
  guestName?: string;
  certificateUrl?: string;
  certificateIssuedAt?: string;
  originalTransactionId?: string;
  isResale: boolean;
  resaleRoyaltyAmount?: number;
  createdAt: string;
}

export interface Certificate {
  id: string;
  transactionId: string;
  type: CertificateType;
  certificateNumber: string;
  pdfUrl?: string;
  blockchainTx?: string;
  issuedAt: string;
}

export interface BuyerCollection {
  id: string;
  userId: string;
  transactionId: string;
  artworkId: string;
  artistId: string;
  purchasedAt: string;
  notes?: string;
  createdAt: string;
}
