import type { ContentFile, ContentKind, ContentRepository, ContentSummary, ContentWriteInput } from "./contentRepository";

export class GithubContentRepository implements ContentRepository {
  async list(kind: ContentKind): Promise<ContentSummary[]> {
    void kind;
    throw new Error("GitHub-backed CMS is a typed v2 placeholder. Use LocalContentRepository in v1.");
  }

  async read(kind: ContentKind, slug: string): Promise<ContentFile | null> {
    void kind;
    void slug;
    throw new Error("GitHub-backed CMS is a typed v2 placeholder. Implement GitHub Contents API reads here.");
  }

  async write(input: ContentWriteInput): Promise<void> {
    void input;
    throw new Error("GitHub-backed CMS is a typed v2 placeholder. Implement commit-backed writes here.");
  }

  async delete(kind: ContentKind, slug: string): Promise<void> {
    void kind;
    void slug;
    throw new Error("GitHub-backed CMS is a typed v2 placeholder. Implement commit-backed deletes here.");
  }
}
