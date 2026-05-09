# sektant's hideout

Private personal site for technical posts, project notes, series, search, and a localhost-first admin CMS.

## Install

```bash
npm install
```

`@sektant1/phosphor-ui` is consumed as a dependency from the local tarball in this repo.

## Development

```bash
npm run dev
npm run typecheck
npm run lint
npm run content:check
npm run search:index
npm run build
```

## Content

Content lives under `content/`. Each item has its own directory with `index.mdx`.

Post frontmatter:

```yaml
---
title: "Post title"
slug: "post-title"
description: "Short SEO description."
date: "2026-05-08"
updated: "2026-05-08"
published: true
draft: false
tags: ["c++", "graphics"]
series: "engine-log"
seriesOrder: 1
featured: false
---
```

Project frontmatter:

```yaml
---
title: "Project"
slug: "project"
description: "Short summary."
date: "2026-05-08"
published: true
draft: false
tags: ["graphics"]
techStack: ["C++"]
media: []
featured: true
status: "active"
---
```

Drafts are excluded from public routes and included in admin lists.

## Admin

Admin routes are under `/admin` and are localhost-only by default. Set:

```env
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
AUTH_SECRET=
LOCAL_ADMIN_ONLY=true
```

Generate a bcrypt hash in your own shell, then put it in `.env.local`.

All admin writes go through `ContentRepository`. The default backend is the local filesystem. Set `CONTENT_BACKEND=github` to store content in GitHub through the repository interface.

For the GitHub backend, set:

```env
CONTENT_BACKEND=github
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
```

`GITHUB_TOKEN` must be able to read and write repository contents. Keep `LOCAL_ADMIN_ONLY=true` unless you intentionally want the hosted app to expose admin routes.

## Search

Search is static and local:

```bash
npm run search:index
```

The generated file is `public/search-index.json` and includes published posts and projects only.

## Deployment

Public pages are statically generated where possible. Keep admin environment variables out of the client.

This repo deploys from GitHub to Vercel with GitHub Actions and the Vercel CLI.

One-time setup:

1. Create the project on Vercel from your local shell:

   ```bash
   npx vercel login
   npx vercel
   ```

2. In Vercel, add production/preview environment variables:

   ```env
   CONTENT_BACKEND=github
   GITHUB_TOKEN=
   GITHUB_OWNER=
   GITHUB_REPO=
   GITHUB_BRANCH=main
   GITHUB_PACKAGES_TOKEN=
   SITE_URL=https://your-domain.example
   AUTH_SECRET=
   ADMIN_USERNAME=
   ADMIN_PASSWORD_HASH=
   LOCAL_ADMIN_ONLY=true
   ADMIN_REGISTRATION_ENABLED=false
   ```

3. In GitHub, add repository Actions secrets:

   ```env
   VERCEL_TOKEN=
   VERCEL_ORG_ID=
   VERCEL_PROJECT_ID=
   GH_PACKAGES_TOKEN=
   ```

   `VERCEL_TOKEN` comes from Vercel account tokens. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are written to `.vercel/project.json` after `npx vercel` links the project.
   `GH_PACKAGES_TOKEN` is optional if the workflow `GITHUB_TOKEN` can read `@sektant1/phosphor-ui`; otherwise set it to a GitHub token with `read:packages`.

4. Push to GitHub. `.github/workflows/vercel.yml` deploys non-default branches as preview deployments and the default branch as production.

When `CONTENT_BACKEND=github`, `npm run build` runs `content:sync` before validation, search indexing, and `next build`, so the build uses the latest `content/**` from GitHub.

`VERCEL_DEPLOY_HOOK_URL` is optional in this CI setup. Admin content writes create GitHub commits, and those commits should trigger the GitHub Actions workflow. Use a Vercel Deploy Hook only if you also configure one explicitly for the project.
