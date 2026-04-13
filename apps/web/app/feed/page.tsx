import type { Metadata } from "next";
import { FeedList } from "@/components/feed/FeedList";

export const metadata: Metadata = {
  title: "Feed",
  description: "Suivez les artistes que vous aimez et decouvrez leurs dernieres publications.",
};

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight">Feed</h1>
      <FeedList />
    </main>
  );
}
