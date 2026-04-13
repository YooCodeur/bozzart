export default function DropsLoading() {
  return (
    <main className="min-h-screen bg-background" role="status" aria-live="polite">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-100" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <div className="h-48 w-full animate-pulse bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
