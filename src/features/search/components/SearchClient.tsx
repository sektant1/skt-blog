"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "@/components/ui/phosphor";
import type { SearchDocument } from "../types";

type SearchHit = {
  href: string;
  title: React.ReactNode;
  date?: React.ReactNode;
  tags?: React.ReactNode[];
  snippet?: React.ReactNode;
};

function toHit(document: SearchDocument): SearchHit {
  return {
    href: document.href,
    title: document.title,
    date: document.date,
    tags: [document.type, ...document.tags.slice(0, 4)],
    snippet: document.bodyExcerpt || document.description
  };
}

export function SearchClient() {
  const [docs, setDocs] = useState<SearchDocument[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => setDocs([]));
  }, []);

  const hits = useMemo(() => docs.map(toHit), [docs]);

  return (
    <Search
      hits={hits}
      placeholder="search transmissions..."
      prompt="/>"
      label="search"
      emptyMessage="no transmissions found."
    />
  );
}
