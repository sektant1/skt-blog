# sektant's hideout

Private personal site for technical posts, project notes, series, search, and a localhost-only filesystem admin CMS.

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

All admin writes go through `ContentRepository`. V1 uses the local filesystem repository. A typed GitHub repository-backed CMS placeholder exists for future production writes.

## Search

Search is static and local:

```bash
npm run search:index
```

The generated file is `public/search-index.json` and includes published posts and projects only.

## Deployment

Public pages are statically generated where possible. Keep admin environment variables out of the client. A future GitHub-backed CMS can use the placeholder env vars in `.env.example`.
