import { BlogIndexPage } from "@/features/pages/blog-index";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Blog", path: "/blog" });

export default async function Page() {
  return <BlogIndexPage />;
}
