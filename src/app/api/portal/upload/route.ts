import { randomBytes } from "node:crypto";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  ALLOWED_TYPES,
  DEMO_MAX_FILE_BYTES,
  DEMO_MAX_FILES,
  DEMO_TYPES,
  filesFolder,
  formatBytes,
  MAX_FILE_BYTES,
  safeFileName,
} from "@/lib/attachments";
import { openOrder } from "@/lib/portal";
import { putFile, storeConfigured, storePathname } from "@/lib/store";

/**
 * Message attachments. With the Blob store, browsers upload straight to it:
 * this route only checks the portal key and hands out a short-lived upload
 * token. Local runs have no store, so the file comes through here instead.
 */

async function rulesFor(ref: string, key: string) {
  const opened = await openOrder(ref, key);
  if (!opened) throw new Error("This portal link can't upload files.");
  if (!opened.order.demo) {
    return {
      allowedContentTypes: ALLOWED_TYPES,
      maximumSizeInBytes: MAX_FILE_BYTES,
    };
  }
  const files = opened.order.messages.reduce(
    (count, message) => count + (message.attachments?.length ?? 0),
    0,
  );
  if (files >= DEMO_MAX_FILES) {
    throw new Error(
      "The demo is full of files. Press Reset demo to start again.",
    );
  }
  return {
    allowedContentTypes: DEMO_TYPES,
    maximumSizeInBytes: DEMO_MAX_FILE_BYTES,
  };
}

const failed = (error: unknown) =>
  NextResponse.json(
    { error: error instanceof Error ? error.message : "Upload failed." },
    { status: 400 },
  );

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return uploadThroughServer(request);
  }
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { ref = "", k = "" } = JSON.parse(clientPayload ?? "{}") as {
          ref?: string;
          k?: string;
        };
        if (!pathname.startsWith(storePathname(filesFolder(ref)))) {
          throw new Error("Files go in their own project's folder.");
        }
        return { ...(await rulesFor(ref, k)), addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return failed(error);
  }
}

async function uploadThroughServer(request: Request) {
  if (storeConfigured)
    return failed(new Error("Upload straight to the store."));
  try {
    const form = await request.formData();
    const ref = String(form.get("ref") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file.");
    const rules = await rulesFor(ref, String(form.get("k") ?? ""));
    if (!rules.allowedContentTypes.includes(file.type)) {
      throw new Error(`${file.name}: we can't take this type of file.`);
    }
    if (file.size > rules.maximumSizeInBytes) {
      throw new Error(
        `${file.name} is over ${formatBytes(rules.maximumSizeInBytes)}.`,
      );
    }
    const name = safeFileName(file.name).replace(
      /(\.[^.]*)?$/,
      `-${randomBytes(4).toString("hex")}$1`,
    );
    const path = `${filesFolder(ref)}${name}`;
    await putFile(path, Buffer.from(await file.arrayBuffer()), file.type);
    return NextResponse.json({ pathname: storePathname(path) });
  } catch (error) {
    return failed(error);
  }
}
