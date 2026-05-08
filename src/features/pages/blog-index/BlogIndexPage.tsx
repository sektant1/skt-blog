import { Callout, PostListing, PostRow, Tag } from "@/components/ui/phosphor";
import { getAllPosts } from "@/features/content/loaders/posts";
import styles from "./BlogIndexPage.module.scss";

export async function BlogIndexPage() {
  const posts = await getAllPosts();
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();
  return (
    <section className={styles.stack}>
      <Callout variant="terminal" title="blog">Published field notes, newest first.</Callout>
      <div className={styles.tags}>{tags.map((tag) => <Tag key={tag} href={`/blog?tag=${tag}`}>{tag}</Tag>)}</div>
      <PostListing>
        {posts.map((post, index) => (
          <PostRow key={post.slug} index={index + 1} date={post.date} title={post.title} href={`/blog/${post.slug}`} meta={`${post.readingTime}${post.series ? ` / ${post.series}` : ""}`} />
        ))}
      </PostListing>
    </section>
  );
}
