import { H1, PdaWindow, PostListing, PostRow } from "@/components/ui/phosphor";
import { getAllSeries } from "@/features/content/loaders/posts";
import styles from "./SeriesIndexPage.module.scss";

export async function SeriesIndexPage() {
  const series = await getAllSeries();
  return (
    <section className={styles.stack}>
      <H1>series</H1>
      {series.map((item) => (
        <PdaWindow key={item.slug} title={item.title} meta={`${item.count} posts`}>
          <PostListing>
            {item.posts.map((post) => (
              <PostRow key={post.slug} date={post.date} title={post.title} href={`/blog/${post.slug}`} meta={`part ${post.seriesOrder}`} />
            ))}
          </PostListing>
        </PdaWindow>
      ))}
    </section>
  );
}
