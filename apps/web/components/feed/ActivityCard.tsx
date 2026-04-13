"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { repostArtwork, shareArtworkLink } from "@/lib/repost";

export type ActivityType =
  | "purchased_artwork"
  | "followed_artist"
  | "followed_collector"
  | "reacted_to_post"
  | "commented_on_post"
  | "shared_artwork"
  | "published_artwork"
  | "published_post"
  | "started_drop"
  | "added_to_wishlist";

export interface ActivityActor {
  id: string;
  display_name: string;
  avatar_url: string | null;
  slug?: string | null;
}

export interface ActivityTargetArtwork {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  artist: { display_name: string; slug: string } | null;
}

export interface ActivityTargetUser {
  id: string;
  display_name: string;
  slug?: string | null;
  avatar_url?: string | null;
}

export interface ActivityTargetPost {
  id: string;
  caption: string | null;
  artist: { display_name: string; slug: string } | null;
}

export interface SocialActivity {
  id: string;
  activity_type: ActivityType;
  target_id: string | null;
  target_type: "artwork" | "post" | "user" | "drop" | null;
  created_at: string;
  actor: ActivityActor;
  artwork?: ActivityTargetArtwork | null;
  post?: ActivityTargetPost | null;
  target_user?: ActivityTargetUser | null;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

export interface GroupedActivity {
  key: string;
  activity_type: ActivityType;
  target_id: string | null;
  target_type: SocialActivity["target_type"];
  actors: ActivityActor[];
  sample: SocialActivity;
}

/**
 * Regroupe les activites de meme type visant la meme entite cible en un seul
 * element "X et N autres ont...". Conserve l'ordre (premiere occurrence).
 */
export function groupActivities(items: SocialActivity[]): GroupedActivity[] {
  const groups = new Map<string, GroupedActivity>();
  for (const item of items) {
    const key = `${item.activity_type}:${item.target_type ?? "none"}:${item.target_id ?? "none"}`;
    const existing = groups.get(key);
    if (existing) {
      if (!existing.actors.find((a) => a.id === item.actor.id)) {
        existing.actors.push(item.actor);
      }
    } else {
      groups.set(key, {
        key,
        activity_type: item.activity_type,
        target_id: item.target_id,
        target_type: item.target_type,
        actors: [item.actor],
        sample: item,
      });
    }
  }
  return Array.from(groups.values());
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ actor, size = 32 }: { actor: ActivityActor; size?: number }) {
  if (actor.avatar_url) {
    return (
      <Image
        src={actor.avatar_url}
        alt={actor.display_name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-300"
      style={{ width: size, height: size }}
    >
      {actor.display_name.charAt(0).toUpperCase()}
    </div>
  );
}

function ActorNames({ actors }: { actors: ActivityActor[] }) {
  const first = actors[0];
  if (!first) return null;
  if (actors.length === 1) {
    return <strong className="font-semibold">{first.display_name}</strong>;
  }
  if (actors.length === 2) {
    return (
      <>
        <strong className="font-semibold">{first.display_name}</strong> et{" "}
        <strong className="font-semibold">{actors[1].display_name}</strong>
      </>
    );
  }
  return (
    <>
      <strong className="font-semibold">{first.display_name}</strong> et {actors.length - 1} autres
    </>
  );
}

// ─── Renderers ────────────────────────────────────────────────────────────────

function PurchaseCard({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const artwork = sample.artwork;
  return (
    <article className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <Avatar actor={group.actors[0]} size={40} />
      <div className="flex-1">
        <p className="text-sm text-neutral-200">
          <ActorNames actors={group.actors} /> a achete{" "}
          {artwork ? (
            <Link
              href={`/${artwork.artist?.slug ?? "artist"}/artwork/${artwork.slug}`}
              className="italic underline-offset-2 hover:underline"
            >
              {artwork.title}
            </Link>
          ) : (
            <em>une oeuvre</em>
          )}
          {artwork?.artist && (
            <>
              {" "}de{" "}
              <Link href={`/${artwork.artist.slug}`} className="font-semibold hover:underline">
                {artwork.artist.display_name}
              </Link>
            </>
          )}
        </p>
        {artwork?.thumbnail_url && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <Image
              src={artwork.thumbnail_url}
              alt={artwork.title}
              width={640}
              height={480}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        <ActivityFooter activity={sample} />
      </div>
    </article>
  );
}

function FollowLine({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const label = group.activity_type === "followed_collector" ? "collectionneur" : "artiste";
  const target = sample.target_user;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
      <Avatar actor={group.actors[0]} />
      <p>
        <ActorNames actors={group.actors} /> suit maintenant le {label}{" "}
        {target ? (
          <Link href={`/${target.slug ?? target.id}`} className="font-semibold hover:underline">
            {target.display_name}
          </Link>
        ) : (
          <em>inconnu</em>
        )}
      </p>
    </div>
  );
}

function ReactionGroupLine({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const post = sample.post;
  const artistName = post?.artist?.display_name ?? "un artiste";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
      <Avatar actor={group.actors[0]} />
      <p>
        <ActorNames actors={group.actors} /> ont reagi au dernier post de{" "}
        <strong className="font-semibold">{artistName}</strong>
      </p>
    </div>
  );
}

function PublishedArtworkCard({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const artwork = sample.artwork;
  return (
    <article className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <Avatar actor={group.actors[0]} size={40} />
      <div className="flex-1">
        <p className="text-sm text-neutral-200">
          <ActorNames actors={group.actors} /> a publie une nouvelle oeuvre
          {artwork && (
            <>
              {" "}:{" "}
              <Link
                href={`/${artwork.artist?.slug ?? ""}/artwork/${artwork.slug}`}
                className="italic underline-offset-2 hover:underline"
              >
                {artwork.title}
              </Link>
            </>
          )}
        </p>
        {artwork?.thumbnail_url && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <Image
              src={artwork.thumbnail_url}
              alt={artwork.title}
              width={640}
              height={480}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        <ActivityFooter activity={sample} />
      </div>
    </article>
  );
}

function PublishedPostLine({ group }: { group: GroupedActivity }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
      <Avatar actor={group.actors[0]} />
      <p>
        <ActorNames actors={group.actors} /> a publie un nouveau post
      </p>
    </div>
  );
}

function WishlistLine({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const artwork = sample.artwork;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
      <Avatar actor={group.actors[0]} />
      <p>
        <ActorNames actors={group.actors} /> a ajoute{" "}
        {artwork ? (
          <Link
            href={`/${artwork.artist?.slug ?? ""}/artwork/${artwork.slug}`}
            className="italic hover:underline"
          >
            {artwork.title}
          </Link>
        ) : (
          <em>une oeuvre</em>
        )}{" "}
        a sa wishlist
      </p>
    </div>
  );
}

function SharedArtworkCard({ group }: { group: GroupedActivity }) {
  const { sample } = group;
  const artwork = sample.artwork;
  return (
    <article className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <Avatar actor={group.actors[0]} size={40} />
      <div className="flex-1">
        <p className="text-sm text-neutral-200">
          <ActorNames actors={group.actors} /> a partage{" "}
          {artwork ? (
            <Link
              href={`/${artwork.artist?.slug ?? ""}/artwork/${artwork.slug}`}
              className="italic hover:underline"
            >
              {artwork.title}
            </Link>
          ) : (
            <em>une oeuvre</em>
          )}
        </p>
        {artwork?.thumbnail_url && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <Image
              src={artwork.thumbnail_url}
              alt={artwork.title}
              width={640}
              height={480}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        <ActivityFooter activity={sample} />
      </div>
    </article>
  );
}

function GenericLine({ group, text }: { group: GroupedActivity; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200">
      <Avatar actor={group.actors[0]} />
      <p>
        <ActorNames actors={group.actors} /> {text}
      </p>
    </div>
  );
}

// ─── Footer (share button) ────────────────────────────────────────────────────

function ActivityFooter({ activity }: { activity: SocialActivity }) {
  const artwork = activity.artwork;
  const canShare = artwork && activity.target_type === "artwork";

  async function handleShare() {
    if (!artwork) return;
    const url = `/${artwork.artist?.slug ?? ""}/artwork/${artwork.slug}`;
    try {
      await shareArtworkLink({ title: artwork.title, url });
      await repostArtwork({ artworkId: artwork.id, metadata: { source: "activity_card" } });
      toast.success("Partage effectue");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast.error("Impossible de partager");
    }
  }

  if (!canShare) return null;
  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
      >
        Partager
      </button>
    </div>
  );
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function ActivityCard({ group }: { group: GroupedActivity }) {
  switch (group.activity_type) {
    case "purchased_artwork":
      return <PurchaseCard group={group} />;
    case "followed_artist":
    case "followed_collector":
      return <FollowLine group={group} />;
    case "reacted_to_post":
      return <ReactionGroupLine group={group} />;
    case "commented_on_post":
      return <GenericLine group={group} text="a commente un post" />;
    case "shared_artwork":
      return <SharedArtworkCard group={group} />;
    case "published_artwork":
      return <PublishedArtworkCard group={group} />;
    case "published_post":
      return <PublishedPostLine group={group} />;
    case "started_drop":
      return <GenericLine group={group} text="a lance un drop" />;
    case "added_to_wishlist":
      return <WishlistLine group={group} />;
    default:
      return null;
  }
}

export default ActivityCard;
