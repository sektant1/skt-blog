import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertLocalAdminAllowed, getAdminUser } from "@/lib/auth/session";
import { assertValidSlug, contentKindDir } from "@/features/content/paths";
import type { ContentKind } from "@/features/content/repositories/contentRepository";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    kind: string;
    slug: string;
  }>;
};

const allowedMimeTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const maxUploadBytes = 12 * 1024 * 1024;

function parseKind(kind: string): ContentKind | null {
  if (kind === "post" || kind === "project" || kind === "page") {
    return kind;
  }

  return null;
}

function sanitizeFileName(fileName: string, mimeType: string): string {
  const extension = allowedMimeTypes[mimeType] ?? "png";
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  const safeBase = base || "image";
  return `${safeBase}.${extension}`;
}

async function uniqueFilePath(
  directory: string,
  fileName: string,
): Promise<{
  filePath: string;
  fileName: string;
}> {
  const extension = path.extname(fileName);
  const base = path.basename(fileName, extension);

  let candidate = fileName;
  let counter = 1;

  while (true) {
    const filePath = path.join(directory, candidate);

    try {
      await fs.access(filePath);
      candidate = `${base}-${counter}${extension}`;
      counter += 1;
    } catch {
      return {
        filePath,
        fileName: candidate,
      };
    }
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  await assertLocalAdminAllowed();

  const user = await getAdminUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const params = await context.params;
  const kind = parseKind(params.kind);

  if (!kind) {
    return new NextResponse("Invalid content kind", { status: 400 });
  }

  try {
    assertValidSlug(params.slug);
  } catch {
    return new NextResponse("Invalid slug", { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new NextResponse("Missing file", { status: 400 });
  }

  if (!allowedMimeTypes[file.type]) {
    return new NextResponse("Unsupported image type", { status: 415 });
  }

  if (file.size > maxUploadBytes) {
    return new NextResponse("Image is too large. Max size is 12 MB.", {
      status: 413,
    });
  }

  const contentRoot = path.join(contentKindDir(kind), params.slug);
  const imagesDirectory = path.join(contentRoot, "images");
  const safeFileName = sanitizeFileName(file.name, file.type);

  await fs.mkdir(imagesDirectory, { recursive: true });

  const target = await uniqueFilePath(imagesDirectory, safeFileName);
  const bytes = new Uint8Array(await file.arrayBuffer());

  await fs.writeFile(target.filePath, bytes);

  return NextResponse.json({
    filename: target.fileName,
    markdownPath: `./images/${target.fileName}`,
    assetUrl: `/api/admin/content-asset/${kind}/${params.slug}/images/${target.fileName}`,
  });
}
