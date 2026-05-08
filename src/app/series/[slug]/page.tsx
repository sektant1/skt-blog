import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/features/pages/series-detail";
import { getAllSeries, getSeriesBySlug } from "@/features/content/loaders/posts";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return (await getAllSeries()).map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();
  return buildMetadata({ title: series.title, description: series.description, path: `/series/${series.slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeriesDetailPage slug={slug} />;
}
