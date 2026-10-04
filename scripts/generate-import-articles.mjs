import fs from "node:fs";

const uz = JSON.parse(fs.readFileSync("messages/uz.json", "utf8"));
const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));

const meta = [
  { id: "forgetting-names", topic: "memory" },
  { id: "automatic-reading", topic: "attention" },
  { id: "sleep-and-memory", topic: "sleep" },
  { id: "rereading-illusion", topic: "learning" },
  { id: "feeling-and-thinking", topic: "emotion" },
  // Old site category was "research"; admin topics are the five below.
  // Imported as learning — change in the SQL if you prefer another topic.
  { id: "cognition-uzbekistan", topic: "learning" },
];

function bodyFrom(item) {
  return (item.sections || [])
    .map((s) => {
      const parts = [];
      if (s.heading) parts.push(s.heading);
      for (const p of s.paragraphs || []) parts.push(p);
      return parts.join("\n\n");
    })
    .join("\n\n");
}

function dollarQuote(tag, text) {
  let t = tag;
  let i = 0;
  while (text.includes("$" + t + "$")) {
    i += 1;
    t = tag + i;
  }
  return "$" + t + "$" + text + "$" + t + "$";
}

const lines = [];
lines.push("-- One-time import of the 6 existing Synapse articles (Uz + En)");
lines.push("-- REVIEW before running. Safe to re-run: upserts on slug.");
lines.push("-- status = published so they can appear after Slice F.");
lines.push("-- lesson_id left null (optional links can be set in admin).");
lines.push("--");
lines.push('-- NOTE: cognition-uzbekistan was category "research" on the old site.');
lines.push("-- Admin topics are only memory|attention|sleep|learning|emotion,");
lines.push("-- so it is imported as topic = learning. Edit that value below if needed.");
lines.push("");
lines.push("begin;");
lines.push("");

for (const m of meta) {
  const u = uz.articles.items[m.id];
  const e = en.articles.items[m.id];
  if (!u || !e) throw new Error("missing " + m.id);

  const bodyUz = bodyFrom(u);
  const bodyEn = bodyFrom(e);

  lines.push("-- " + m.id);
  lines.push("insert into public.articles (");
  lines.push("  slug, topic, status,");
  lines.push("  title_uz, title_en,");
  lines.push("  summary_uz, summary_en,");
  lines.push("  body_uz, body_en,");
  lines.push("  lesson_id");
  lines.push(") values (");
  lines.push("  '" + m.id + "',");
  lines.push("  '" + m.topic + "',");
  lines.push("  'published',");
  lines.push("  " + dollarQuote("tuz", u.title) + ",");
  lines.push("  " + dollarQuote("ten", e.title) + ",");
  lines.push("  " + dollarQuote("suz", u.excerpt) + ",");
  lines.push("  " + dollarQuote("sen", e.excerpt) + ",");
  lines.push("  " + dollarQuote("buz", bodyUz) + ",");
  lines.push("  " + dollarQuote("ben", bodyEn) + ",");
  lines.push("  null");
  lines.push(")");
  lines.push("on conflict (slug) do update set");
  lines.push("  topic = excluded.topic,");
  lines.push("  status = excluded.status,");
  lines.push("  title_uz = excluded.title_uz,");
  lines.push("  title_en = excluded.title_en,");
  lines.push("  summary_uz = excluded.summary_uz,");
  lines.push("  summary_en = excluded.summary_en,");
  lines.push("  body_uz = excluded.body_uz,");
  lines.push("  body_en = excluded.body_en,");
  lines.push("  updated_at = now();");
  lines.push("");
}

lines.push("commit;");
lines.push("");
lines.push("select slug, topic, status,");
lines.push("  left(title_uz, 40) as title_uz,");
lines.push("  left(title_en, 40) as title_en");
lines.push("from public.articles");
lines.push("where slug in (");
lines.push(meta.map((m) => "  '" + m.id + "'").join(",\n"));
lines.push(")");
lines.push("order by slug;");

fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync("scripts/import-articles.sql", lines.join("\n"), "utf8");
console.log("Wrote scripts/import-articles.sql");
