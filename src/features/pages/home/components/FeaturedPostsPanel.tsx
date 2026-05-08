import { H2, Hr, PostListing, PostRow, Tag, Text } from "@/components/ui/phosphor";
import type { CSSProperties } from "react";
import type { Post } from "@/features/content/types";
import styles from "../HomePage.module.scss";

export function FeaturedPostsPanel({ posts }: { posts: Post[] }) {
  return (
    <section className={`pho-fade-up ${styles.section}`} style={{ "--i": 1 } as CSSProperties}>
      <H2>latest transmissions</H2>
      <Text variant="body" className={styles.intro}>
        Field reports from the perimeter. Most recent first.
      </Text>
      <div style={{ marginTop: "1rem" }}>
        <PostListing>
          {posts.map((post, index) => (
            <PostRow
              key={post.slug}
              index={index}
              date={post.date}
              title={post.title}
              href={`/blog/${post.slug}`}
              meta={post.readingTime}
              glyph={post.series ? "◈" : undefined}
            />
          ))}
        </PostListing>
      </div>
      <Hr />
      <div className={styles.cluster}>
        <Tag>operations</Tag>
        <Tag>field-notes</Tag>
        <Tag color="magenta">archive</Tag>
        <Tag count={posts.length}>posts</Tag>
      </div>
    </section>
  );
}
