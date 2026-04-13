export default function ArtistsLoading() {
  return (
    <main className="min-h-screen bg-background" role="status" aria-live="polite">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded bg-gray-100" />
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-32 w-32 animate-pulse rounded-full bg-gray-200" />
              <div className="mt-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
