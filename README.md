# Research portfolio + Studio

An npm-workspaces monorepo with two independently deployable Next.js apps and a Node.js content microservice. The content is personalized from Ransford Oppong’s supplied CV. The layout follows the provided screenshot references. The public portfolio reproduces the supplied screenshots using original assets from https://toufiqmusah.github.io/toufiqmusah/. Reference image assets are kept in `apps/portfolio/public/reference`; replace them with your own photography, figures, icons, and links when personalizing the site. Ransford’s CV does not contain a portrait or project figures, so the profile uses initials and the research/project entries use text without invented imagery.

## Architecture

- `apps/portfolio` — public Next.js site, port 3000. Reads published content server-side; light/dark theme, responsive navigation, and publication image expansion.
- `apps/cms` — private Next.js Studio, port 3001. Profile, publications, talks, tutorials, projects, news, education, experience, interests, skills, startups, grants, and achievements. Add, edit, reorder, delete, save draft, publish.
- `services/content-api` — Node.js HTTP service, port 4000. Separate public-read and authenticated admin endpoints; Zod validation; serialized atomic file writes.
- `packages/content` — shared TypeScript contract and starter content.
- `packages/ui` — owned shadcn-style Button (Radix Slot/CVA), Input, Textarea, Badge, and shared styling. Components follow the [manual shadcn setup](https://ui.shadcn.com/docs/installation/manual); styles are plain CSS rather than Tailwind utilities.

The browser talks only to its own Next.js app. CMS route handlers authenticate an HttpOnly session and proxy changes to the API using a server-only token. Portfolio reads the published snapshot on each request. Drafts do not change the public site. An unavailable API displays explicitly labeled starter content.

## Run locally

Requires Node.js 24 and npm 11.

```bash
npm install
cp services/content-api/.env.example services/content-api/.env
cp apps/cms/.env.example apps/cms/.env.local
cp apps/portfolio/.env.example apps/portfolio/.env.local
```

Set the same random `ADMIN_API_TOKEN` in API and CMS. Set a unique `CMS_PASSWORD` (12+ characters) and `CMS_SESSION_SECRET` (32+ characters). Generate each secret separately using `openssl rand -hex 32`. Never use the example values on a public deployment.

```bash
npm run dev
```

Open http://localhost:3000 for the portfolio and http://localhost:3001 for Studio. Sign in with your configured CMS password. Add your portrait URL, contact links and CV in Profile & bio. Save drafts while editing; Publish changes updates the portfolio on its next request.

```bash
npm run typecheck
npm test
npm run build
```

## Independent deployment

Deploy from this one repository as three services. With Docker, use build targets `portfolio`, `cms`, and `api`. Each has its own container and can be deployed or scaled separately, except the initial file-backed API, which must run as one instance with persistent storage.

For a local production stack, supply `ADMIN_API_TOKEN`, `CMS_PASSWORD`, `CMS_SESSION_SECRET`, and optionally `PORTFOLIO_URL` in your shell or a root `.env`, then run:

```bash
docker compose up --build -d
```

For separate hosts:

1. Deploy `api` with a persistent volume at `/data`. Back up `/data/content.json`. Keep admin endpoints on a private network where possible.
2. Deploy `portfolio` with `CONTENT_API_URL` pointing to the API.
3. Deploy `cms` with the API URL and matching admin token, password, session secret. Set `NEXT_PUBLIC_PORTFOLIO_URL` at build time to your public portfolio URL.
4. Put both websites behind HTTPS, attach separate domains, and configure login rate limiting at your reverse proxy. The single-admin password flow does not provide MFA, multi-user accounts, password reset, or distributed login throttling.

You can alternatively build each app with `npm run build -w @portfolio/web` / `@portfolio/cms` and run its `start` command from the monorepo. Run `npm start -w @portfolio/api` for the API. Next.js standalone output is packaged by the Docker targets.

The API uses persistent JSON storage to make this version straightforward to run. For multiple API instances, migrate the storage adapter to PostgreSQL before scaling. CMS Media library supports image and document uploads up to 20 MB, reuse, renaming, and image crop/zoom/90-degree rotation. Images are normalized to WebP and EXIF/GPS metadata is stripped. Animated GIF/WebP uploads retain animation; cropping is limited to still images. Documents are served as downloads. Crops save a new image and retain the original. Assets live in `media/` beside `DATA_FILE` (or `MEDIA_DIR`), so back up the complete persistent data directory, not just the content JSON. Both Next.js apps proxy `/media/*` to the API, preserving uploaded assets across separate deployments. For horizontal scaling, replace the local storage adapter with object storage alongside the database migration. CMS sessions expire after eight hours; rotate the session secret to invalidate all sessions.

No cloud hosting resources have been provisioned. Deployment manifests are included for your chosen host.

## This workspace

Local development secrets have been generated in ignored `services/content-api/.env` and `apps/cms/.env.local`. Read `CMS_PASSWORD` in the latter to sign in locally. Do not commit those files. `npm run test:smoke` checks the running stack, including login and draft/publish isolation, and restores the original content afterward.

## Entrepreneurship and CSR

The public navigation includes `/entrepreneurship` and an external CSR link to https://ngotgiants.buildscitech.com. Entrepreneurship is populated from the supplied CV and edited in Studio under Startups & ventures, Grants & funding, and Achievements. The FEF-AI4SD project funding is not listed as a personal grant.

For any image or file field, choose **Upload**, **Choose from library**, or an existing URL. Uploading saves the asset to the media library; **Save draft** / **Publish changes** controls when its placement appears on the public site. Files in the library have public URLs once uploaded; do not upload private documents. Cropping saves a separate version. Existing links continue to work after a file rename. Supported documents: PDF, DOCX, XLSX, PPTX, TXT, CSV, Markdown, and ZIP. SVG/HTML/executable uploads are not accepted.

## News articles and publication layout

Each homepage news headline opens `/news/<id>`, with a full article, date, optional uploaded image, attachment, and source link. Edit **News & updates** in Studio: the headline appears in the news panel, the article heading names the detail page, and **Full article content** accepts paragraphs separated by blank lines. **View published article** opens its public page. Saving a draft does not change the public article; publish when ready. Article IDs are stable when reordering entries.

Publication rows always preserve the screenshot layout: a 150 × 100 thumbnail column, then title, author/citation text, and bracketed resource links. Upload each publication figure through **Publications → Image**; an empty thumbnail slot is retained until an image is supplied. Full or abbreviated forms of the profile name are emphasized in the citation.

## Screenshot rows, skills, and social links

Talks/tutorials and projects retain the reference thumbnail-and-text rows even before images are uploaded. Talks and tutorials appear in two columns on desktop; projects use a single-column list with an image beside each entry. Each Skills & Tools category heading independently expands its details, with all skill groups editable in Studio.

The profile always shows the five reference icons: Email, GitHub, LinkedIn, Google Scholar, and CV. Set their destinations in **Profile & bio**, including the Google Scholar URL and uploaded CV file. Icons without a supplied destination remain visible without inventing a URL.

`node scripts/sync-cv-content.mjs` audits the saved CMS against the CV-derived starter content and fills missing entries. It keeps existing edits and media, takes a backup before changes, and preserves separate unpublished drafts.
