/**
 * Read and write SEO markdown files to the main repo's content folder.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// seo-agent is at repo-root/seo-agent/, content is at repo-root/content/seo/
const CONTENT_DIR = path.resolve(import.meta.dirname, "../../content/seo");

export interface SeoFrontmatter {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  keywordCluster?: string;
  pageType: "landing" | "guide" | "comparison" | "faq" | "video";
  language: string;
  canonical?: string;
  publishedAt?: string;
  updatedAt?: string;
  schema?: string;
}

export interface SeoPage {
  slug: string;
  frontmatter: SeoFrontmatter;
  content: string; // raw markdown body
}

function ensureDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

export function listPages(): SeoPage[] {
  ensureDir();
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const slug = file.replace(".md", "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const parsed = matter(raw);
    return {
      slug,
      frontmatter: parsed.data as SeoFrontmatter,
      content: parsed.content,
    };
  });
}

export function readPage(slug: string): SeoPage | null {
  ensureDir();
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  return {
    slug,
    frontmatter: parsed.data as SeoFrontmatter,
    content: parsed.content,
  };
}

export function writePage(frontmatter: SeoFrontmatter, content: string): void {
  ensureDir();
  const filePath = path.join(CONTENT_DIR, `${frontmatter.slug}.md`);
  const raw = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, raw, "utf-8");
  console.log(`✍️  Wrote ${filePath}`);
}

export function pageExists(slug: string): boolean {
  ensureDir();
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`));
}
