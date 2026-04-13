"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function ExportPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!user) return;
    setExporting(true);

    try {
      const response = await fetch("/api/artworks/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Erreur lors de l'export des donnees");
        setExporting(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bozzart-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export telecharge avec succes !");
    } catch {
      toast.error("Erreur reseau lors de l'export");
    }

    setExporting(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Passeport Artiste</h1>
      <p className="mt-2 text-gray-600">
        Exportez toutes vos donnees : profil, oeuvres, posts, messages et transactions.
      </p>

      <div className="mt-8 max-w-lg rounded-lg border p-6">
        <h3 className="font-medium">Export complet</h3>
        <p className="mt-1 text-sm text-gray-600">
          Telecharge un fichier JSON contenant toutes vos donnees. Conforme RGPD.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {exporting ? "Export en cours..." : "Telecharger mes donnees"}
        </button>
      </div>
    </div>
  );
}
