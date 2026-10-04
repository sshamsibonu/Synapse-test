export function AdminStatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={
        published
          ? "inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          : "inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
      }
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
