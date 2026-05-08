import { notFound } from "next/navigation";
import { BlogPostPage } from "@/features/pages/blog-post";
import { getAllPosts, getPostBySlug } from "@/features/content/loaders/posts";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return buildMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: "article", publishedTime: post.date, modifiedTime: post.updated });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} />;
}
