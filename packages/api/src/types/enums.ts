export type UserRole = "artist" | "buyer" | "both" | "admin";

export type ArtworkStatus = "draft" | "published" | "sold" | "reserved" | "archived";

export type ArtworkMedium =
  | "painting"
  | "photography"
  | "illustration"
  | "digital"
  | "sculpture"
  | "drawing"
  | "print"
  | "textile"
  | "video"
  | "audio"
  | "performance"
  | "mixed"
  | "other";

export type PostType = "photo" | "video" | "audio" | "text" | "mixed";

export type ReactionType = "touched" | "want" | "how" | "share";

export type MessageStatus = "sent" | "delivered" | "read";

export type MessageType = "text" | "payment_link" | "system";

export type TransactionStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type NotificationType =
  | "sale"
  | "message"
  | "reaction"
  | "new_follower"
  | "new_post"
  | "drop_starting"
  | "payout_sent";

export type DropStatus = "scheduled" | "active" | "ended";

export type CertificateType = "pdf" | "blockchain";
