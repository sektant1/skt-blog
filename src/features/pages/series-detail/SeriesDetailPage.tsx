import { notFound } from "next/navigation";
import { H1, PostListing, PostRow, Text } from "@/components/ui/phosphor";
import { getSeriesBySlug } from "@/features/content/loaders/posts";
import styles from "./SeriesDetailPage.module.scss";

export async function SeriesDetailPage({ slug }: { slug: string }) {
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();
  return (
    <section className={styles.stack}>
      <H1>{series.title}</H1>
      <Text as="p" variant="body">{series.description}</Text>
      <PostListing>
        {series.posts.map((post) => (
          <PostRow key={post.slug} date={post.date} title={post.title} href={`/blog/${post.slug}`} meta={`part ${post.seriesOrder} / ${post.readingTime}`} />
        ))}
      </PostListing>
    </section>
  );
}
