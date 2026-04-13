export default function DiscoverLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-black" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-white/80 text-sm">Chargement...</p>
      </div>
    </div>
  );
}
