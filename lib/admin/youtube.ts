/**
 * Turn a pasted YouTube link into an embed URL.
 * Rejects iframe/HTML paste and non-YouTube URLs.
 */

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export type YoutubeParseResult =
  | { ok: true; videoId: string; embedUrl: string }
  | { ok: false; message: string };

export function parseYoutubeInput(raw: string): YoutubeParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Paste a YouTube link." };
  }

  if (/<iframe/i.test(trimmed) || /<script/i.test(trimmed)) {
    return {
      ok: false,
      message: "Paste a normal YouTube link, not embed code or HTML.",
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, message: "That does not look like a valid link." };
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return { ok: false, message: "Only YouTube links are allowed." };
  }

  let videoId: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else {
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.searchParams.has("v")) {
      videoId = url.searchParams.get("v");
    } else if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
      videoId = parts[1] ?? null;
    } else if (parts[0] === "watch") {
      videoId = url.searchParams.get("v");
    }
  }

  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    return {
      ok: false,
      message: "Could not find a YouTube video ID in that link.",
    };
  }

  return {
    ok: true,
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}
