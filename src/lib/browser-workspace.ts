import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { z } from "zod";
import { createWorkspaceDatabase, WorkspaceError } from "@shared/database";
import { adaptBrowserSqlite } from "@shared/sqljs";
import { schemas, type Entity, type Snapshot } from "@shared/schema";

const sqlite = initSqlJs({ locateFile: () => wasmUrl });
const databaseName = "forma-portfolio-v1";

function openStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("workspace");
    request.onerror = () => reject(new Error("Allow browser storage to use this private demo."));
    request.onblocked = () => reject(new Error("Close other Forma tabs and reload to update browser storage."));
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

function readBytes(storage: IDBDatabase): Promise<Uint8Array | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = storage.transaction("workspace", "readonly");
    const request = transaction.objectStore("workspace").get("sqlite");
    request.onsuccess = () => resolve(request.result as Uint8Array | undefined);
    request.onerror = () => reject(new Error("The private demo database could not be opened. Reload and try again."));
  });
}

function writeBytes(storage: IDBDatabase, bytes: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = storage.transaction("workspace", "readwrite");
    transaction.objectStore("workspace").put(bytes, "sqlite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = transaction.onabort = () => reject(new Error("Browser storage could not save this change. Free some browser storage and try again."));
  });
}

async function request(path: string, method: string, body: unknown): Promise<Snapshot> {
  const storage = await openStorage();
  let workspace: ReturnType<typeof createWorkspaceDatabase> | undefined;
  try {
    const existing = await readBytes(storage);
    const SQL = await sqlite;
    const database = new SQL.Database(existing);
    try { workspace = createWorkspaceDatabase(adaptBrowserSqlite(database)); }
    catch (error) { database.close(); throw error; }
    if (path === "/api/workspace" && method === "GET") {
      // A first visit seeds fictional records. No server or existing file is read.
    } else if (path === "/api/reset" && method === "POST") {
      z.object({ confirm: z.literal("RESET FICTIONAL DATA") }).parse(body);
      workspace.reset();
    } else if (path === "/api/notifications" && method === "POST") {
      const input = z.object({ id: z.string().optional() }).parse(body);
      workspace.markNotifications(input.id);
    } else if (path === "/api/restore" && method === "POST") {
      const input = z.object({ id: z.string().min(1) }).parse(body);
      workspace.restore(input.id);
    } else {
      const match = path.match(/^\/api\/records\/([a-z]+)(?:\/([^/]+))?$/);
      if (!match || !Object.hasOwn(schemas, match[1])) throw new WorkspaceError("Demo action not found.", 404);
      const entity = match[1] as Entity;
      if (method === "POST" && !match[2]) workspace.save(entity, body);
      else if (method === "DELETE" && match[2]) {
        const input = z.object({ revision: z.number().int().nonnegative() }).parse(body);
        workspace.remove(entity, decodeURIComponent(match[2]), input.revision);
      } else throw new WorkspaceError("Demo action not found.", 404);
    }
    const snapshot = workspace.snapshot();
    if (!existing || method !== "GET") await writeBytes(storage, database.export());
    return snapshot;
  } catch (error) {
    if (error instanceof z.ZodError) throw new Error(error.issues.map(issue => issue.message).join(" "));
    throw error;
  } finally { workspace?.close(); storage.close(); }
}

let queue: Promise<unknown> = Promise.resolve();
export function browserRequest(path: string, method = "GET", body?: unknown): Promise<Snapshot> {
  // Web Locks serializes read/mutate/persist across tabs. The queue also covers
  // browsers without Web Locks and React Strict Mode's concurrent first reads.
  const execute = async (): Promise<Snapshot> => {
    if (navigator.locks) return await navigator.locks.request(databaseName, () => request(path, method, body));
    return request(path, method, body);
  };
  const pending = queue.then(execute);
  queue = pending.catch(() => undefined);
  return pending;
}
