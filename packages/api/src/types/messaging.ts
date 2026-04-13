import type { MessageStatus, MessageType } from "./enums";
import type { Artwork } from "./artwork";
import type { ArtistProfile } from "./artist";
import type { Profile } from "./profile";

export interface Conversation {
  id: string;
  artworkId: string;
  buyerId: string;
  artistId: string;
  lastMessageAt?: string;
  buyerUnread: number;
  artistUnread: number;
  isArchived: boolean;
  createdAt: string;
  // Relations
  artwork?: Artwork;
  buyer?: Profile;
  artist?: ArtistProfile;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body?: string;
  type: MessageType;
  paymentLinkUrl?: string;
  paymentLinkAmount?: number;
  paymentLinkUsed: boolean;
  status: MessageStatus;
  createdAt: string;
  // Relations
  sender?: Profile;
}
