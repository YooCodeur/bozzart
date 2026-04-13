"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function DeleteAccountPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, confirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erreur lors de la suppression du compte");
        setDeleting(false);
        return;
      }

      toast.success("Compte supprime");
      await signOut();
      router.push("/");
    } catch {
      toast.error("Erreur reseau lors de la suppression du compte");
      setDeleting(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">Supprimer mon compte</h1>
      <p className="mt-2 text-gray-600">
        Cette action est irreversible. Toutes vos donnees seront supprimees :
        profil, oeuvres, posts, messages, transactions.
      </p>

      <div className="mt-8 max-w-lg rounded-lg border border-red-200 bg-red-50 p-6">
        <label htmlFor="delete-confirmation" className="text-sm text-red-800">
          Pour confirmer, tapez <strong>SUPPRIMER MON COMPTE</strong> ci-dessous :
        </label>
        <input
          id="delete-confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-3 block w-full rounded-md border border-red-300 px-3 py-2"
          placeholder="SUPPRIMER MON COMPTE"
        />
        {confirmation.length > 0 && confirmation !== "SUPPRIMER MON COMPTE" && (
          <p className="mt-2 text-sm text-red-600">La confirmation ne correspond pas</p>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting || confirmation !== "SUPPRIMER MON COMPTE"}
          className="mt-4 rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Suppression..." : "Supprimer definitivement"}
        </button>
      </div>
    </div>
  );
}
