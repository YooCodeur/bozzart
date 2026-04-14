/**
 * Native share wrapper.
 *
 * - Uses `navigator.share()` when available (mobile web / some desktop).
 * - Falls back to copying the URL to the clipboard.
 * - Always appends UTM params (`utm_source=share`, `utm_medium=<channel>`).
 */

export type ShareChannel =
  | "native"
  | "clipboard"
  | "twitter"
  | "facebook"
  | "email"
  | string;

export interface ShareOptions {
  url: string;
  title?: string;
  text?: string;
  channel?: ShareChannel;
}

export interface ShareResult {
  method: "native" | "clipboard" | "unsupported";
  shared: boolean;
  error?: string;
}

function appendUtm(url: string, channel: ShareChannel): string {
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://bozzart.com");
    u.searchParams.set("utm_source", "share");
    u.searchParams.set("utm_medium", channel);
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}utm_source=share&utm_medium=${encodeURIComponent(channel)}`;
  }
}

export async function nativeShare(opts: ShareOptions): Promise<ShareResult> {
  const channel: ShareChannel = opts.channel || "native";
  const shareUrl = appendUtm(opts.url, channel);

  // Try Web Share API first (unless caller forced another channel)
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (channel === "native" || !opts.channel)
  ) {
    try {
      await navigator.share({
        url: shareUrl,
        title: opts.title,
        text: opts.text,
      });
      return { method: "native", shared: true };
    } catch (e) {
      // User cancelled or share rejected — fall back to clipboard
      if (e instanceof Error && e.name === "AbortError") {
        return { method: "native", shared: false, error: "aborted" };
      }
    }
  }

  // Clipboard fallback
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { method: "clipboard", shared: true };
    } catch (e) {
      return {
        method: "clipboard",
        shared: false,
        error: e instanceof Error ? e.message : "copy_failed",
      };
    }
  }

  return { method: "unsupported", shared: false };
}

export function buildShareUrl(url: string, channel: ShareChannel): string {
  return appendUtm(url, channel);
}
