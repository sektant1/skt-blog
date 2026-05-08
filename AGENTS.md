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
