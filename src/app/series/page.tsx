import { SeriesIndexPage } from "@/features/pages/series-index";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Series", path: "/series" });

export default async function Page() {
  return <SeriesIndexPage />;
}
