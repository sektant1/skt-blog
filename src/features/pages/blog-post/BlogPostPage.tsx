import { notFound } from "next/navigation";
import { PostHeader, PostLayout, RelatedPosts, SeriesNav, TableOfContents } from "@/components/ui/phosphor";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { buildMdxTocItems, extractMdxHeadings } from "@/components/mdx/headings";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllPosts, getPostBySlug, getSeriesBySlug } from "@/features/content/loaders/posts";
import { blogPostingJsonLd } from "@/lib/seo/jsonLd";
import styles from "./BlogPostPage.module.scss";

export async function BlogPostPage({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [series, posts] = await Promise.all([
    post.series ? getSeriesBySlug(post.series) : null,
    getAllPosts()
  ]);
  const seriesIndex = series?.posts.findIndex((item) => item.slug === post.slug) ?? -1;
  const related = posts
    .filter((item) => item.slug !== post.slug && item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3)
    .map((item) => ({ href: `/blog/${item.slug}`, title: item.title, date: item.date, tags: item.tags }));
  const tocHeadings = extractMdxHeadings(post.body).filter((heading) => heading.depth === 2 || heading.depth === 3);
  const tocItems = buildMdxTocItems(tocHeadings);
  return (
    <PostLayout
      className={styles.stack}
      header={
        <PostHeader
          title={post.title}
          eyebrow={post.series ?? "field note"}
          subtitle={post.description}
          date={post.date}
          readTime={post.readingTime}
          updated={post.updated}
          tags={post.tags}
        />
      }
      sidebar={
        tocItems.length ? (
          <TableOfContents
            items={tocItems}
            foot={<span>{tocHeadings.length} nodes</span>}
            spyOffset={120}
          />
        ) : null
      }
      sidebarLabel="post table of contents"
      footer={
        <>
          {series && seriesIndex >= 0 ? (
            <SeriesNav
              seriesTitle={series.title}
              current={seriesIndex + 1}
              total={series.posts.length}
              prev={series.posts[seriesIndex - 1] ? { title: series.posts[seriesIndex - 1].title, href: `/blog/${series.posts[seriesIndex - 1].slug}` } : undefined}
              next={series.posts[seriesIndex + 1] ? { title: series.posts[seriesIndex + 1].title, href: `/blog/${series.posts[seriesIndex + 1].slug}` } : undefined}
            />
          ) : null}
          {related.length ? <RelatedPosts posts={related} label="related signals" /> : null}
        </>
      }
    >
      <JsonLd data={blogPostingJsonLd(post)} />
      <MdxRenderer source={post.body} />
    </PostLayout>
  );
}
