"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Row {
  week_start: string;
  median_price: number | null;
  tx_count: number;
}

export function MediumSparkline({ data }: { data: Row[] }) {
  const chart = data.map((r) => ({
    week: new Date(r.week_start).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    prix: r.median_price ? Number(r.median_price) : 0,
    ventes: r.tx_count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="prix" stroke="#7e22ce" strokeWidth={2} dot={false} name="Prix médian (€)" />
        <Line type="monotone" dataKey="ventes" stroke="#10b981" strokeWidth={2} dot={false} name="Ventes" />
      </LineChart>
    </ResponsiveContainer>
  );
}
