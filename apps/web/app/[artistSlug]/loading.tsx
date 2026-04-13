export default function ArtistProfileLoading() {
  return (
    <main className="min-h-screen" role="status" aria-live="polite">
      <header className="border-b bg-white px-8 py-12">
        <div className="mx-auto max-w-4xl flex items-start gap-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </header>
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl gap-4 px-6 py-3">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </nav>
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
              <div className="mt-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
