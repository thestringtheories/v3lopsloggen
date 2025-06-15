// app/not-found.tsx
export const dynamic = 'force-dynamic';   // valgfritt – behold om du ønsker CSR

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-neutral-600">Page not found</p>
    </main>
  );
}