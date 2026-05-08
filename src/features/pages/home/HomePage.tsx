import { getAllPosts, getAllSeries } from "@/features/content/loaders/posts";
import { getAllProjects } from "@/features/content/loaders/projects";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd } from "@/lib/seo/jsonLd";
import { FeaturedPostsPanel } from "./components/FeaturedPostsPanel";
import { FeaturedProjectsPanel } from "./components/FeaturedProjectsPanel";
import { HideoutHero } from "./components/HideoutHero";
import { SignalNotes } from "./components/SignalNotes";
import styles from "./HomePage.module.scss";

export async function HomePage() {
  const [posts, projects, series] = await Promise.all([getAllPosts(), getAllProjects(), getAllSeries()]);
  return (
    <div className={styles.stack}>
      <JsonLd data={personJsonLd()} />
      <HideoutHero />
      <FeaturedPostsPanel posts={posts.slice(0, 6)} />
      <FeaturedProjectsPanel projects={projects.filter((project) => project.featured).slice(0, 3)} />
      <SignalNotes series={series} />
    </div>
  );
}
