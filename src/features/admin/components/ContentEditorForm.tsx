"use client";

import { useMemo, useRef, useState } from "react";
import {
  Button,
  FormField,
  Input,
  Tabs,
  Text,
  Textarea,
} from "@/components/ui/phosphor";
import type { ContentKind } from "@/features/content/repositories/contentRepository";
import { saveContentAction } from "../actions/content";
import { MarkdownLivePreview } from "./MarkdownLivePreview";
import styles from "../styles/Admin.module.scss";

const acceptedImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName === "jpg" ? "jpeg" : fromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpeg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";

  return "png";
}

function makeUploadFileName(file: File): string {
  const extension = getFileExtension(file);
  const baseName = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.tz]/gi, "")
    .slice(0, 14);

  return `${baseName || "pasted-image"}-${timestamp}.${extension}`;
}

function insertAtCursor(
  currentValue: string,
  insertText: string,
  textarea: HTMLTextAreaElement | null,
): {
  nextValue: string;
  nextCursor: number;
} {
  if (!textarea) {
    const separator =
      currentValue.endsWith("\n") || currentValue.length === 0 ? "" : "\n\n";
    const nextValue = `${currentValue}${separator}${insertText}\n`;
    return {
      nextValue,
      nextCursor: nextValue.length,
    };
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);
  const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
  const suffix = after.startsWith("\n") || after.length === 0 ? "" : "\n";

  const block = `${prefix}${insertText}${suffix}`;
  const nextValue = `${before}${block}${after}`;

  return {
    nextValue,
    nextCursor: before.length + block.length,
  };
}

async function uploadContentImage({
  kind,
  slug,
  file,
}: {
  kind: ContentKind;
  slug: string;
  file: File;
}): Promise<{
  markdownPath: string;
  filename: string;
}> {
  const formData = new FormData();
  formData.set("file", file, makeUploadFileName(file));

  const response = await fetch(
    `/api/admin/content-asset/${encodeURIComponent(kind)}/${encodeURIComponent(slug)}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Upload failed with status ${response.status}.`);
  }

  return response.json() as Promise<{
    markdownPath: string;
    filename: string;
  }>;
}

export function ContentEditorForm({
  kind,
  slug,
  raw,
}: {
  kind: ContentKind;
  slug?: string;
  raw: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [slugValue, setSlugValue] = useState(slug ?? "");
  const [rawValue, setRawValue] = useState(raw);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadAndInsertFiles(files: FileList | File[]) {
    const normalizedFiles = Array.from(files).filter((file) =>
      acceptedImageTypes.has(file.type),
    );

    if (normalizedFiles.length === 0) {
      setUploadError(
        "No supported image found. Use png, jpg, webp, gif, or avif.",
      );
      return;
    }

    if (!slugValue) {
      setUploadError("Set the slug before pasting or uploading images.");
      return;
    }

    setUploadError(null);
    setUploadStatus(`uploading ${normalizedFiles.length} image(s)...`);

    try {
      let nextRaw = rawValue;
      let nextCursor = textareaRef.current?.selectionStart ?? rawValue.length;

      for (const file of normalizedFiles) {
        const uploaded = await uploadContentImage({
          kind,
          slug: slugValue,
          file,
        });

        const alt = uploaded.filename
          .replace(/\.[^.]+$/, "")
          .replace(/-/g, " ");
        const markdown = `![${alt}](${uploaded.markdownPath})`;

        const result = insertAtCursor(nextRaw, markdown, textareaRef.current);
        nextRaw = result.nextValue;
        nextCursor = result.nextCursor;
      }

      setRawValue(nextRaw);
      setUploadStatus(`inserted ${normalizedFiles.length} image(s)`);

      window.requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Image upload failed.",
      );
      setUploadStatus(null);
    }
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files: File[] = [];

    for (const item of Array.from(event.clipboardData.items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();

        if (file && acceptedImageTypes.has(file.type)) {
          files.push(file);
        }
      }
    }

    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    await uploadAndInsertFiles(files);
  }

  async function handleFileInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) {
      return;
    }

    try {
      await uploadAndInsertFiles(files);
    } finally {
      input.value = "";
    }
  }

  const tabs = useMemo(
    () => [
      {
        id: "editor",
        label: "editor",
        content: (
          <div className={styles.editorTabPanel}>
            <FormField label="Slug">
              <Input
                name="slug"
                value={slugValue}
                placeholder="kebab-case-slug"
                onChange={(event) => setSlugValue(event.currentTarget.value)}
              />
            </FormField>

            <FormField label="Raw MDX">
              <Textarea
                ref={textareaRef}
                className={styles.editor}
                name="raw"
                value={rawValue}
                onChange={(event) => setRawValue(event.currentTarget.value)}
                onPaste={handlePaste}
                placeholder="Write MDX here. Paste images directly into this editor."
              />
            </FormField>

            <div className={styles.editorUploadRow}>
              <input
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                multiple
                onChange={handleFileInputChange}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                upload image/gif
              </Button>

              <Text as="p" variant="body" className={styles.editorHint}>
                Paste images into the editor or upload png, jpg, webp, gif,
                avif.
              </Text>
            </div>

            {uploadStatus ? (
              <Text as="p" variant="body" className={styles.editorStatus}>
                {uploadStatus}
              </Text>
            ) : null}

            {uploadError ? (
              <Text as="p" variant="body" className={styles.error}>
                {uploadError}
              </Text>
            ) : null}
          </div>
        ),
      },
      {
        id: "preview",
        label: "preview",
        content: (
          <MarkdownLivePreview kind={kind} slug={slugValue} raw={rawValue} />
        ),
      },
    ],
    [kind, rawValue, slugValue, uploadError, uploadStatus],
  );

  return (
    <form action={saveContentAction} className={styles.editorForm}>
      <input type="hidden" name="kind" value={kind} />

      <Tabs
        items={tabs}
        defaultValue="editor"
        ariaLabel={`${kind} editor tabs`}
        className={styles.editorTabs}
      />

      <div className={styles.editorToolbar}>
        <Button type="submit">save {kind}</Button>
      </div>
    </form>
  );
}
