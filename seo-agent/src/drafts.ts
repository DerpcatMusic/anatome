/**
 * Generate SEO draft pages using OpenAI API.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { writePage, pageExists, type SeoFrontmatter } from "./files";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Opportunity {
  keyword: string;
  action: "create" | "rewrite" | "improve-meta";
  score: number;
}

function loadOpportunities(): Opportunity[] {
  const file = path.resolve(import.meta.dirname, "../data/opportunities.json");
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Opportunity[];
}

function slugifyHebrew(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0590-\u05FF\w\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateDraft(keyword: string, pageType: string): Promise<{ frontmatter: SeoFrontmatter; body: string }> {
  const today = new Date().toISOString().split("T")[0];
  const slug = slugifyHebrew(keyword);

  const systemPrompt = `אתה כותב תוכן SEO בעברית לאתר פילאטיס אונליין בשם "אנטומי".
האתר מציע שיעורי פילאטיס אונליין בזום, ספריית וידאו, ותוכניות אישיות.
המדריכה הראשית היא יובל מור — מדריכת פילאטיס שיקומי מוסמכת.

חוקים:
- כתוב בעברית שוטפת, טבעית, ומקצועית
- אל תכתוב "טקסט SEO" — כתוב תוכן אמיתי שעוזר לקוראת
- הוסף כותרות H2, רשימות, ושאלות נפוצות
- אל תבטיח תוצאות רפואיות — השתמש בניסוח זהיר כמו "עשוי לסייע" או "רבות מלקוחותינו מדווחות"
- בסוף כל דף, הוסף קריאה לפעולה (CTA) להרשמה לאתר
- אורך: 800–1500 מילים`;

  const userPrompt = `כתוב דף SEO מסוג "${pageType}" למילת המפתח: "${keyword}".

המבנה צריך לכלול:
1. כותרת ראשית (H1) שמושכת קליקים
2. פסקת פתיחה קצרה ותמציתית
3. 3–5 כותרות משנה (H2) עם תוכן עמוק
4. שאלות נפוצות (FAQ) בכותרות H3
5. קריאה לפעולה בסוף

החזר תשובה בפורמט הבא:

TITLE: <כותרת הדף>
META_TITLE: <meta title עד 60 תווים>
META_DESCRIPTION: <meta description עד 160 תווים>

---

<תוכן הדף במרקדאון>`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const raw = res.choices[0]?.message?.content ?? "";

  // Parse the response
  const titleMatch = raw.match(/TITLE:\s*(.+)/);
  const metaTitleMatch = raw.match(/META_TITLE:\s*(.+)/);
  const metaDescMatch = raw.match(/META_DESCRIPTION:\s*(.+)/);
  const bodyMatch = raw.match(/---\s*\n([\s\S]+)/);

  const frontmatter: SeoFrontmatter = {
    slug,
    title: titleMatch?.[1]?.trim() ?? keyword,
    metaTitle: metaTitleMatch?.[1]?.trim() ?? `${keyword} | אנטומי`,
    metaDescription: metaDescMatch?.[1]?.trim() ?? `מידע מקצועי על ${keyword} — אנטומי, פילאטיס אונליין בישראל.`,
    targetKeyword: keyword,
    keywordCluster: pageType,
    pageType: pageType as SeoFrontmatter["pageType"],
    language: "he",
    canonical: `https://www.anatome.co.il/${slug}`,
    publishedAt: today,
    updatedAt: today,
    schema: pageType === "faq" ? "FAQPage" : pageType === "guide" ? "HowTo" : "Article",
  };

  const body = bodyMatch?.[1]?.trim() ?? raw;

  return { frontmatter, body };
}

export async function createDrafts(limit = 3) {
  const ops = loadOpportunities().filter((o) => o.action === "create");
  console.log(`🎯 ${ops.length} "create" opportunities found. Generating top ${limit}...\n`);

  let created = 0;
  for (const op of ops.slice(0, limit)) {
    const slug = slugifyHebrew(op.keyword);
    if (pageExists(slug)) {
      console.log(`⚠️  Page already exists: ${slug} — skipping`);
      continue;
    }

    console.log(`📝 Generating: ${op.keyword}...`);
    try {
      const { frontmatter, body } = await generateDraft(op.keyword, "guide");
      writePage(frontmatter, body);
      created++;
    } catch (e) {
      console.error(`❌ Failed to generate ${op.keyword}:`, e);
    }
  }

  console.log(`\n✅ Created ${created} draft(s). Review them in src/content/seo/`);
}

// CLI entry
if (import.meta.main) {
  createDrafts().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
