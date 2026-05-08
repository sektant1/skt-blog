import Fuse from "fuse.js";
import type { SearchDocument } from "../types";

export function createSearchIndex(documents: SearchDocument[]) {
  return new Fuse(documents, {
    keys: ["title", "description", "tags", "series", "bodyExcerpt"],
    threshold: 0.35,
    includeScore: true
  });
}
