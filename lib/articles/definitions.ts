import fs from "node:fs";
import path from "node:path";

export type ArticleCategory =
  | "memory"
  | "attention"
  | "sleep"
  | "learning"
  | "emotion"
  | "research";

export interface ArticleDefinition {
  id: string;
  category: ArticleCategory;
  /** ISO date — used for display and ordering. */
  published: string;
  readingMinutes: number;
  /** The homepage topic this article answers, if any. */
  topic?: string;
  /** The cognitive test a reader can try afterwards, where one exists. */
  relatedTest?: string;
  /** Path under images/, resolved at render time. Null until one exists. */
  coverFile: string | null;
  /** Focal point for the cover crop. */
  focal: string;
  featured?: boolean;
}

/**
 * Article metadata lives in code; the prose lives in the message files so it
 * can be translated. Order here is the order shown in the catalogue.
 */
export const ARTICLE_DEFINITIONS: ArticleDefinition[] = [
  {
    id: "forgetting-names",
    category: "memory",
    published: "2026-08-04",
    readingMinutes: 6,
    topic: "memory",
    relatedTest: "digit-span",
    coverFile: "homepage_img/02_explore_memory.jpeg",
    focal: "50% 42%",
    featured: true,
  },
  {
    id: "automatic-reading",
    category: "attention",
    published: "2026-07-22",
    readingMinutes: 5,
    topic: "attention",
    relatedTest: "stroop-test",
    coverFile: "homepage_img/03_explore_attention.jpg",
    focal: "50% 50%",
  },
  {
    id: "sleep-and-memory",
    category: "sleep",
    published: "2026-07-09",
    readingMinutes: 6,
    topic: "sleep",
    relatedTest: "simple-reaction-time",
    coverFile: "homepage_img/04_explore_sleep.jpg",
    focal: "52% 48%",
  },
  {
    id: "rereading-illusion",
    category: "learning",
    published: "2026-06-25",
    readingMinutes: 5,
    topic: "learning",
    relatedTest: "n-back",
    coverFile: "homepage_img/05_explore_learning.jpg",
    focal: "42% 55%",
  },
  {
    id: "feeling-and-thinking",
    category: "emotion",
    published: "2026-06-11",
    readingMinutes: 6,
    topic: "emotion",
    coverFile: "homepage_img/06_explore_emotion.jpg",
    focal: "30% 45%",
  },
  {
    id: "cognition-uzbekistan",
    category: "research",
    published: "2026-05-28",
    readingMinutes: 7,
    coverFile: "articles_img/15_article_research_uzbekistan.jpg",
    // Notebook sits centre-left; keep it in frame through the 21:9 crop.
    focal: "42% 58%",
  },
];

export function getArticle(id: string): ArticleDefinition | undefined {
  return ARTICLE_DEFINITIONS.find((a) => a.id === id);
}

export function getArticleForTopic(topic: string): ArticleDefinition | undefined {
  return ARTICLE_DEFINITIONS.find((a) => a.topic === topic);
}

/**
 * Resolves a cover from any path under images/. Checking the file system at
 * render time means dropping the file in is enough — no code change. An
 * article without one falls back to the typographic cover rather than
 * leaving a hole.
 */
export function resolveCover(article: ArticleDefinition): string | null {
  if (!article.coverFile) return null;
  try {
    const publicPath = path.join(process.cwd(), "public", "images", article.coverFile);
    return fs.existsSync(publicPath) ? `/images/${article.coverFile}` : null;
  } catch {
    return null;
  }
}
