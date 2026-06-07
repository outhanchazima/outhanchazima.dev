# outhanchazima.dev

Senior software engineer portfolio for **Outhan Chazima** — system design & architecture, scalable production systems.

Server-side rendered for SEO, served on **Bun**, deployed to a private Linux server and exposed via a **Cloudflare Tunnel** (no open inbound ports).

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| Framework    | Angular 22 (standalone components, signals, router, SSR + prerender) |
| Design       | Bespoke "blueprint" system — Fraunces + IBM Plex Mono, drafting grid |
| Styling      | CSS-variable theming (`styles.scss`) + TailwindCSS v4 available    |
| Language     | TypeScript (strict)                                               |
| Runtime      | Bun (build **and** production server)                             |
| Monorepo     | Bun workspaces                                                    |
| Blog         | Markdown → build-time render (markdown-it + Shiki + Mermaid), per-post pages |
| SEO          | SSR meta + Open Graph + Twitter cards + JSON-LD, per-post OG images, sitemap, RSS, robots |
| Analytics    | PostHog (consent-gated, lazy-loaded) — pageviews, web vitals, session replay |
| Integrations | Contact form (Web3Forms) + inline booking calendar (Cal.com)      |
| Delivery     | Docker (multi-stage) + Cloudflare Tunnel (`cloudflared`)          |

## Repository layout

```
outhanchazima.dev/
├── apps/
│   └── web/                     # Angular 22 SSR application
│       ├── content/
│       │   └── blog/            # ← Markdown blog posts (one .md = one article)
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.routes.ts        # / (home), /blog, /blog/:slug
│       │   │   ├── components/          # home, hero, navbar, skills, projects, blog/, …
│       │   │   ├── core/
│       │   │   │   ├── config/          # analytics, contact (your keys go here)
│       │   │   │   ├── data/            # portfolio.data.ts + blog.generated.ts (auto)
│       │   │   │   ├── models/
│       │   │   │   └── services/        # seo, blog, analytics, github, medium, viewport, theme
│       │   │   └── shared/              # icon component, reveal + echo-title directives
│       │   ├── server.ts        # Bun/Express SSR entry (+ /healthz)
│       │   ├── index.html       # base SEO + no-flash theme bootstrap
│       │   ├── styles.scss      # the "blueprint" design system + theming
│       │   └── tailwind.css     # Tailwind entry (utilities + dark variant)
│       ├── public/              # favicon, og-image, manifest, robots, résumé, blog assets
│       │   └── blog/            # uploaded post images + auto-generated og.png / raw .md
│       └── tools/
│           ├── build-blog.ts    # Markdown → data + RSS + sitemap + per-post OG images
│           ├── generate-assets.ts
│           └── assets/          # vendored OFL font for OG-image text
├── deploy/
│   ├── Dockerfile               # multi-stage Bun build → minimal Bun runtime
│   ├── docker-compose.yml       # web + cloudflared (token-based tunnel)
│   ├── docker-compose.cloudflared-config.yml  # config-file tunnel override
│   ├── cloudflared/             # tunnel config template (secrets git-ignored)
│   ├── scripts/                 # deploy.sh, setup-tunnel.sh
│   └── .env.example
├── package.json                 # workspace root + scripts
└── README.md
```

> **Generated files** (don't hand-edit — `build-blog.ts` rewrites them on every
> build/start): `src/app/core/data/blog.generated.ts`, `public/rss.xml`,
> `public/sitemap.xml`, `public/blog/<slug>.md`, `public/blog/<slug>/og.png`.

## Local development

Prerequisites: [Bun](https://bun.sh) ≥ 1.1.

```bash
bun install            # install all workspace dependencies
bun run dev            # ng serve with HMR → http://localhost:4200
```

Other useful scripts (run from the repo root):

```bash
bun run build          # production SSR build (prerenders home + every blog post)
bun run start          # run the built SSR server on Bun → http://localhost:4000
bun run test           # unit tests
bun run blog           # regenerate blog data, RSS, sitemap + per-post OG images
bun run assets         # regenerate the site OG image + icons from SVG sources
```

> `bun run dev`, `bun run build` and `bun run start` all run the blog generator
> first (via `pre*` hooks), so you rarely need to call `bun run blog` by hand.

## Editing the portfolio content

All portfolio content lives in one typed file — no template hunting:

```
apps/web/src/app/core/data/portfolio.data.ts
```

Update the profile, stats, skills, experience, or projects there and everything
re-renders. To refresh the downloadable résumé, replace
`apps/web/public/Outhan-Chazima-Resume.pdf`.

## Writing blog posts

Posts are plain Markdown files. **Add one file, get a fully-rendered, SEO-ready
article** at `/blog/<filename>` — no code changes.

### 1. Create the file

```
apps/web/content/blog/my-post-title.md
```

The file name (without `.md`) becomes the URL slug: `/blog/my-post-title`.

### 2. Add frontmatter

```yaml
---
title: 'A clear, descriptive title' # required
description: 'One-sentence summary — used for SEO + the card excerpt.' # required
date: 2026-06-07 # required (YYYY-MM-DD)
updated: 2026-06-10 # optional
tags: [System Design, TypeScript] # optional
cover: /blog/my-post-title/cover.png # optional (see images below)
keywords: 'extra, seo, keywords' # optional (defaults to tags)
author: 'Outhan Chazima' # optional
draft: false # optional — true hides it from the build
---
```

### 3. Write Markdown

Everything standard works, plus:

- **Code blocks** — syntax-highlighted with Shiki (dual light/dark theme), with a
  hover **copy** button.
- **Mermaid diagrams** — fenced \`\`\`mermaid blocks render to brand-themed SVG:

  ````markdown
  ```mermaid
  flowchart LR
    A[Client] --> B{Gateway} --> C[Service]
  ```
  ````

- **Images** — standard Markdown, lazy-loaded, click to zoom (lightbox). Use an
  uploaded file or a remote URL:

  ```markdown
  ![Alt text](/blog/my-post-title/diagram.png)
  ![Alt text](https://example.com/diagram.png)
  ```

  Uploaded images (and the optional `cover:`) live in
  `apps/web/public/blog/<slug>/`.

- **Headings** (`##`, `###`) auto-get anchor links and feed the table of contents.

### 4. Build

```bash
bun run blog   # or just bun run dev / build — the pre-hook runs it
```

The generator (`apps/web/tools/build-blog.ts`) automatically: renders the
Markdown, computes reading time + TOC, and regenerates the **RSS feed**, the
**sitemap**, a raw `.md` endpoint, and a **branded 1200×630 OG image** per post.
Each article ships full per-post SEO (title, description, canonical, Open Graph
`article` tags, Twitter card, and `BlogPosting` + `BreadcrumbList` JSON-LD).

The authoring reference also lives next to the posts in
[`apps/web/content/blog/README.md`](apps/web/content/blog/README.md).

## Configuration & integrations

Third-party keys live in small, committed config files (the public keys are safe
to ship; until set, each feature degrades gracefully):

| Feature        | File                                        | What to set                              |
| -------------- | ------------------------------------------- | ---------------------------------------- |
| Analytics      | `apps/web/src/app/core/config/analytics.config.ts` | PostHog project key + host (US/EU)  |
| Contact form   | `apps/web/src/app/core/config/contact.config.ts`   | Web3Forms access key                |
| Booking        | `apps/web/src/app/core/config/contact.config.ts`   | Cal.com link (e.g. `cal.com/you`)   |

The **GitHub** stats band and the **Medium** writing feed fetch live data at SSR
time (transferred to the client, with static fallbacks) — no keys required.

## Theming

The site uses a "blueprint" visual language — a drafting-grid sheet, an amber
"signal" accent, cyan data-flow, dashed connectors and node-style cards
(`src/styles.scss`).

- **Light** is the default: a pale drafting-paper sheet.
- **Dark** is the deep blueprint-navy variant, toggled via the navbar switch.

The theme is persisted to `localStorage` and applied before first paint by a
tiny inline script in `index.html` (no flash of the wrong theme). The whole
palette is driven by CSS variables, so one `.dark` class on `<html>` flips
everything.

## SEO & "good-to-haves"

- **SSR + prerender** — every route (home + each blog post) is prerendered to
  static HTML, so crawlers and link unfurlers get fully populated pages.
- **Open Graph + Twitter cards** — site image (`/og-image.png`) plus a **unique
  branded OG image generated per blog post**.
- **JSON-LD** — `Person` on the home page; `BlogPosting` + `BreadcrumbList` on
  each article.
- **Canonical URLs**, **`sitemap.xml`** (auto-includes every post), **`rss.xml`**
  feed, `robots.txt`, web app manifest, maskable icons.
- **Accessibility** — skip link, semantic landmarks, ARIA labels, visible focus,
  `prefers-reduced-motion` respected, WCAG-AA contrast in both themes.
- **Performance** — OnPush change detection, lean self-contained server bundle,
  lazy-loaded blog/diagram code, scroll-reveal via `IntersectionObserver`.
- **Reading UX** — table-of-contents scroll-spy, per-article reading-progress bar,
  back-to-top, ←/→ keyboard nav between posts, and a share/"copy as Markdown /
  open in ChatGPT · Claude" menu.

---

## Deployment (Linux server + Cloudflare Tunnel)

A Cloudflare Tunnel gives the site a public HTTPS endpoint at `outhanchazima.dev`
**without opening any inbound ports** — `cloudflared` dials out to Cloudflare and
forwards traffic to the `web` container over the internal Docker network.

### 1. Create the tunnel (token-based — recommended)

In the Cloudflare **Zero Trust** dashboard:

1. **Networks → Tunnels → Create a tunnel** → name it `outhanchazima`.
2. Choose **Docker** as the connector and copy the **token**.
3. Under **Public Hostnames**, add:
   - `outhanchazima.dev` → service `http://web:4000`
   - `www.outhanchazima.dev` → service `http://web:4000`

### 2. Configure the server

```bash
git clone <your-repo> outhanchazima.dev && cd outhanchazima.dev
cp deploy/.env.example deploy/.env
# edit deploy/.env and paste TUNNEL_TOKEN
```

### 3. Deploy

```bash
bun run deploy          # or: ./deploy/scripts/deploy.sh
```

This builds the image, starts `web` + `cloudflared`, waits for the health check,
and the site is live at https://outhanchazima.dev.

Common operations:

```bash
bun run docker:logs     # tail logs
bun run docker:down     # stop the stack
./deploy/scripts/deploy.sh --no-build   # restart without rebuilding
```

### Alternative: locally-managed tunnel (config file)

If you'd rather keep tunnel state on the server instead of the dashboard:

```bash
cloudflared tunnel login
./deploy/scripts/setup-tunnel.sh outhanchazima
docker compose -f deploy/docker-compose.yml \
               -f deploy/docker-compose.cloudflared-config.yml up -d --build
```

### Notes

- `NG_ALLOWED_HOSTS` must list every public hostname the tunnel routes — Angular's
  SSR rejects requests with an unknown `Host` header (SSRF protection). It's
  pre-set to the production domains in `deploy/.env.example` and the compose file.
- The web container is **not** published to the host; only `cloudflared` can reach it.
- Health probe: `GET /healthz` (bypasses SSR/host checks).

## License

MIT © Outhan Chazima
