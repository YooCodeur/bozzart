"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface SlotRow {
  id: string;
  slot_date: string;
  slot_hour: number;
  is_active: boolean;
  artwork: { id: string; title: string; primary_image_url: string; artist: { full_name: string } };
}

export default function DiscoveryAdminPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]!);
  const [slots, setSlots] = useState<SlotRow[]>([]);

  useEffect(() => {
    supabase
      .from("discovery_slots")
      .select("*, artwork:artworks(id, title, primary_image_url, artist:artist_profiles(full_name))")
      .eq("slot_date", date)
      .order("slot_hour", { ascending: true })
      .then(({ data }) => setSlots((data as unknown as SlotRow[]) || []));
  }, [date]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const slotsByHour = new Map(slots.map((s) => [s.slot_hour, s]));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Curation — Decouverte</h1>

      <div className="mt-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border px-3 py-2"
        />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        {hours.map((hour) => {
          const slot = slotsByHour.get(hour);
          return (
            <div key={hour} className={`rounded-lg border p-4 ${slot ? "bg-white" : "bg-gray-50"}`}>
              <p className="text-sm font-medium text-gray-500">{hour}h00</p>
              {slot ? (
                <div className="mt-2">
                  <img src={slot.artwork.primary_image_url} alt="" className="h-16 w-full rounded object-cover" />
                  <p className="mt-1 text-sm font-medium truncate">{slot.artwork.title}</p>
                  <p className="text-xs text-gray-500">{slot.artwork.artist.full_name}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">Vide</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
