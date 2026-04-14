"use client";

import { useState } from "react";

export function CopyReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm"
      />
      <button
        type="button"
        onClick={onCopy}
        disabled={!url}
        className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
