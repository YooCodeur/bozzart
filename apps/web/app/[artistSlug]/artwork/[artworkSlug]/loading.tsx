export default function ArtworkLoading() {
  return (
    <main className="min-h-screen bg-white" role="status" aria-live="polite">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
            <div className="mt-6 h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-8 flex gap-3">
              <div className="h-12 w-28 animate-pulse rounded-md bg-gray-200" />
              <div className="h-12 w-36 animate-pulse rounded-md bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
