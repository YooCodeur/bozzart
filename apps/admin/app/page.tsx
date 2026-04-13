export default function AdminHomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Bozzart — Admin</h1>
      <nav className="mt-6 space-y-2">
        <a href="/discovery" className="block text-blue-600 hover:underline">
          Curation / Decouverte
        </a>
        <a href="/artists" className="block text-blue-600 hover:underline">
          Artistes
        </a>
        <a href="/moderation" className="block text-blue-600 hover:underline">
          Moderation
        </a>
      </nav>
    </main>
  );
}
