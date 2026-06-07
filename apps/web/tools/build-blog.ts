/**
 * Build-time blog pipeline.
 *
 * Reads Markdown files from `content/blog/*.md`, renders them to HTML (Shiki
 * dual-theme syntax highlighting + heading anchors), extracts a table of
 * contents and reading time, and emits:
 *   - src/app/core/data/blog.generated.ts  (typed data consumed by the app)
 *   - public/rss.xml                        (RSS 2.0 feed)
 *   - public/sitemap.xml                    (home + blog index + every post)
 *
 * Run via `bun run tools/build-blog.ts` — wired to npm prebuild/prestart.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import Shiki from '@shikijs/markdown-it';
import readingTime from 'reading-time';

const SITE_URL = 'https://outhanchazima.dev';
const AUTHOR = 'Outhan Chazima';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const contentDir = join(root, 'content', 'blog');
const outFile = join(root, 'src', 'app', 'core', 'data', 'blog.generated.ts');
const publicDir = join(root, 'public');
const blogPublicDir = join(publicDir, 'blog');

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  updated: string | null; // ISO
  tags: string[];
  keywords: string;
  cover: string | null;
  author: string;
  readingTime: string;
  readingMinutes: number;
  toc: TocItem[];
  html: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\wÀ-￿ -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function createMarkdown(): Promise<MarkdownIt> {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  md.use(
    await Shiki({
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
    }),
  );
  md.use(anchor, {
    level: [2, 3],
    slugify,
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '#',
      placement: 'before',
      ariaHidden: true,
    }),
  });
  return md;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = [];
  const re = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[3].replace(/<[^>]+>/g, '').replace(/#/g, '').trim();
    if (text) toc.push({ level: Number(m[1]), id: m[2], text });
  }
  return toc;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function build(): Promise<void> {
  if (!existsSync(contentDir)) {
    console.warn(`[blog] no content dir at ${contentDir} — writing empty data.`);
    writeOutput([]);
    return;
  }

  const md = await createMarkdown();
  mkdirSync(blogPublicDir, { recursive: true });
  const files = readdirSync(contentDir).filter(
    (f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md',
  );

  const posts: BlogPost[] = [];
  for (const file of files) {
    const raw = readFileSync(join(contentDir, file), 'utf8');
    const { data, content } = matter(raw);
    if (data['draft'] === true) continue;

    const slug = String(data['slug'] ?? file.replace(/\.md$/, ''));
    if (!data['title'] || !data['description'] || !data['date']) {
      console.warn(`[blog] "${file}" missing title/description/date — skipped.`);
      continue;
    }

    const html = md.render(content);
    const stats = readingTime(content);
    const tags: string[] = Array.isArray(data['tags']) ? data['tags'].map(String) : [];

    // Raw Markdown endpoint for "View / Copy as Markdown" + LLM links.
    writeFileSync(
      join(blogPublicDir, `${slug}.md`),
      `# ${data['title']}\n\n${content.trim()}\n`,
      'utf8',
    );

    posts.push({
      slug,
      title: String(data['title']),
      description: String(data['description']),
      date: toIso(data['date'])!,
      updated: toIso(data['updated']),
      tags,
      keywords: String(data['keywords'] ?? tags.join(', ')),
      cover: data['cover'] ? String(data['cover']) : null,
      author: String(data['author'] ?? AUTHOR),
      readingTime: stats.text,
      readingMinutes: Math.max(1, Math.round(stats.minutes)),
      toc: extractToc(html),
      html,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  writeOutput(posts);
  writeRss(posts);
  writeSitemap(posts);
  console.log(`[blog] built ${posts.length} post(s).`);
}

function writeOutput(posts: BlogPost[]): void {
  const banner =
    '// AUTO-GENERATED by tools/build-blog.ts — do not edit by hand.\n' +
    '// Run `bun run tools/build-blog.ts` (or build/start) to regenerate.\n';
  const types = `export interface BlogTocItem { id: string; text: string; level: number; }
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string | null;
  tags: string[];
  keywords: string;
  cover: string | null;
  author: string;
  readingTime: string;
  readingMinutes: number;
  toc: BlogTocItem[];
  html: string;
}\n`;
  const body = `export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};\n`;
  writeFileSync(outFile, `${banner}\n${types}\n${body}`, 'utf8');
}

function writeRss(posts: BlogPost[]): void {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
${p.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${AUTHOR} — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Engineering notes on system design, distributed systems and applied AI.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  writeFileSync(join(publicDir, 'rss.xml'), xml, 'utf8');
}

function writeSitemap(posts: BlogPost[]): void {
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' },
    { loc: `${SITE_URL}/blog`, priority: '0.8', changefreq: 'weekly' },
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: (p.updated ?? p.date).slice(0, 10),
    })),
  ];
  const body = urls
    .map((u) => {
      const lastmod = 'lastmod' in u && u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${u.loc}</loc>${lastmod}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
    })
    .join('\n');
  writeFileSync(
    join(publicDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    'utf8',
  );
}

build().catch((err) => {
  console.error('[blog] build failed:', err);
  process.exit(1);
});
