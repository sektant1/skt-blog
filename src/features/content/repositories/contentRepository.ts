export type ContentKind = "post" | "project" | "page";

export type ContentSummary = {
  kind: ContentKind;
  slug: string;
  title: string;
  description?: string;
  published: boolean;
  draft: boolean;
  updated?: string;
};

export type ContentFile = {
  kind: ContentKind;
  slug: string;
  path: string;
  raw: string;
};

export type ContentWriteInput = {
  kind: ContentKind;
  slug: string;
  raw: string;
};

export interface ContentRepository {
  list(kind: ContentKind): Promise<ContentSummary[]>;
  read(kind: ContentKind, slug: string): Promise<ContentFile | null>;
  write(input: ContentWriteInput): Promise<void>;
  delete(kind: ContentKind, slug: string): Promise<void>;
}
