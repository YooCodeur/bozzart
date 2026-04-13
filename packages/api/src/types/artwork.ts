import type { ArtworkStatus, ArtworkMedium } from "./enums";
import type { ArtistProfile } from "./artist";

export interface ArtworkSeries {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isVisible: boolean;
  artworkCount: number;
  createdAt: string;
}

export interface PriceRange {
  min: number;
  max: number;
  median: number;
  count: number;
}

export interface Artwork {
  id: string;
  artistId: string;
  title: string;
  storyHtml?: string;
  medium: ArtworkMedium;
  yearCreated?: number;
  dimensions?: string;
  editionInfo?: string;
  tags: string[];
  primaryImageUrl: string;
  imageUrls: string[];
  thumbnailUrl?: string;
  status: ArtworkStatus;
  price: number;
  priceCurrency: string;
  isPriceVisible: boolean;
  acceptsOffers: boolean;
  seriesId?: string;
  seriesOrder?: number;
  wishlistCount: number;
  viewCount: number;
  messageCount: number;
  messagingEnabled: boolean;
  printAvailable: boolean;
  printPartnerId?: string;
  printPrice?: number;
  slug?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  artist?: ArtistProfile;
  series?: ArtworkSeries;
  priceRange?: PriceRange;
  isWishlisted?: boolean;
}
