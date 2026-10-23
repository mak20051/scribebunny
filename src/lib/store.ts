import { BlobPreconditionFailedError, get, list, put } from "@vercel/blob";

/**
 * JSON documents for the client portal, kept in a private Vercel Blob store
 * (scribebunny-portal; Vercel injects BLOB_READ_WRITE_TOKEN).
 *
 *   portal/orders/<ref>.json  ── one document per order: details, videos, messages
 *
 * Reads skip the CDN cache, so an update shows up on the next page load.
 * Updates are compare-and-swap on the blob's ETag: if two people change the
 * same order at once, the second write retries on top of the first instead of
 * overwriting it.
 *
 * Without the token (local runs) documents live in memory for as long as the
 * server process does, which is enough to try the portal.
 */

export const storeConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const ROOT = "portal/";

type Stored<T> = { value: T; etag: string };

const memory: Map<string, { body: string; version: number }> = ((
  globalThis as { __sbStore?: Map<string, { body: string; version: number }> }
).__sbStore ??= new Map());

export async function readJson<T>(path: string): Promise<Stored<T> | null> {
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
