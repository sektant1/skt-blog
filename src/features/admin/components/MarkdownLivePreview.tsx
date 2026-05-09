"use client";

import React from "react";
import type { ContentKind } from "@/features/content/repositories/contentRepository";
import styles from "../styles/Admin.module.scss";

type MarkdownLivePreviewProps = {
  kind: ContentKind;
  slug: string;
  raw: string;
};

type ParsedFrontmatter = {
  frontmatter: string;
  body: string;
};

function stripFrontmatter(raw: string): ParsedFrontmatter {
  const normalized = raw.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return {
      frontmatter: "",
      body: normalized,
    };
  }

  const closingIndex = normalized.indexOf("\n---", 4);

  if (closingIndex === -1) {
    return {
      frontmatter: "",
      body: normalized,
    };
  }

  return {
    frontmatter: normalized.slice(4, closingIndex).trim(),
    body: normalized.slice(closingIndex + 4).trimStart(),
  };
}

function extractFrontmatterImageSources(frontmatter: string): string[] {
  const sources = new Set<string>();

  const coverMatch = frontmatter.match(/^coverImage:\s*["']?([^"'\n]+)["']?/m);
  if (coverMatch?.[1]) {
    sources.add(coverMatch[1].trim());
  }

  const mediaBlockMatch = frontmatter.match(
    /^media:\s*\n([\s\S]*?)(?:\n[a-zA-Z0-9_-]+:|\n?$)/m,
  );
  const mediaBlock = mediaBlockMatch?.[1] ?? "";

  for (const match of mediaBlock.matchAll(/^\s*-\s*["']?([^"'\n]+)["']?/gm)) {
    if (match[1]) {
      sources.add(match[1].trim());
    }
  }

  return [...sources];
}

function isExternalOrPublicSource(source: string): boolean {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(source) ||
    source.startsWith("/") ||
    source.startsWith("data:") ||
    source.startsWith("blob:")
  );
}

function normalizeRelativeAssetPath(source: string): string {
  return source
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .split("/")
    .filter(Boolean)
    .join("/");
}

function resolveImageSource(
  kind: ContentKind,
  slug: string,
  source: string,
): string {
  const cleanedSource = source.trim().replace(/^<|>$/g, "");

  if (!cleanedSource) {
    return "";
  }

  if (isExternalOrPublicSource(cleanedSource)) {
    return cleanedSource;
  }

  if (!slug) {
    return cleanedSource;
  }

  const assetPath = normalizeRelativeAssetPath(cleanedSource);

  if (!assetPath || assetPath.includes("..")) {
    return "";
  }

  const encodedPath = assetPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/admin/content-asset/${encodeURIComponent(kind)}/${encodeURIComponent(slug)}/${encodedPath}`;
}

function renderInline(
  text: string,
  kind: ContentKind,
  slug: string,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      const alt = match[1];
      const src = resolveImageSource(kind, slug, match[2]);

      nodes.push(
        <span
          className={styles.previewInlineImage}
          key={`inline-image-${key++}`}
        >
          <img src={src} alt={alt} loading="lazy" />
        </span>,
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={match[4]}
          target="_blank"
          rel="noreferrer"
        >
          {match[3]}
        </a>,
      );
    } else if (match[5] !== undefined) {
      nodes.push(<code key={`code-${key++}`}>{match[5]}</code>);
    } else if (match[6] !== undefined) {
      nodes.push(<strong key={`strong-${key++}`}>{match[6]}</strong>);
    } else if (match[7] !== undefined) {
      nodes.push(<em key={`em-${key++}`}>{match[7]}</em>);
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderImageBlock(
  kind: ContentKind,
  slug: string,
  alt: string,
  source: string,
  key: string,
) {
  const src = resolveImageSource(kind, slug, source);

  if (!src) {
    return (
      <p key={key} className={styles.previewImageMissing}>
        invalid image path: {source}
      </p>
    );
  }

  return (
    <figure key={key} className={styles.previewImageFrame}>
      <img src={src} alt={alt} loading="lazy" />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

function renderMarkdownBlocks(
  body: string,
  kind: ContentKind,
  slug: string,
): React.ReactNode[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1];
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !/^```\s*$/.test(lines[index] ?? "")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      index += 1;

      blocks.push(
        <pre key={`code-${key++}`} className={styles.previewCodeBlock}>
          {language ? (
            <span className={styles.previewCodeLang}>{language}</span>
          ) : null}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );

      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${key++}`} />);
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

      blocks.push(
        React.createElement(
          tag,
          { key: `heading-${key++}` },
          renderInline(text, kind, slug),
        ),
      );

      index += 1;
      continue;
    }

    const imageOnlyMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageOnlyMatch) {
      blocks.push(
        renderImageBlock(
          kind,
          slug,
          imageOnlyMatch[1],
          imageOnlyMatch[2],
          `image-${key++}`,
        ),
      );

      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) {
        quoteLines.push((lines[index] ?? "").replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote key={`quote-${key++}`}>
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={quoteIndex}>{renderInline(quoteLine, kind, slug)}</p>
          ))}
        </blockquote>,
      );

      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ul key={`ul-${key++}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, kind, slug)}</li>
          ))}
        </ul>,
      );

      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ol key={`ol-${key++}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, kind, slug)}</li>
          ))}
        </ol>,
      );

      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index]?.trim() &&
      !/^```/.test(lines[index] ?? "") &&
      !/^(#{1,6})\s+/.test(lines[index] ?? "") &&
      !/^>\s?/.test(lines[index] ?? "") &&
      !/^\s*[-*+]\s+/.test(lines[index] ?? "") &&
      !/^\s*\d+\.\s+/.test(lines[index] ?? "")
    ) {
      paragraphLines.push(lines[index] ?? "");
      index += 1;
    }

    blocks.push(
      <p key={`p-${key++}`}>
        {renderInline(paragraphLines.join(" "), kind, slug)}
      </p>,
    );
  }

  return blocks;
}

export function MarkdownLivePreview({
  kind,
  slug,
  raw,
}: MarkdownLivePreviewProps) {
  const { frontmatter, body } = stripFrontmatter(raw);
  const frontmatterImageSources = extractFrontmatterImageSources(frontmatter);
  const renderedBlocks = renderMarkdownBlocks(body, kind, slug);

  return (
    <section className={styles.previewPane} aria-label="Markdown live preview">
      <div className={styles.previewHeader}>
        <span className={styles.previewLed} aria-hidden="true" />
        <span>live preview</span>
      </div>

      {!slug ? (
        <p className={styles.previewWarning}>
          Set a slug to preview relative content images.
        </p>
      ) : null}

      {frontmatterImageSources.length > 0 ? (
        <div className={styles.previewAssets}>
          <p className={styles.previewAssetsTitle}>frontmatter media</p>
          <div className={styles.previewAssetGrid}>
            {frontmatterImageSources.map((source) =>
              renderImageBlock(
                kind,
                slug,
                source,
                source,
                `frontmatter-image-${source}`,
              ),
            )}
          </div>
        </div>
      ) : null}

      <article className={styles.previewBody}>
        {renderedBlocks.length > 0 ? (
          renderedBlocks
        ) : (
          <p className={styles.previewEmpty}>Nothing to preview yet.</p>
        )}
      </article>
    </section>
  );
}
