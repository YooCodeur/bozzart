import type { DropStatus } from "./enums";
import type { Artwork } from "./artwork";

export interface DiscoverySlot {
  id: string;
  artworkId: string;
  curatorId: string;
  slotDate: string;
  slotHour: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  // Relations
  artwork?: Artwork;
}

export interface Drop {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  status: DropStatus;
  startsAt: string;
  endsAt: string;
  isSponsored: boolean;
  createdAt: string;
  // Relations
  artworks?: Artwork[];
}
