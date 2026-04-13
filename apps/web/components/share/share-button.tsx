"use client";

import { useState } from "react";
import { nativeShare } from "@/lib/share/native-share";

interface Props {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({ url, title, text, className, children }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  async function onClick() {
    const result = await nativeShare({ url, title, text });
    if (result.shared) {
      setState(result.method === "native" ? "shared" : "copied");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label =
    state === "copied"
      ? "Lien copié"
      : state === "shared"
        ? "Partagé"
        : (children ?? "Partager");

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:border-gray-300"
      }
    >
      {label}
    </button>
  );
}
