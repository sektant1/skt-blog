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
    assetPath: string[];
  }>;
};

const imageMimeTypes: Record<string, string> = {
  ".apng": "image/apng",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function parseKind(kind: string): ContentKind | null {
  if (kind === "post" || kind === "project" || kind === "page") {
    return kind;
  }

  return null;
}

function isSafeAssetPath(assetPath: string[]): boolean {
  return (
    assetPath.length > 0 &&
    assetPath.every((segment) => {
      return (
        segment.length > 0 &&
        segment !== "." &&
        segment !== ".." &&
        !segment.includes("\\") &&
        !segment.includes("/")
      );
    })
  );
}

export async function GET(
  _request: Request,
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

  if (!isSafeAssetPath(params.assetPath)) {
    return new NextResponse("Invalid asset path", { status: 400 });
  }

  const extension = path.extname(params.assetPath.at(-1) ?? "").toLowerCase();
  const contentType = imageMimeTypes[extension];

  if (!contentType) {
    return new NextResponse("Unsupported asset type", { status: 415 });
  }

  const contentRoot = path.join(contentKindDir(kind), params.slug);
  const targetPath = path.resolve(contentRoot, ...params.assetPath);
  const relativePath = path.relative(contentRoot, targetPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new NextResponse("Invalid asset path", { status: 400 });
  }

  const file = await fs.readFile(targetPath).catch(() => null);

  if (!file) {
    return new NextResponse("Asset not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
