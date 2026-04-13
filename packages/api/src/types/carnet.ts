import type { PostType } from "./enums";

export interface ReactionCounts {
  touched: number;
  want: number;
  how: number;
  share: number;
}

export interface CarnetPost {
  id: string;
  artistId: string;
  type: PostType;
  caption?: string;
  bodyHtml?: string;
  mediaUrls: string[];
  mediaMetadata: Record<string, unknown>;
  linkedArtworkId?: string;
  commentsEnabled: boolean;
  silenceMetrics: boolean;
  reactionCounts: ReactionCounts;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  parentId?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}
