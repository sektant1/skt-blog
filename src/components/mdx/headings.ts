export type MdxHeading = {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id: string;
};

export type MdxTocItem = {
  label: string;
  href: string;
  glyph?: string;
  children?: MdxTocItem[];
};

function stripInlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

export function cleanMdxHeadingText(value: string) {
  return stripInlineMarkdown(value.replace(/\s+#*$/, ""));
}

function baseSlug(value: string) {
  return cleanMdxHeadingText(value)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function createHeadingSlugger() {
  const counts = new Map<string, number>();

  return (value: string) => {
    const slug = baseSlug(value) || "section";
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    return count === 0 ? slug : `${slug}-${count}`;
  };
}

export function extractMdxHeadings(source: string): MdxHeading[] {
  const slug = createHeadingSlugger();
  const headings: MdxHeading[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line.trim());
    if (!match) continue;

    const text = cleanMdxHeadingText(match[2]);
    if (!text) continue;

    headings.push({
      depth: match[1].length as MdxHeading["depth"],
      text,
      id: slug(text)
    });
  }

  return headings;
}

export function buildMdxTocItems(headings: MdxHeading[]): MdxTocItem[] {
  const items: MdxTocItem[] = [];
  let currentParent: MdxTocItem | null = null;

  for (const heading of headings) {
    if (heading.depth !== 2 && heading.depth !== 3) continue;

    const item: MdxTocItem = {
      label: heading.text,
      href: `#${heading.id}`,
      glyph: heading.depth === 2 ? ">" : "."
    };

    if (heading.depth === 2 || !currentParent) {
      items.push(item);
      currentParent = item;
      continue;
    }

    currentParent.children = [...(currentParent.children ?? []), item];
  }

  return items;
}
