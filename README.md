# outhanchazima.dev

Senior software engineer portfolio for **Outhan Chazima** — system design & architecture, scalable production systems.

Server-side rendered for SEO, served on **Bun**, deployed to a private Linux server and exposed via a **Cloudflare Tunnel** (no open inbound ports).

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| Framework    | Angular 22 (standalone components, signals, SSR + prerender)      |
| Design       | Bespoke "blueprint" system — Fraunces + IBM Plex Mono, drafting grid |
| Styling      | CSS-variable theming (`styles.scss`) + TailwindCSS v4 available    |
| Language     | TypeScript (strict)                                               |
| Runtime      | Bun (build **and** production server)                             |
| Monorepo     | Bun workspaces                                                    |
| SEO          | SSR meta + Open Graph + Twitter cards + JSON-LD, sitemap, robots  |
| Delivery     | Docker (multi-stage) + Cloudflare Tunnel (`cloudflared`)          |

## Repository layout

```
outhanchazima.dev/
├── apps/
│   └── web/                     # Angular 22 SSR application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/  # navbar, hero, stats, about, skills, …
│       │   │   ├── core/        # data (single source of truth), models, services
│       │   │   └── shared/      # icon component, reveal directive
│       │   ├── server.ts        # Bun/Express SSR entry (+ /healthz)
│       │   ├── index.html       # base SEO + no-flash theme bootstrap
│       │   ├── styles.scss      # the "blueprint" design system + theming
│       │   └── tailwind.css     # Tailwind entry (utilities + dark variant)
│       ├── public/              # favicon, og-image, manifest, robots, sitemap, résumé
│       └── tools/               # build-time asset generation (OG image, icons)
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

## Local development

Prerequisites: [Bun](https://bun.sh) ≥ 1.1.

```bash
bun install            # install all workspace dependencies
bun run dev            # ng serve with HMR → http://localhost:4200
```

Other useful scripts (run from the repo root):

```bash
bun run build          # production SSR build (prerenders the homepage)
bun run start          # run the built SSR server on Bun → http://localhost:4000
bun run test           # unit tests
bun run assets         # regenerate OG image + icons from SVG sources
```

## Editing content

All content lives in one typed file — no template hunting:

```
apps/web/src/app/core/data/portfolio.data.ts
```

Update the profile, stats, skills, experience, or projects there and everything
re-renders. To refresh the downloadable résumé, replace
`apps/web/public/Outhan-Chazima-Resume.pdf`.

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

- **SSR + prerender** — crawlers and link unfurlers get fully populated HTML.
- **Open Graph + Twitter cards** — branded 1200×630 preview image (`/og-image.png`).
- **JSON-LD** `Person` structured data injected at runtime.
- **Canonical URL**, `robots.txt`, `sitemap.xml`, web app manifest, maskable icons.
- **Accessibility** — skip link, semantic landmarks, ARIA labels, visible focus,
  `prefers-reduced-motion` respected, WCAG-AA contrast in both themes.
- **Performance** — OnPush change detection, lean self-contained server bundle,
  scroll-reveal via `IntersectionObserver` (progressive enhancement).

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
