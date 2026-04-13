export interface StoryChapter {
  title: string;
  content: string;
  addedAt: string;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  slug: string;
  fullName: string;
  pronouns?: string;
  locationCity?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  websiteUrl?: string;
  instagramUrl?: string;
  storyHtml?: string;
  storyChapters: StoryChapter[];
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  stripePayoutsEnabled: boolean;
  messagingEnabled: boolean;
  messagingFilter: "all" | "buyers_only";
  silenceModeUntil?: string;
  silenceMessaging: boolean;
  isFounder: boolean;
  founderSince?: string;
  commissionRate: number;
  totalSalesCount: number;
  totalSalesAmount: number;
  followerCount: number;
  artworkCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
