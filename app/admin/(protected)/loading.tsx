export default function AdminLoading() {
  return (
    <div className="space-y-3 py-6" aria-busy="true" aria-live="polite">
      <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-40 animate-pulse rounded-lg bg-muted" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
