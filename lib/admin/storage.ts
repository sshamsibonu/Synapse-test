export const ARTICLE_IMAGES_BUCKET = "article-images";

/** Build a public URL for a path stored in articles.cover_path. */
export function articleCoverPublicUrl(coverPath: string | null | undefined): string | null {
  if (!coverPath) return null;
  if (/^https?:\/\//i.test(coverPath)) return coverPath;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const cleaned = coverPath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${ARTICLE_IMAGES_BUCKET}/${cleaned}`;
}
