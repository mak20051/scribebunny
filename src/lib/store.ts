import { createHash } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile as readDisk,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  del,
  get,
  head,
  list,
  put,
} from "@vercel/blob";

/**
 * JSON documents for the client portal, kept in a private Vercel Blob store
 * (scribebunny-portal; Vercel injects BLOB_READ_WRITE_TOKEN).
 *
 *   portal/orders/<ref>.json  ── one document per order: details, videos, messages
 *   portal/files/<ref>/…      ── files attached to that order's messages
 *
 * Reads skip the CDN cache, so an update shows up on the next page load.
 * Updates are compare-and-swap on the blob's ETag: if two people change the
 * same order at once, the second write retries on top of the first instead of
 * overwriting it.
 *
 * Without the token (local runs only) documents live in memory, or in files
 * under LOCAL_STORE_DIR when that is set, so the website and the portal app
 * can share one local store while testing. Production refuses to run without it.
 *
 * This file is shared word for word by the website and the portal app.
 */

export const storeConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

if (!storeConfigured && process.env.VERCEL_ENV === "production") {
  throw new Error("BLOB_READ_WRITE_TOKEN is not set");
}

const LOCAL_DIR = process.env.LOCAL_STORE_DIR;

/** Local-only file store: one file per document or upload, under LOCAL_STORE_DIR. */
const disk = {
  file: (path: string) => join(LOCAL_DIR!, path),
  async read(path: string) {
    try {
      return await readDisk(disk.file(path));
    } catch {
      return null;
    }
  },
  async write(path: string, body: Buffer | string) {
    await mkdir(dirname(disk.file(path)), { recursive: true });
    await writeFile(disk.file(path), body);
  },
  async list(folder: string): Promise<string[]> {
    const walk = async (dir: string): Promise<string[]> => {
      const entries = await readdir(join(LOCAL_DIR!, dir), {
        withFileTypes: true,
      }).catch(() => []);
      const found = await Promise.all(
        entries.map((entry) =>
          entry.isDirectory()
            ? walk(`${dir}${entry.name}/`)
            : Promise.resolve([`${dir}${entry.name}`]),
        ),
      );
      return found.flat();
    };
    return (await walk(folder)).filter((path) => !path.endsWith(".type"));
  },
};

const etagOf = (body: Buffer | string) =>
  createHash("sha1").update(body).digest("hex");

const ROOT = "portal/";

type Stored<T> = { value: T; etag: string };

const memory: Map<string, { body: string; version: number }> = ((
  globalThis as { __sbStore?: Map<string, { body: string; version: number }> }
).__sbStore ??= new Map());

export async function readJson<T>(path: string): Promise<Stored<T> | null> {
  if (!storeConfigured && LOCAL_DIR) {
    const body = await disk.read(path);
    return body
      ? { value: JSON.parse(body.toString()) as T, etag: etagOf(body) }
      : null;
  }
  if (!storeConfigured) {
    const hit = memory.get(path);
    return hit
      ? { value: JSON.parse(hit.body) as T, etag: String(hit.version) }
      : null;
  }
  const result = await get(`${ROOT}${path}`, {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200) return null;
  const body = await new Response(result.stream).text();
  // Compressed reads report a weak ETag (W/"…"); conditional writes need the strong form.
  return {
    value: JSON.parse(body) as T,
    etag: result.blob.etag.replace(/^W\//, ""),
  };
}

/**
 * Write a document. With `etag`, only if it is unchanged since that read;
 * with `onlyIfNew`, only if it doesn't exist yet. Returns false when the
 * condition fails.
 */
export async function writeJson(
  path: string,
  value: unknown,
  condition: { etag?: string; onlyIfNew?: boolean } = {},
): Promise<boolean> {
  const body = JSON.stringify(value);
  if (!storeConfigured && LOCAL_DIR) {
    const current = await disk.read(path);
    if (condition.onlyIfNew && current) return false;
    if (condition.etag && current && etagOf(current) !== condition.etag) {
      return false;
    }
    await disk.write(path, body);
    return true;
  }
  if (!storeConfigured) {
    const hit = memory.get(path);
    if (condition.onlyIfNew && hit) return false;
    if (condition.etag && hit && String(hit.version) !== condition.etag) {
      return false;
    }
    memory.set(path, { body, version: (hit?.version ?? 0) + 1 });
    return true;
  }
  if (condition.onlyIfNew && (await readJson(path))) return false;
  try {
    await put(`${ROOT}${path}`, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
      ...(condition.etag
        ? { ifMatch: condition.etag }
        : { allowOverwrite: !condition.onlyIfNew }),
    });
    return true;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return false;
    if (condition.onlyIfNew && (await readJson(path))) return false;
    throw error;
  }
}

/** Read, change, and write back a document, retrying if someone else wrote first. */
export async function updateJson<T>(
  path: string,
  change: (value: T) => void,
): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readJson<T>(path);
    if (!current) throw new Error(`No document at ${path}`);
    change(current.value);
    if (await writeJson(path, current.value, { etag: current.etag })) {
      return current.value;
    }
  }
  throw new Error(`Could not update ${path}: too many concurrent changes`);
}

/** Paths of every document under a folder, e.g. listPaths("orders/"). */
export async function listPaths(folder: string): Promise<string[]> {
  if (!storeConfigured && LOCAL_DIR) return disk.list(folder);
  if (!storeConfigured) {
    return [...memory.keys()].filter((key) => key.startsWith(folder));
  }
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: `${ROOT}${folder}`,
      cursor,
      limit: 1000,
    });
    paths.push(...page.blobs.map((blob) => blob.pathname.slice(ROOT.length)));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return paths;
}

/*
 * Files: message attachments. Browsers upload them straight to the store
 * (app/api/portal/upload) and the portal serves them only to people with a
 * key to that order (app/portal/[ref]/file). Without the token they are kept
 * in memory like the documents.
 */

const memoryFiles: Map<string, { body: Buffer; contentType: string }> = ((
  globalThis as {
    __sbFiles?: Map<string, { body: Buffer; contentType: string }>;
  }
).__sbFiles ??= new Map());

/** The store pathname of a file, e.g. for a browser upload. */
export const storePathname = (path: string) => `${ROOT}${path}`;

/** A file's path within the portal store, from its store pathname. */
export const portalPath = (pathname: string) =>
  pathname.startsWith(ROOT) ? pathname.slice(ROOT.length) : null;

export async function putFile(path: string, body: Buffer, contentType: string) {
  if (!storeConfigured && LOCAL_DIR) {
    await disk.write(path, body);
    await disk.write(`${path}.type`, contentType);
    return;
  }
  if (!storeConfigured) {
    memoryFiles.set(path, { body, contentType });
    return;
  }
  await put(`${ROOT}${path}`, body, {
    access: "private",
    contentType,
    addRandomSuffix: false,
  });
}

export async function fileInfo(path: string) {
  if (!storeConfigured && LOCAL_DIR) {
    const body = await disk.read(path);
    const type = await disk.read(`${path}.type`);
    return body
      ? {
          size: body.length,
          contentType: type?.toString() ?? "application/octet-stream",
        }
      : null;
  }
  if (!storeConfigured) {
    const hit = memoryFiles.get(path);
    return hit ? { size: hit.body.length, contentType: hit.contentType } : null;
  }
  try {
    const blob = await head(`${ROOT}${path}`);
    return { size: blob.size, contentType: blob.contentType };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

export async function readFile(path: string) {
  if (!storeConfigured && LOCAL_DIR) {
    const info = await fileInfo(path);
    const body = info ? await disk.read(path) : null;
    return info && body
      ? {
          stream: new Blob([new Uint8Array(body)]).stream(),
          contentType: info.contentType,
          size: info.size,
        }
      : null;
  }
  if (!storeConfigured) {
    const hit = memoryFiles.get(path);
    return hit
      ? {
          stream: new Blob([new Uint8Array(hit.body)]).stream(),
          contentType: hit.contentType,
          size: hit.body.length,
        }
      : null;
  }
  const result = await get(`${ROOT}${path}`, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  return {
    stream: result.stream,
    contentType: result.blob.contentType,
    size: result.blob.size,
  };
}

/** Delete every file under a folder, e.g. deleteFiles("files/SB-DEMO/"). */
export async function deleteFiles(folder: string) {
  if (!storeConfigured && LOCAL_DIR) {
    await rm(disk.file(folder), { recursive: true, force: true });
    return;
  }
  if (!storeConfigured) {
    for (const key of [...memoryFiles.keys()]) {
      if (key.startsWith(folder)) memoryFiles.delete(key);
    }
    return;
  }
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: `${ROOT}${folder}`,
      cursor,
      limit: 1000,
    });
    if (page.blobs.length) await del(page.blobs.map((blob) => blob.url));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}
