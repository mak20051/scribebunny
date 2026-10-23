/**
 * Key-value store for the client portal: Upstash Redis over its REST API
 * (Vercel Marketplace → Upstash injects KV_REST_API_URL/TOKEN or
 * UPSTASH_REDIS_REST_URL/TOKEN). No SDK: each command is one fetch.
 *
 * Without those env vars (local runs) it falls back to an in-memory map that
 * lives as long as the server process, which is enough to try the portal.
 * Every key is prefixed with "sb:" so a shared Redis stays tidy.
 */

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeConfigured = Boolean(URL_ && TOKEN);

type Command = (string | number)[];

type Memory = {
  strings: Map<string, string>;
  lists: Map<string, string[]>;
  sorted: Map<string, Map<string, number>>;
};

const memory: Memory = ((globalThis as { __sbStore?: Memory }).__sbStore ??= {
  strings: new Map(),
  lists: new Map(),
  sorted: new Map(),
});

let warned = false;

export async function redis(cmd: Command): Promise<unknown> {
  if (!storeConfigured) {
    if (!warned && process.env.NODE_ENV === "production") {
      console.warn("[store] no Redis configured, using per-instance memory");
      warned = true;
    }
    return memoryCommand(cmd);
  }
  const response = await fetch(URL_!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as {
    result?: unknown;
    error?: string;
  };
  if (!response.ok || json.error) {
    throw new Error(`redis ${response.status}: ${json.error ?? ""}`);
  }
  return json.result ?? null;
}

function memoryCommand([op, key, ...args]: Command): unknown {
  const k = String(key);
  switch (op) {
    case "GET":
      return memory.strings.get(k) ?? null;
    case "SET": {
      const nx = args.includes("NX");
      if (nx && memory.strings.has(k)) return null;
      memory.strings.set(k, String(args[0]));
      return "OK";
    }
    case "RPUSH": {
      const list = memory.lists.get(k) ?? [];
      list.push(...args.map(String));
      memory.lists.set(k, list);
      return list.length;
    }
    case "LRANGE": {
      const list = memory.lists.get(k) ?? [];
      const start = Number(args[0]);
      const stop = Number(args[1]);
      return list.slice(start, stop === -1 ? undefined : stop + 1);
    }
    case "ZADD": {
      const set = memory.sorted.get(k) ?? new Map<string, number>();
      set.set(String(args[1]), Number(args[0]));
      memory.sorted.set(k, set);
      return 1;
    }
    case "ZREVRANGE": {
      const set = memory.sorted.get(k) ?? new Map<string, number>();
      const sorted = [...set.entries()].sort((a, b) => b[1] - a[1]);
      const start = Number(args[0]);
      const stop = Number(args[1]);
      return sorted
        .slice(start, stop === -1 ? undefined : stop + 1)
        .map(([member]) => member);
    }
    default:
      throw new Error(`memory store: unsupported command ${op}`);
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await redis(["GET", `sb:${key}`]);
  return typeof value === "string" ? (JSON.parse(value) as T) : null;
}

export async function setJson(key: string, value: unknown, onlyIfNew = false) {
  const result = await redis([
    "SET",
    `sb:${key}`,
    JSON.stringify(value),
    ...(onlyIfNew ? ["NX"] : []),
  ]);
  return result === "OK";
}

export async function pushJson(key: string, value: unknown) {
  await redis(["RPUSH", `sb:${key}`, JSON.stringify(value)]);
}

export async function listJson<T>(key: string): Promise<T[]> {
  const values = (await redis(["LRANGE", `sb:${key}`, 0, -1])) as string[];
  return (values ?? []).map((value) => JSON.parse(value) as T);
}

export async function addToIndex(key: string, member: string, score: number) {
  await redis(["ZADD", `sb:${key}`, score, member]);
}

export async function readIndex(key: string): Promise<string[]> {
  return ((await redis(["ZREVRANGE", `sb:${key}`, 0, -1])) as string[]) ?? [];
}
