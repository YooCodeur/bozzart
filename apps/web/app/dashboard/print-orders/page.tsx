"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Status = "pending" | "paid" | "printing" | "shipped" | "delivered" | "canceled";

interface Row {
  id: string;
  quantity: number;
  status: Status;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  print_product: {
    format: string;
    retail_price_cents: number;
    artwork: { title: string; image_url: string | null } | null;
  } | null;
}

const STATUS_ORDER: Status[] = ["pending", "paid", "printing", "shipped", "delivered"];
const STATUS_LABEL: Record<Status, string> = {
  pending: "En attente",
  paid: "Paye",
  printing: "Impression",
  shipped: "Expedie",
  delivered: "Livre",
  canceled: "Annule",
};

function trackingUrl(carrier: string | null, tracking: string | null): string | null {
  if (!carrier || !tracking) return null;
  const c = carrier.toLowerCase();
  if (c.includes("dhl")) return `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${tracking}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${tracking}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;
  if (c.includes("chronopost")) return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${tracking}`;
  if (c.includes("colissimo") || c.includes("laposte"))
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${tracking}`;
  return `https://www.google.com/search?q=${encodeURIComponent(carrier + " " + tracking)}`;
}

export default function PrintOrdersPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [orders, setOrders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("print_orders")
        .select(
          `id, quantity, status, tracking_number, carrier, created_at,
           print_product:print_products(
             format, retail_price_cents,
             artwork:artworks(title, image_url)
           )`,
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      // deno-lint-ignore no-explicit-any
      setOrders(((data as any) ?? []).map((r: any) => ({
        ...r,
        print_product: Array.isArray(r.print_product) ? r.print_product[0] : r.print_product,
      })).map((r: any) => ({
        ...r,
        print_product: r.print_product
          ? {
              ...r.print_product,
              artwork: Array.isArray(r.print_product.artwork)
                ? r.print_product.artwork[0]
                : r.print_product.artwork,
            }
          : null,
      })));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, supabase]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Chargement…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mes commandes print</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune commande pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const idx = STATUS_ORDER.indexOf(o.status);
            const url = trackingUrl(o.carrier, o.tracking_number);
            return (
              <li key={o.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-4">
                  {o.print_product?.artwork?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.print_product.artwork.image_url}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {o.print_product?.artwork?.title ?? "Oeuvre"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Format {o.print_product?.format} · qte {o.quantity} ·{" "}
                      {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {STATUS_LABEL[o.status]}
                  </div>
                </div>

                {o.status !== "canceled" && (
                  <div className="mt-4">
                    <ol className="flex items-center gap-2 text-xs">
                      {STATUS_ORDER.map((s, i) => (
                        <li key={s} className="flex flex-1 items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              i <= idx ? "bg-black" : "bg-gray-300"
                            }`}
                          />
                          <span className={i <= idx ? "text-gray-900" : "text-gray-400"}>
                            {STATUS_LABEL[s]}
                          </span>
                          {i < STATUS_ORDER.length - 1 && (
                            <div
                              className={`h-px flex-1 ${
                                i < idx ? "bg-black" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Suivre le colis ({o.carrier} {o.tracking_number}) →
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
