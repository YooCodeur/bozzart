"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface PrintProductOption {
  id: string;
  format: string;
  retail_price_cents: number;
}

interface Props {
  artworkId: string;
  products: PrintProductOption[];
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function PrintOrderSection({ products }: Props) {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [selected, setSelected] = useState<string>(products[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    line1: "",
    city: "",
    postal_code: "",
    country: "FR",
  });

  if (products.length === 0) return null;

  const product = products.find((p) => p.id === selected);

  const checkout = async () => {
    if (!user) {
      toast.error("Connectez-vous pour commander");
      return;
    }
    if (!product) return;
    if (!form.name || !form.line1 || !form.city || !form.postal_code) {
      toast.error("Adresse de livraison incomplete");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("print-checkout", {
        body: {
          print_product_id: product.id,
          quantity: 1,
          buyer_id: user.id,
          shipping_address: form,
        },
      });
      if (error) throw error;
      // deno-lint-ignore no-explicit-any
      const url = (data as any)?.url;
      if (url) window.location.href = url;
      else throw new Error("no checkout url");
    } catch (e) {
      console.error(e);
      toast.error("Impossible de demarrer le paiement");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-8 border-t pt-8">
      <h2 className="mb-4 text-lg font-semibold">Commander en print</h2>
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase text-gray-500">Format</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.format} — {fmt(p.retail_price_cents)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Nom complet"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Adresse"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Code postal"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Pays (FR)"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={checkout}
          disabled={busy}
          className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {busy ? "Redirection…" : `Commander — ${product ? fmt(product.retail_price_cents) : ""}`}
        </button>
      </div>
    </section>
  );
}
