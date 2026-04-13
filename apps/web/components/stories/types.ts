export type StorySlideType =
  | "image"
  | "text"
  | "video"
  | "before_after"
  | "palette";

export interface StorySlide {
  id: string;
  type: StorySlideType;
  /** Url principale pour image / video. */
  content?: string;
  /** Texte affiche (caption pour image/video, texte principal pour text). */
  caption?: string;
  /** Couleurs (slide text ou palette). */
  bg_color?: string;
  text_color?: string;
  /** Slide before/after. */
  before_url?: string;
  after_url?: string;
  /** Palette slide : liste de couleurs hex. */
  colors?: string[];
}

export interface ArtworkStory {
  id: string;
  artwork_id: string;
  slides: StorySlide[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const MAX_SLIDES = 12;
export const SLIDE_DURATION_MS = 5000;
