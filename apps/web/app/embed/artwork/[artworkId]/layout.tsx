// Bare layout — intentionally minimal so the embed page renders
// its own full HTML document without the global header / nav.
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
