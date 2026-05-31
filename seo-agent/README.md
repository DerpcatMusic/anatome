# AnatoMe SEO Agent

Your private RankAI replacement. Runs on your PC. No SaaS fees.

## What it does

1. **Pulls** Google Search Console data (`bun run pull`)
2. **Finds** keyword opportunities (`bun run scan`)
3. **Generates** Hebrew Pilates drafts (`bun run draft`)
4. **Monitors** existing pages and suggests rewrites (`bun run monitor`)

## Setup

```bash
cd seo-agent
cp .env.example .env
# Edit .env with your GSC service account key and OpenAI API key
```

## Commands

```bash
bun run pull        # Fetch last 28 days of GSC data → data/gsc/
bun run scan        # Score opportunities → data/opportunities.json
bun run draft       # Generate top 3 drafts → ../content/seo/
bun run monitor     # Check pages, suggest rewrites
```

## Workflow

```bash
# 1. Pull fresh data
bun run pull

# 2. Find opportunities
bun run scan

# 3. Generate drafts
bun run draft

# 4. Review drafts in Cursor (open ../content/seo/*.md)

# 5. Build and deploy
cd ..
bun run build && bun run deploy
```

## GSC API Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a **Service Account**
3. Enable **Google Search Console API**
4. Download the JSON key
5. In [Search Console](https://search.google.com/search-console), add the service account email as an **Owner**
6. Set `GSC_KEY_FILE` in `.env` to the JSON key path

## Content Format

Drafts are Markdown with YAML frontmatter:

```markdown
---
slug: "פילאטיס-למתחילים"
title: "..."
metaTitle: "..."
metaDescription: "..."
targetKeyword: "..."
pageType: "guide"
language: "he"
---

Content here...
```

## Costs

- GSC API: **Free**
- OpenAI API (GPT-4o-mini): **~$5–30/mo** for 20–50 pages
- Total: **Under $50/mo** vs RankAI's $500/mo
