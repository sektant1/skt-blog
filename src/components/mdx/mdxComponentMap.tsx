import type { MDXComponents } from "mdx/types";
import { Callout, CodeBlock, H1, H2, H3, H4, Hr, Link, PostBody, Text, TerminalPrompt, VideoPlayer } from "@/components/ui/phosphor";

export function ImageFrame(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <figure className="mdx-image-frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={props.alt ?? ""} />
      {props.alt ? <figcaption>{props.alt}</figcaption> : null}
    </figure>
  );
}

export function ProjectCard({ title, href, children }: { title: string; href: string; children?: React.ReactNode }) {
  return (
    <aside className="mdx-card">
      <strong>{title}</strong>
      <div>{children}</div>
      <Link href={href}>open project</Link>
    </aside>
  );
}

export function PostCard({ title, href, children }: { title: string; href: string; children?: React.ReactNode }) {
  return (
    <aside className="mdx-card">
      <strong>{title}</strong>
      <div>{children}</div>
      <Link href={href}>read post</Link>
    </aside>
  );
}

export const mdxComponentMap: MDXComponents = {
  a: (props) => <Link {...props} href={String(props.href ?? "#")} />,
  h1: (props) => <H1 {...props} />,
  h2: (props) => <H2 {...props} />,
  h3: (props) => <H3 {...props} />,
  h4: (props) => <H4 {...props} />,
  p: (props) => <Text as="p" variant="body" {...props} />,
  hr: Hr,
  img: ImageFrame,
  Callout,
  CodeBlock,
  VideoPlayer,
  ProjectCard,
  PostCard,
  ImageFrame,
  TerminalPrompt
};

export { PostBody };
