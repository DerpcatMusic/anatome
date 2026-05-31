import type { PageLoad } from "./$types";
import matter from "gray-matter";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { error } from "@sveltejs/kit";
import fs from "node:fs";
import path from "node:path";

export const prerender = true;

const CONTENT_DIR = path.resolve("content/seo");

export async function entries() {
	const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
	return files.map((file) => {
		const slug = file.replace(".md", "");
		return { slug };
	});
}

export const load: PageLoad = async ({ params }) => {
	const filePath = path.join(CONTENT_DIR, `${params.slug}.md`);
	if (!fs.existsSync(filePath)) {
		error(404, "Not found");
	}

	const raw = fs.readFileSync(filePath, "utf-8");
	const parsed = matter(raw);
	const rawHtml = await marked(parsed.content);
	const html = DOMPurify.sanitize(rawHtml);

	return {
		slug: params.slug,
		frontmatter: parsed.data as SeoFrontmatter,
		contentHtml: html,
	};
};

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
