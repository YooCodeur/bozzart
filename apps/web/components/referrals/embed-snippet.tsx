"use client";

import { useState } from "react";

export function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <pre className="overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap break-all">
        {snippet}
      </pre>
      <div className="mt-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          {copied ? "Copié" : "Copier le code"}
        </button>
      </div>
    </div>
  );
}
