# SPEC_AND_CODEX_PROMPT.md — sektant's hideout

## 0. Codex Task Summary

Create a new private Next.js + TypeScript personal blog/portfolio project named:

```txt
sektant's hideout
```

The site is a personal blog, not a corporate portfolio. It should feel like a technical hideout / CRT terminal / phosphor-green personal archive, using the existing UI library:

```txt
@sektant1/phosphor-ui
```

The site must initially support:

- Blog posts written in Markdown or MDX.
- Projects/portfolio entries written in Markdown or MDX.
- Series support for related posts.
- Search.
- Localhost-only admin CMS.
- Static public pages.
- SEO.
- SCSS modules.
- A page-feature directory where each page owns its components and styles.

Future scope:

- Courses/lessons.
- Production CMS backed by GitHub commits.
- i18n.
- Do not implement these future features now, but keep the structure ready.

---

## 1. Hard Architectural Decision

Create this as a separate private application repository.

Do not build this blog inside the `@sektant1/phosphor-ui` repository.

Reason:

- `@sektant1/phosphor-ui` is a reusable public component library.
- This blog is a private application with content, admin auth, CMS behavior, deployment, and personal writing.
- The blog must consume the UI library as a dependency.

Install:

```bash
npm install @sektant1/phosphor-ui
```

Import once at the root layout:

```ts
import "@sektant1/phosphor-ui/tokens.css";
import "@sektant1/phosphor-ui/global.css";
import "@/styles/globals.scss";
```

Codex must inspect the installed package exports before using components.

Prefer `@sektant1/phosphor-ui` components whenever possible. Do not recreate buttons, cards, headers, inputs, textareas, callouts, post bodies, code blocks, tags, listings, ASCII banners, or layout shells from scratch if the UI library already provides them.

Known useful library components:

```txt
CrtShell
Header
Footer
FooterStencil
HeroFrame
NerdTree
PdaWindow
Prose
PostBody
Callout
CodeBlock
Hr
Tag
Text
AsciiBanner
TerminalPrompt
PostListing
PostRow
CourseCard
LessonRow
ModuleAccordion
PrereqList
Exercise
BootNav
Pagination
Stepper
TableOfContents
Link
Button
Input
Textarea
Checkbox
ProgressBar
ReadingRail
VideoPlayer
```

If a required app-specific component is missing, create a thin wrapper around primitive HTML or the closest `phosphor-ui` component under:

```txt
src/components/ui/
```

Do not modify the UI library from this repo.

---

## 2. Stack

Use:

```txt
Next.js App Router
TypeScript strict mode
React
MDX
SCSS modules
Zod
gray-matter
fast-glob
reading-time
Fuse.js or MiniSearch for local search
bcryptjs or argon2 for password verification
jose or iron-session for signed admin session cookies
```

Use public pages as Server Components by default.

Use Client Components only when needed:

- Search input/results.
- Admin editor.
- Admin forms.
- Preview toggles.
- Theme/menu interactions.

Avoid a database in v1.

---

## 3. Repository Structure

Use this structure.

Important: use `src/app` for Next.js routing. Do not use the legacy Next `src/pages` router.

The requested “pages directory” must be implemented as `src/features/pages`, where each public page owns its sub-components and SCSS module styles.

```txt
.
├── AGENTS.md
├── README.md
├── SPEC_AND_CODEX_PROMPT.md
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── images/
│   └── search-index.json
├── content/
│   ├── posts/
│   │   └── hello-hideout/
│   │       ├── index.mdx
│   │       ├── cover.png
│   │       └── images/
│   ├── projects/
│   │   └── monad-engine/
│   │       ├── index.mdx
│   │       ├── cover.gif
│   │       └── images/
│   ├── pages/
│   │   ├── home/
│   │   │   └── index.mdx
│   │   └── about/
│   │       └── index.mdx
│   └── courses/
│       └── .gitkeep
├── scripts/
│   ├── check-content.ts
│   └── generate-search-index.ts
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── not-found.tsx
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   ├── manifest.ts
    │   ├── mdx-components.tsx
    │   ├── blog/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── projects/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── series/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── search/
    │   │   └── page.tsx
    │   ├── about/
    │   │   └── page.tsx
    │   └── admin/
    │       ├── login/
    │       │   └── page.tsx
    │       ├── dashboard/
    │       │   └── page.tsx
    │       ├── posts/
    │       │   ├── page.tsx
    │       │   ├── new/
    │       │   │   └── page.tsx
    │       │   └── [slug]/
    │       │       └── edit/
    │       │           └── page.tsx
    │       └── projects/
    │           ├── page.tsx
    │           ├── new/
    │           │   └── page.tsx
    │           └── [slug]/
    │               └── edit/
    │                   └── page.tsx
    ├── components/
    │   ├── mdx/
    │   │   ├── MdxRenderer.tsx
    │   │   └── mdxComponentMap.tsx
    │   ├── seo/
    │   │   └── JsonLd.tsx
    │   └── ui/
    │       └── README.md
    ├── features/
    │   ├── admin/
    │   │   ├── components/
    │   │   ├── actions/
    │   │   ├── lib/
    │   │   ├── styles/
    │   │   └── types.ts
    │   ├── blog/
    │   │   ├── components/
    │   │   ├── lib/
    │   │   ├── styles/
    │   │   └── types.ts
    │   ├── projects/
    │   │   ├── components/
    │   │   ├── lib/
    │   │   ├── styles/
    │   │   └── types.ts
    │   ├── search/
    │   │   ├── components/
    │   │   ├── lib/
    │   │   ├── styles/
    │   │   └── types.ts
    │   ├── content/
    │   │   ├── loaders/
    │   │   ├── schemas/
    │   │   ├── repositories/
    │   │   ├── mdx.ts
    │   │   ├── paths.ts
    │   │   └── types.ts
    │   ├── layout/
    │   │   ├── components/
    │   │   └── styles/
    │   └── pages/
    │       ├── home/
    │       │   ├── HomePage.tsx
    │       │   ├── HomePage.module.scss
    │       │   ├── components/
    │       │   │   ├── HideoutHero.tsx
    │       │   │   ├── FeaturedPostsPanel.tsx
    │       │   │   ├── FeaturedProjectsPanel.tsx
    │       │   │   └── SignalNotes.tsx
    │       │   └── index.ts
    │       ├── blog-index/
    │       │   ├── BlogIndexPage.tsx
    │       │   ├── BlogIndexPage.module.scss
    │       │   ├── components/
    │       │   └── index.ts
    │       ├── blog-post/
    │       │   ├── BlogPostPage.tsx
    │       │   ├── BlogPostPage.module.scss
    │       │   ├── components/
    │       │   └── index.ts
    │       ├── projects-index/
    │       │   ├── ProjectsIndexPage.tsx
    │       │   ├── ProjectsIndexPage.module.scss
    │       │   ├── components/
    │       │   └── index.ts
    │       ├── project-detail/
    │       │   ├── ProjectDetailPage.tsx
    │       │   ├── ProjectDetailPage.module.scss
    │       │   ├── components/
    │       │   └── index.ts
    │       ├── search/
    │       │   ├── SearchPage.tsx
    │       │   ├── SearchPage.module.scss
    │       │   ├── components/
    │       │   └── index.ts
    │       └── about/
    │           ├── AboutPage.tsx
    │           ├── AboutPage.module.scss
    │           ├── components/
    │           └── index.ts
    ├── hooks/
    ├── lib/
    │   ├── auth/
    │   ├── config/
    │   ├── github/
    │   ├── seo/
    │   └── utils/
    └── styles/
        ├── globals.scss
        └── tokens-overrides.scss
```

---

## 4. Page Component Rule

Every route file in `src/app/**/page.tsx` must be thin.

Example:

```tsx
import { HomePage } from "@/features/pages/home";

export default async function Page() {
  return <HomePage />;
}
```

Page-specific UI must live under:

```txt
src/features/pages/<page-name>/
```

Each page folder must include:

```txt
<PageName>.tsx
<PageName>.module.scss
components/
index.ts
```

Use SCSS modules for page-specific layout and spacing.

Do not create generic components inside page folders unless they are only used by that page.

Reusable components go in:

```txt
src/components/
```

Feature-specific components go in:

```txt
src/features/<feature>/components/
```

---

## 5. Visual Direction

Site title:

```txt
sektant's hideout
```

Home page must use the `AsciiBanner` component from `@sektant1/phosphor-ui`.

The ASCII banner should display:

```txt
SEKTANT'S HIDEOUT
```

The visual identity should use the existing phosphor-ui aesthetic:

```txt
single-channel green phosphor
CRT
terminal
PDA
personal archive
hideout
technical field notes
```

Do not make it look like a corporate SaaS website.

Do not overdo animations.

Motion must respect `prefers-reduced-motion`.

The home page should feel like entering a personal terminal:

- ASCII banner.
- Short intro.
- Latest posts.
- Featured projects.
- Series.
- Search entry.
- “currently hacking on” notes.

---

## 6. Public Routes

Implement:

```txt
/
  Home page.

/blog
  List all published posts.

/blog/[slug]
  Render a single post.

/projects
  Show short portfolio cards.

/projects/[slug]
  Render the project as a README-like MDX post.

/series
  List all series.

/series/[slug]
  List all posts in a series.

/search
  Client-side local search page.

/about
  Personal about page.

/admin/login
  Login page.

/admin/dashboard
  Admin dashboard.

/admin/posts
  List posts, including drafts.

/admin/posts/new
  Create post.

/admin/posts/[slug]/edit
  Edit post.

/admin/projects
  List projects, including drafts.

/admin/projects/new
  Create project.

/admin/projects/[slug]/edit
  Edit project.
```

---

## 7. Content Structure

Each post/project/page must have its own directory.

Blog:

```txt
content/posts/<slug>/index.mdx
content/posts/<slug>/cover.png
content/posts/<slug>/images/*
```

Projects:

```txt
content/projects/<slug>/index.mdx
content/projects/<slug>/cover.gif
content/projects/<slug>/images/*
```

Pages:

```txt
content/pages/home/index.mdx
content/pages/about/index.mdx
```

Reserved future courses:

```txt
content/courses/
```

The directory name is the canonical slug.

If frontmatter includes `slug`, it must match the directory name.

---

## 8. Blog Post Frontmatter

Each post must support:

```yaml
---
title: "Post title"
slug: "post-title"
description: "Short SEO description."
date: "2026-05-08"
updated: "2026-05-08"
published: true
draft: false
tags: ["c++", "graphics", "engine"]
category: "graphics"
series: "vulkan-engine"
seriesOrder: 1
coverImage: "./cover.png"
canonicalUrl: ""
featured: false
---
```

Rules:

- `published: false` or `draft: true` excludes the post from public pages.
- Admin pages can see drafts.
- `series` is optional.
- `seriesOrder` is required only when `series` exists.
- `coverImage` may be relative to the content directory.

---

## 9. Project Frontmatter

Projects are short portfolio cards on `/projects`, but each project also has a detail page written like a personal README/post.

Each project must support:

```yaml
---
title: "Monad Engine"
slug: "monad-engine"
description: "Short project summary."
date: "2026-05-08"
updated: "2026-05-08"
published: true
draft: false
tags: ["c++", "opengl", "game-engine"]
techStack: ["C++", "OpenGL", "GLFW"]
repoUrl: "https://github.com/sektant1/monad-engine"
demoUrl: "https://sektant.dev/monad-engine"
coverImage: "./cover.gif"
media:
  - "./cover.gif"
  - "./images/screenshot-01.png"
featured: true
status: "active"
---
```

Project index cards must be short and visual:

- Cover GIF/image.
- Title.
- Description.
- Tech stack tags.
- Links to detail, repo, and demo when available.

Project detail pages must render the MDX body like a handwritten README/post.

---

## 10. Page Content Frontmatter

For editable static pages:

```yaml
---
title: "Home"
slug: "home"
description: "Personal blog and project archive."
updated: "2026-05-08"
published: true
---
```

Initially support:

```txt
home
about
```

Admin site-content editing can be minimal in v1.

---

## 11. Content Loader

Implement a manual content layer.

Required files:

```txt
src/features/content/schemas/postSchema.ts
src/features/content/schemas/projectSchema.ts
src/features/content/schemas/pageSchema.ts
src/features/content/loaders/posts.ts
src/features/content/loaders/projects.ts
src/features/content/loaders/pages.ts
src/features/content/paths.ts
src/features/content/mdx.ts
```

Required functions:

```ts
getAllPosts(options?: { includeDrafts?: boolean }): Promise<Post[]>
getPostBySlug(slug: string, options?: { includeDrafts?: boolean }): Promise<Post | null>

getAllProjects(options?: { includeDrafts?: boolean }): Promise<Project[]>
getProjectBySlug(slug: string, options?: { includeDrafts?: boolean }): Promise<Project | null>

getAllSeries(options?: { includeDrafts?: boolean }): Promise<Series[]>
getSeriesBySlug(slug: string, options?: { includeDrafts?: boolean }): Promise<Series | null>

getPageBySlug(slug: string): Promise<ContentPage | null>
```

Content loader requirements:

- Scan `content/posts/*/index.md`
- Scan `content/posts/*/index.mdx`
- Scan `content/projects/*/index.md`
- Scan `content/projects/*/index.mdx`
- Scan `content/pages/*/index.md`
- Scan `content/pages/*/index.mdx`
- Parse frontmatter with `gray-matter`.
- Validate with `zod`.
- Fail clearly on invalid content.
- Sort posts/projects by date descending.
- Compute reading time for posts.
- Compute tag index.
- Compute series index.
- Exclude drafts from public routes.
- Include drafts in admin routes.

---

## 12. MDX

Use MDX for posts and project details.

Install and configure:

```txt
@next/mdx
@mdx-js/loader
@mdx-js/react
@types/mdx
remark-gfm
rehype-slug
rehype-autolink-headings
```

Create:

```txt
src/app/mdx-components.tsx
src/components/mdx/mdxComponentMap.tsx
src/components/mdx/MdxRenderer.tsx
```

Map MDX elements to `@sektant1/phosphor-ui` components where possible.

Required mapping:

```txt
h1-h6
p
a
pre
code
blockquote
img
table
thead
tbody
tr
th
td
ul
ol
li
hr
```

Expose these MDX components:

```txt
Callout
CodeBlock
VideoPlayer
ProjectCard
PostCard
ImageFrame
TerminalPrompt
```

Use `PostBody` from `@sektant1/phosphor-ui` as the main post body wrapper if compatible.

Use `CodeBlock` from `@sektant1/phosphor-ui` for code blocks if compatible.

Do not allow arbitrary unsafe MDX execution from admin beyond normal local trusted-author usage.

---

## 13. UI Library Usage Rules

Codex must use `@sektant1/phosphor-ui` heavily.

Examples:

Layout:

```tsx
<CrtShell>
  <Header />
  {children}
  <Footer />
</CrtShell>
```

Home:

```tsx
<AsciiBanner text="SEKTANT'S HIDEOUT" />
<HeroFrame />
```

Blog:

```tsx
<PostListing />
<PostRow />
<Tag />
<Pagination />
```

Post detail:

```tsx
<PostBody />
<TableOfContents />
<ReadingRail />
<Callout />
<CodeBlock />
```

Admin:

```tsx
<Button />
<Input />
<Textarea />
<Checkbox />
<PdaWindow />
```

Search:

```tsx
<Input />
<Tag />
<PostRow />
```

Only build local components when composing these primitives into app-specific features.

---

## 14. Search

Implement search in v1.

Use a build-time static index:

```txt
public/search-index.json
```

Create:

```txt
scripts/generate-search-index.ts
src/features/search/components/SearchClient.tsx
src/features/search/lib/search.ts
src/features/pages/search/SearchPage.tsx
```

Index:

```ts
type SearchDocument = {
  id: string;
  type: "post" | "project";
  title: string;
  description: string;
  slug: string;
  href: string;
  tags: string[];
  series?: string;
  bodyExcerpt: string;
  date: string;
};
```

Search must include:

- Posts.
- Projects.
- Title.
- Description.
- Tags.
- Series.
- Excerpt.

Search page requirements:

- Use `Input` from `@sektant1/phosphor-ui`.
- Show grouped results by type.
- Show empty state.
- Work entirely client-side.
- Do not add external hosted search in v1.

---

## 15. Admin CMS Scope

Admin is localhost-only in v1.

It must not be production-ready yet.

Admin auth:

- Username/password.
- Single user only.
- Credentials from env.
- Password must be verified against a hash.
- Do not compare plaintext password in source code.
- Use signed HTTP-only cookie sessions.

Environment variables:

```env
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
AUTH_SECRET=
LOCAL_ADMIN_ONLY=true
SITE_URL=http://localhost:3000
```

Admin must block access when not running on localhost if `LOCAL_ADMIN_ONLY=true`.

Admin operations:

Posts:

- List posts, including drafts.
- Create post.
- Edit post.
- Delete post.
- Toggle published/draft.
- Preview MDX.
- Validate before saving.

Projects:

- List projects, including drafts.
- Create project.
- Edit project.
- Delete project.
- Toggle published/draft.
- Preview MDX.
- Validate before saving.

Site content:

- Basic editing of `content/pages/home/index.mdx`.
- Basic editing of `content/pages/about/index.mdx`.

Admin editor:

- Plain textarea editor in v1.
- No complex WYSIWYG.
- Use `Textarea`, `Input`, `Button`, `Checkbox` from `@sektant1/phosphor-ui`.
- Provide frontmatter helper fields if practical.
- Always allow raw MDX editing.

---

## 16. CMS Repository Interface

All admin content writes must go through an interface.

Create:

```txt
src/features/content/repositories/contentRepository.ts
src/features/content/repositories/localContentRepository.ts
src/features/content/repositories/githubContentRepository.ts
```

Interface:

```ts
export type ContentKind = "post" | "project" | "page";

export type ContentSummary = {
  kind: ContentKind;
  slug: string;
  title: string;
  description?: string;
  published: boolean;
  draft: boolean;
  updated?: string;
};

export type ContentFile = {
  kind: ContentKind;
  slug: string;
  path: string;
  raw: string;
};

export type ContentWriteInput = {
  kind: ContentKind;
  slug: string;
  raw: string;
};

export interface ContentRepository {
  list(kind: ContentKind): Promise<ContentSummary[]>;
  read(kind: ContentKind, slug: string): Promise<ContentFile | null>;
  write(input: ContentWriteInput): Promise<void>;
  delete(kind: ContentKind, slug: string): Promise<void>;
}
```

V1:

- Implement `localContentRepository`.
- Use Node filesystem.
- Only allow writes inside `content/`.
- Validate slug and path to prevent path traversal.

Future:

- Add `githubContentRepository`.
- It should use GitHub Contents API.
- Do not fully implement production GitHub writes in v1 unless explicitly asked.
- Leave a typed stub with clear TODOs.

Future env placeholders:

```env
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
VERCEL_DEPLOY_HOOK_URL=
```

---

## 17. SEO

Implement:

```txt
src/lib/seo/metadata.ts
src/lib/seo/jsonLd.ts
src/app/sitemap.ts
src/app/robots.ts
src/app/manifest.ts
```

Requirements:

- `generateMetadata` for all public routes.
- Open Graph.
- Twitter cards.
- Canonical URLs.
- BlogPosting JSON-LD for posts.
- CreativeWork or SoftwareSourceCode JSON-LD for projects.
- Person JSON-LD for the site owner.
- Sitemap includes:
  - home
  - blog
  - posts
  - projects
  - project details
  - series pages
  - about
  - search
- Robots file points to sitemap.

Metadata defaults:

```ts
const siteConfig = {
  name: "sektant's hideout",
  title: "sektant's hideout",
  description: "Personal technical archive for posts, projects, graphics programming notes, and experiments.",
  url: process.env.SITE_URL ?? "https://sektant.dev",
  author: "sektant",
};
```

---

## 18. Styling

Use:

```txt
SCSS modules for page/feature styles
global SCSS only for app-wide corrections
phosphor-ui CSS for design tokens/base look
```

Install:

```bash
npm install -D sass
```

Global styles:

```txt
src/styles/globals.scss
src/styles/tokens-overrides.scss
```

Each page must have its own module:

```txt
HomePage.module.scss
BlogIndexPage.module.scss
BlogPostPage.module.scss
ProjectsIndexPage.module.scss
ProjectDetailPage.module.scss
SearchPage.module.scss
AboutPage.module.scss
```

Do not duplicate token values from `phosphor-ui` unless necessary.

Prefer CSS variables exposed by `phosphor-ui`.

Do not create a second independent design system.

---

## 19. Projects UX

`/projects` must show short portfolio cards.

Each card:

- Cover GIF/image.
- Title.
- Description.
- Tech tags.
- Status.
- Links:
  - Detail
  - GitHub repo if present
  - Demo if present

Use `@sektant1/phosphor-ui` components first.

If there is no exact ProjectCard component, compose from:

```txt
PdaWindow
Tag
Text
Link
Button
```

`/projects/[slug]` renders the project MDX as a README-like personal post.

Tone:

```txt
what it is
why I built it
what I learned
screenshots/gifs
technical notes
next steps
```

---

## 20. Blog UX

`/blog`:

- List posts.
- Filter by tag if practical.
- Show series badges.
- Show reading time.
- Show date.
- Use `PostListing` / `PostRow` if compatible.

`/blog/[slug]`:

- Render post.
- Show metadata.
- Show tags.
- Show series navigation if post belongs to a series.
- Show reading progress if `ReadingRail` is compatible.
- Show table of contents if `TableOfContents` is compatible.
- Show related posts by tags if practical.

---

## 21. Series

Series are derived from post frontmatter.

No separate series files in v1.

A series exists if at least one post has:

```yaml
series: "series-slug"
seriesOrder: 1
```

`/series` lists all series.

`/series/[slug]` lists posts in that series ordered by `seriesOrder`.

Series display name can be generated from slug for v1.

Optional future frontmatter:

```yaml
seriesTitle: "Building a Vulkan Engine"
```

If `seriesTitle` exists, use it.

---

## 22. Future Courses Placeholder

Do not implement courses in v1.

Reserve:

```txt
content/courses/
src/app/courses/
src/features/courses/
```

Do not add public course routes unless needed for build placeholders.

Future intended structure:

```txt
content/courses/<course-slug>/index.mdx
content/courses/<course-slug>/lessons/<lesson-slug>/index.mdx
```

---

## 23. Performance

Requirements:

- Public pages should be statically generated.
- Use `generateStaticParams` for posts, projects, and series.
- Use Server Components by default.
- Avoid shipping admin/editor code to public pages.
- Lazy-load search client only on search route.
- Use `next/image` for public images where practical.
- Avoid large animation libraries.
- Keep global JS small.
- Target Lighthouse 90+ for performance, accessibility, best practices, and SEO.

---

## 24. Accessibility

Requirements:

- Semantic HTML.
- Correct heading hierarchy.
- Keyboard navigable admin.
- Visible focus states.
- Labels for form fields.
- Error text associated with invalid fields.
- Sufficient contrast.
- Respect reduced motion.
- Links must have meaningful text.

---

## 25. Security

Requirements:

- Admin is localhost-only in v1.
- Password hash only.
- HTTP-only signed cookie.
- Server-side route protection.
- Validate all slugs.
- Prevent path traversal in content writes.
- Never expose secrets to client.
- Never expose future GitHub token to client.
- Fail safely when env vars are missing.

---

## 26. Scripts

Add scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run content:check && npm run search:index && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "content:check": "tsx scripts/check-content.ts",
    "search:index": "tsx scripts/generate-search-index.ts"
  }
}
```

`content:check` must:

- Validate all posts.
- Validate all projects.
- Validate all editable pages.
- Detect duplicate slugs.
- Detect slug/frontmatter mismatch.
- Detect invalid dates.
- Detect missing required fields.
- Fail with useful errors.

`search:index` must:

- Generate `public/search-index.json`.
- Include only published posts/projects.
- Exclude drafts.
- Include title, description, tags, series, slug, href, excerpt, and type.

---

## 27. Example Content

Create example content.

Post:

```txt
content/posts/hello-hideout/index.mdx
```

Project:

```txt
content/projects/monad-engine/index.mdx
```

Home page:

```txt
content/pages/home/index.mdx
```

About page:

```txt
content/pages/about/index.mdx
```

The example content should be short and replaceable.

Use English only.

---

## 28. README

Create `README.md` with:

- Project purpose.
- Install instructions.
- Dev instructions.
- Content authoring guide.
- Frontmatter examples.
- Admin localhost usage.
- Search indexing.
- Deployment notes.
- Future production CMS notes.
- Explanation that `@sektant1/phosphor-ui` is consumed as a dependency.

---

## 29. AGENTS.md

Create `AGENTS.md` for future Codex runs.

It must say:

```md
# AGENTS.md

## Project

This is `sektant's hideout`, a private Next.js personal blog and project archive.

## Rules

- Use TypeScript strict mode.
- Use App Router.
- Public route files in `src/app` must stay thin.
- Page-specific UI belongs in `src/features/pages/<page>`.
- Each page owns a `.module.scss` file and local `components/` folder.
- Use `@sektant1/phosphor-ui` components before creating local UI.
- Do not recreate primitives already provided by `phosphor-ui`.
- Content lives in `content/`.
- Each post/project/page lives in its own directory with `index.mdx`.
- Admin is localhost-only in v1.
- All content writes must go through `ContentRepository`.
- Keep future production GitHub CMS behind the repository interface.
- Run typecheck, lint, content check, search index generation, and build before finishing.
```

---

## 30. Acceptance Criteria

The project is complete when:

- `npm install` succeeds.
- `npm run typecheck` succeeds.
- `npm run lint` succeeds or uses the correct Next lint replacement if needed.
- `npm run content:check` succeeds.
- `npm run search:index` succeeds.
- `npm run build` succeeds.
- Home page renders `sektant's hideout` with `AsciiBanner`.
- Blog index renders example post.
- Blog detail renders MDX.
- Projects index renders short visual project cards.
- Project detail renders README-like MDX.
- Series index/detail works.
- Search page works.
- Admin login exists.
- Admin dashboard exists.
- Admin can create/edit/delete local posts/projects.
- Admin writes through `ContentRepository`.
- Public pages exclude drafts.
- Admin pages include drafts.
- SEO metadata exists.
- Sitemap and robots exist.
- `README.md`, `.env.example`, `AGENTS.md`, and this spec exist.

---

# CODEX PROMPT

You are working in a new empty private repository for my personal site.

Create the full project described in this file.

Project name:

```txt
sektant's hideout
```

Primary dependency:

```txt
@sektant1/phosphor-ui
```

Important rules:

1. Use Next.js App Router, TypeScript strict mode, MDX, SCSS modules, and SSG.
2. Install and use `@sektant1/phosphor-ui`.
3. Import `@sektant1/phosphor-ui/tokens.css` and `@sektant1/phosphor-ui/global.css` once at the root layout.
4. Inspect the UI package exports before using components.
5. Use `phosphor-ui` components first. Do not recreate existing UI primitives.
6. Public route files in `src/app` must be thin and delegate to page feature components.
7. Create `src/features/pages/<page>` folders. Each page must have its own page component, local `components/` folder, and `.module.scss` file.
8. Content must be file-based and live under `content/`.
9. Each post/project/page must have its own directory and `index.mdx`.
10. Implement blog posts, projects, series, search, about, home, and localhost-only admin.
11. Projects are short visual portfolio cards on `/projects`, with README-like MDX detail pages.
12. Blog posts support `series` and `seriesOrder`.
13. Implement local search index generation.
14. Implement admin as localhost-only in v1.
15. All admin writes must go through `ContentRepository`.
16. Implement local filesystem repository now.
17. Add typed placeholder/stub for future GitHub repository-backed CMS.
18. Add content validation with Zod.
19. Add SEO metadata, sitemap, robots, and JSON-LD.
20. Create README, `.env.example`, `AGENTS.md`, and keep this spec in the repo.

Implementation order:

1. Initialize Next.js TypeScript project.
2. Install dependencies:
   - `@sektant1/phosphor-ui`
   - `@next/mdx`
   - `@mdx-js/loader`
   - `@mdx-js/react`
   - `@types/mdx`
   - `gray-matter`
   - `fast-glob`
   - `zod`
   - `reading-time`
   - `sass`
   - `fuse.js` or `minisearch`
   - password/session dependencies as needed
3. Configure MDX.
4. Create app/layout and global styles.
5. Create content schemas/loaders.
6. Create example content.
7. Create page feature folders.
8. Create public routes.
9. Create MDX component mapping.
10. Create search index script and search page.
11. Create admin auth.
12. Create admin CRUD using local content repository.
13. Add SEO.
14. Add validation scripts.
15. Add README, `.env.example`, `AGENTS.md`.
16. Run:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run content:check`
    - `npm run search:index`
    - `npm run build`
17. Fix failures.
18. Print a concise final summary of created files and remaining caveats.

Do not stop after creating only a skeleton. Build the working v1.
