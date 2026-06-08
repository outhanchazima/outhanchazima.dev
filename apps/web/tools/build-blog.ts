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
import { Resvg } from '@resvg/resvg-js';

const SITE_URL = 'https://outhanchazima.dev';
const AUTHOR = 'Outhan Chazima';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const contentDir = join(root, 'content', 'blog');
const outFile = join(root, 'src', 'app', 'core', 'data', 'blog.generated.ts');
const publicDir = join(root, 'public');
const blogPublicDir = join(publicDir, 'blog');
const OG_FONT = 'KaTeX_SansSerif';
const ogFontFiles = [join(here, 'assets', 'og-regular.ttf'), join(here, 'assets', 'og-bold.ttf')];

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
  ogImage: string | null;
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
  // html:true — blog posts are the site owner's own trusted Markdown, rendered
  // at BUILD time (never user input), and rely on inline SVG <figure> diagrams.
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

  // ```mermaid blocks → a placeholder the client renders to SVG. The raw
  // definition is kept (escaped + in data-mermaid) so it's crawlable, visible
  // without JS, and re-renderable on theme change.
  const defaultFence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim().toLowerCase() === 'mermaid') {
      const code = token.content;
      return `<div class="mermaid" data-mermaid="${encodeURIComponent(code)}">${escapeHtml(code)}</div>\n`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };

  // Images: lazy-load + async decode (works for local /blog/... and remote URLs).
  const defaultImage =
    md.renderer.rules.image ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('decoding', 'async');
    return defaultImage(tokens, idx, options, env, self);
  };

  // External links open in a new tab, safely.
  const defaultLinkOpen =
    md.renderer.rules.link_open ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') ?? '';
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Greedy word-wrap a title into at most `maxLines` lines of ~`max` chars. */
function wrapTitle(title: string, max: number, maxLines: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1}$/, '…');
  }
  return lines;
}

/** Build a 1200×630 branded Open Graph image and rasterise it to PNG. */
function generateOgImage(slug: string, title: string, tags: string[], reading: string): string | null {
  try {
    const clean = title
      .replace(/[—–]/g, '-')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"');
    const lines = wrapTitle(clean, 26, 4);
    const blockTop = 300 - ((lines.length - 1) * 72) / 2;
    const titleSvg = lines
      .map(
        (l, i) =>
          `<text x="80" y="${blockTop + i * 72}" font-family="${OG_FONT}" font-weight="700" font-size="60" fill="#e9edf7">${escapeHtml(l)}</text>`,
      )
      .join('');
    const tagLine = tags.slice(0, 4).join('   /   ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0b1020"/>
<rect x="0" y="0" width="1200" height="6" fill="#ffb224"/>
<circle cx="1080" cy="150" r="220" fill="none" stroke="#16203f" stroke-width="2"/>
<circle cx="1120" cy="200" r="150" fill="none" stroke="#16203f" stroke-width="2"/>
<text x="80" y="96" font-family="${OG_FONT}" font-weight="700" font-size="26" fill="#ffb224" letter-spacing="3">OUTHAN CHAZIMA</text>
<text x="80" y="128" font-family="${OG_FONT}" font-size="20" fill="#8b97b8" letter-spacing="2">ENGINEERING NOTES</text>
${titleSvg}
<text x="80" y="500" font-family="${OG_FONT}" font-size="22" fill="#5fd4d0" letter-spacing="1">${escapeHtml(tagLine)}</text>
<text x="80" y="560" font-family="${OG_FONT}" font-size="20" fill="#8b97b8">${escapeHtml(reading)}   /   outhanchazima.dev/blog</text>
</svg>`;
    const resvg = new Resvg(svg, {
      font: { fontFiles: ogFontFiles, loadSystemFonts: false, defaultFontFamily: OG_FONT },
      fitTo: { mode: 'width', value: 1200 },
    });
    const png = resvg.render().asPng();
    const dir = join(blogPublicDir, slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'og.png'), png);
    return `/blog/${slug}/og.png`;
  } catch (err) {
    console.warn(`[blog] OG image generation failed for "${slug}" — falling back.`, err);
    return null;
  }
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
const reading = stats.text;
if (slug.includes('..') || /[\\/]/.test(slug)) {
  console.warn(`[blog] "${file}" has an invalid slug "${slug}" — skipped.`);
  continue;
}
const ogImage = generateOgImage(slug, String(data['title']), tags, reading);

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
      ogImage,
      author: String(data['author'] ?? AUTHOR),
      readingTime: reading,
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
  ogImage: string | null;
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
