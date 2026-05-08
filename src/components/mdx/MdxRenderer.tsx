import { Callout, CodeBlock, H1, H2, H3, Hr, Link, PostBody, Text } from "@/components/ui/phosphor";

function inline(text: string) {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <Link key={index} href={link[2]}>{link[1]}</Link>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export function MdxRenderer({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  const codeFence: { lang: string; lines: string[] } | null = null;
  const nodes: React.ReactNode[] = [];

  for (const block of blocks) {
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      nodes.push(<CodeBlock key={nodes.length} lang={lines[0].slice(3) || "text"} code={lines.slice(1, -1).join("\n")} />);
      continue;
    }
    if (codeFence) continue;
    if (block.startsWith("# ")) nodes.push(<H1 key={nodes.length}>{inline(block.slice(2))}</H1>);
    else if (block.startsWith("## ")) nodes.push(<H2 key={nodes.length}>{inline(block.slice(3))}</H2>);
    else if (block.startsWith("### ")) nodes.push(<H3 key={nodes.length}>{inline(block.slice(4))}</H3>);
    else if (block.startsWith("> ")) nodes.push(<Callout key={nodes.length} variant="quote">{inline(block.replace(/^> /gm, ""))}</Callout>);
    else if (block.trim() === "---") nodes.push(<Hr key={nodes.length} />);
    else if (block.startsWith("- ")) {
      nodes.push(
        <ul key={nodes.length}>
          {block.split("\n").map((line) => <li key={line}>{inline(line.replace(/^- /, ""))}</li>)}
        </ul>
      );
    } else {
      nodes.push(<Text key={nodes.length} as="p" variant="body">{inline(block)}</Text>);
    }
  }

  return <PostBody>{nodes}</PostBody>;
}
