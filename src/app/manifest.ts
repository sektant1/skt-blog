import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "sektant's hideout",
    short_name: "hideout",
    description: "Personal technical archive.",
    start_url: "/",
    display: "standalone",
    background_color: "#020704",
    theme_color: "#2cff7a"
  };
}
