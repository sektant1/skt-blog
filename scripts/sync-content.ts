import fs from "node:fs/promises";
import path from "node:path";
import {
  listGithubContentFiles,
  readGithubFileBytes,
} from "../src/features/content/repositories/githubContentRepository";

type RemoteContentFile = {
  path: string;
};

const contentDir = path.join(process.cwd(), "content");

function resolveInsideContent(relativePath: string): string {
  const target = path.resolve(process.cwd(), relativePath);
  const relative = path.relative(contentDir, target);

  if (
    !relativePath.startsWith("content/") ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to write outside content/: ${relativePath}`);
  }

  return target;
}

async function remoteContentFiles(): Promise<RemoteContentFile[]> {
  if (process.env.CONTENT_BACKEND === "github") {
    return listGithubContentFiles();
  }

  return [];
}

async function readRemoteBytes(filePath: string): Promise<Uint8Array | null> {
  if (process.env.CONTENT_BACKEND === "github") {
    return readGithubFileBytes(filePath);
  }

  return null;
}

async function main() {
  if (process.env.CONTENT_BACKEND !== "github") {
    console.log("content sync skipped: CONTENT_BACKEND is local");
    return;
  }

  const files = await remoteContentFiles();

  await fs.rm(contentDir, { recursive: true, force: true });
  await fs.mkdir(contentDir, { recursive: true });

  for (const file of files) {
    const bytes = await readRemoteBytes(file.path);

    if (!bytes) {
      throw new Error(
        `Remote content file disappeared while syncing: ${file.path}`,
      );
    }

    const target = resolveInsideContent(file.path);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  }

  console.log(`content sync ok: ${files.length} files`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
