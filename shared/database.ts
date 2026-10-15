import { schemas, type Entity, type Snapshot, type Records, type Order, type Product, type Notification } from "./schema";
import { seedSnapshot } from "./seed";

export type SqlValue = string | number | Uint8Array | null;
export interface SqlDatabase {
  exec(sql: string): unknown;
  prepare(sql: string): {
    run(...parameters: SqlValue[]): unknown;
    get(...parameters: SqlValue[]): Record<string, unknown> | undefined;
    all(...parameters: SqlValue[]): Record<string, unknown>[];
  };
  close(): void;
}

export class WorkspaceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function createWorkspaceDatabase(db: SqlDatabase, now = new Date()) {
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS records (entity TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY(entity,id));
    CREATE TABLE IF NOT EXISTS activity (id TEXT PRIMARY KEY, at TEXT NOT NULL, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (id TEXT PRIMARY KEY, body TEXT NOT NULL);`);

  function transaction<T>(fn: () => T): T {
    db.exec("BEGIN IMMEDIATE");
    try { const result = fn(); db.exec("COMMIT"); return result; }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  const put = (entity: Entity, record: Records[Entity]) => db.prepare("INSERT INTO records(entity,id,body) VALUES(?,?,?) ON CONFLICT(entity,id) DO UPDATE SET body=excluded.body").run(entity, record.id, JSON.stringify(record));
  function get<K extends Entity>(entity: K, id: string): Records[K] | undefined {
    const row = db.prepare("SELECT body FROM records WHERE entity=? AND id=?").get(entity, id);
    return row ? JSON.parse(String(row.body)) : undefined;
  }
  function list<K extends Entity>(entity: K): Records[K][] {
    return db.prepare("SELECT body FROM records WHERE entity=? ORDER BY rowid DESC").all(entity).map(row => JSON.parse(String(row.body)));
  }
  function recordName(record: Records[Entity]) { return "name" in record ? record.name : "title" in record ? record.title : record.number; }
  function log(action: string, entity: string, name: string, before: unknown = null, after: unknown = null) {
    const entry = { id: crypto.randomUUID(), at: new Date().toISOString(), actor: "Demo owner", action, entity, name, before, after };
    db.prepare("INSERT INTO activity(id,at,body) VALUES(?,?,?)").run(entry.id, entry.at, JSON.stringify(entry));
  }
  function notify(notification: Omit<Notification, "id" | "at" | "read">) {
    const row = { ...notification, id: crypto.randomUUID(), at: new Date().toISOString(), read: false };
    db.prepare("INSERT INTO notifications(id,body) VALUES(?,?)").run(row.id, JSON.stringify(row));
  }
  function seed(date = new Date()) {
    const snapshot = seedSnapshot(date);
    transaction(() => {
      db.exec("DELETE FROM records; DELETE FROM activity; DELETE FROM notifications; DELETE FROM metadata;");
      for (const entity of Object.keys(schemas) as Entity[]) for (const row of snapshot[entity]) put(entity, row);
      for (const entry of snapshot.activity) db.prepare("INSERT INTO activity(id,at,body) VALUES(?,?,?)").run(entry.id, entry.at, JSON.stringify(entry));
      for (const entry of snapshot.notifications) db.prepare("INSERT INTO notifications(id,body) VALUES(?,?)").run(entry.id, JSON.stringify(entry));
      db.prepare("INSERT INTO metadata(id,body) VALUES('meta',?),('sessions',?)").run(JSON.stringify(snapshot.meta), JSON.stringify(snapshot.sessions));
    });
  }
  if (!db.prepare("SELECT id FROM metadata WHERE id='meta'").get()) seed(now);

  function snapshot(): Snapshot {
    const result = Object.fromEntries((Object.keys(schemas) as Entity[]).map(entity => [entity, list(entity)]));
    return { ...result,
      activity: db.prepare("SELECT body FROM activity ORDER BY at DESC, rowid DESC LIMIT 500").all().map(row => JSON.parse(String(row.body))),
      notifications: db.prepare("SELECT body FROM notifications ORDER BY rowid DESC LIMIT 200").all().map(row => JSON.parse(String(row.body))),
      meta: JSON.parse(String(db.prepare("SELECT body FROM metadata WHERE id='meta'").get()!.body)),
      sessions: JSON.parse(String(db.prepare("SELECT body FROM metadata WHERE id='sessions'").get()!.body)),
    } as Snapshot;
  }

  function canonicalOrder(input: Order, previous?: Order): Order {
    if (!get("customers", input.customerId)) throw new WorkspaceError("Choose an existing demo customer.");
    const seen = new Set<string>();
    const items = input.items.map(item => {
      if (seen.has(item.productId)) throw new WorkspaceError("Combine quantities instead of adding the same product twice.");
      seen.add(item.productId);
      const product = get("products", item.productId);
      if (!product) throw new WorkspaceError("An order product no longer exists.");
      const oldItem = previous?.items.find(line => line.productId === product.id);
      if (!oldItem && product.status !== "Active") throw new WorkspaceError(`${product.name} is not active.`);
      return { productId: product.id, name: oldItem?.name ?? product.name, quantity: item.quantity, price: oldItem?.price ?? product.price, cost: oldItem?.cost ?? product.cost };
    });
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    if (input.discount > subtotal) throw new WorkspaceError("Discount cannot exceed the merchandise subtotal.");
    const number = previous?.number ?? `FM-${Math.max(2048, ...list("orders").map(order => Number(order.number.replace(/\D/g, "")) || 0)) + 1}`;
    return { ...input, number, date: previous?.date ?? new Date().toISOString(), items, total: Math.round((subtotal + input.shipping - input.discount) * 100) / 100 };
  }

  function adjustInventory(next: Order | undefined, previous: Order | undefined) {
    const consumed = (order?: Order) => !order || order.fulfillment === "Cancelled" ? [] : order.items;
    const delta = new Map<string, number>();
    for (const item of consumed(previous)) delta.set(item.productId, (delta.get(item.productId) ?? 0) + item.quantity);
    for (const item of consumed(next)) delta.set(item.productId, (delta.get(item.productId) ?? 0) - item.quantity);
    for (const [id, difference] of delta) {
      if (!difference) continue;
      const product = get("products", id);
      if (!product) throw new WorkspaceError("An order product no longer exists.");
      if (product.stock + difference < 0) throw new WorkspaceError(`${product.name} has only ${product.stock} units available.`);
      const updated = { ...product, stock: product.stock + difference, revision: product.revision + 1, updatedAt: new Date().toISOString() };
      put("products", updated);
      const settings = get("settings", "workspace");
      if (updated.stock <= updated.threshold && product.stock > product.threshold && settings?.stockAlerts) notify({ title: `${product.name} is running low`, body: `${updated.stock} units remain. Open Products to adjust inventory.`, kind: "stock" });
    }
  }

  function validateRelations(entity: Entity, record: Records[Entity]) {
    const others = list(entity).filter(item => item.id !== record.id);
    for (const key of ["sku", "code", "slug", "email"] as const) {
      if (key in record && others.some(item => key in item && String((item as unknown as Record<string, unknown>)[key]).toLowerCase() === String((record as unknown as Record<string, unknown>)[key]).toLowerCase())) throw new WorkspaceError(`This ${key} is already in use.`);
    }
    if (entity === "products") {
      const product = record as Product;
      if (product.mediaId && !get("media", product.mediaId)) throw new WorkspaceError("Choose an existing media asset.");
    }
    if (entity === "media") {
      const media = record as Records["media"];
      const previous = get("media", media.id);
      if (previous?.origin === "Built-in demo" && media.origin === previous.origin && media.data === previous.data && media.mime === previous.mime) return;
      if (media.origin !== "Local upload" || media.mime === "image/svg+xml" || !new RegExp(`^data:${media.mime};base64,[A-Za-z0-9+/=]+$`).test(media.data)) throw new WorkspaceError("Upload a local PNG, JPEG, or WebP image.");
      const buffer = Uint8Array.from(atob(media.data.split(",")[1]), character => character.charCodeAt(0));
      if (buffer.length > 5 * 1024 * 1024) throw new WorkspaceError("Choose an image smaller than 5 MB.");
      const ascii = (start: number, end: number) => new TextDecoder().decode(buffer.subarray(start, end));
      const matches = media.mime === "image/png" ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => buffer[index] === byte) : media.mime === "image/jpeg" ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 : ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
      if (!matches) throw new WorkspaceError("The image contents do not match its file type.");
      media.size = buffer.length;
    }
  }

  function save<K extends Entity>(entity: K, raw: unknown): Records[K] {
    const parsed = schemas[entity].safeParse(raw);
    if (!parsed.success) throw new WorkspaceError(parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(" "));
    let record = parsed.data as Records[K];
    return transaction(() => {
      const previous = get(entity, record.id);
      if (previous && previous.revision !== record.revision) throw new WorkspaceError("This record changed in another view. Refresh and try again.", 409);
      if (entity === "settings" && record.id !== "workspace") throw new WorkspaceError("The workspace settings ID is fixed.");
      validateRelations(entity, record);
      if (entity === "team") {
        const member = record as Records["team"];
        const otherOwners = list("team").filter(item => item.id !== member.id && item.role === "Owner" && item.status === "Active");
        if (!otherOwners.length && (member.role !== "Owner" || member.status !== "Active")) throw new WorkspaceError("Keep at least one active demo owner.");
      }
      if (entity === "content") {
        const content = record as Records["content"];
        if (content.status === "Published" && !content.body.trim()) throw new WorkspaceError("Add page content before publishing.");
      }
      if (entity === "products" && previous && get("settings", "workspace")?.stockAlerts) {
        const product = record as Product, old = previous as Product;
        if (product.stock <= product.threshold && old.stock > old.threshold) notify({ title: `${product.name} is running low`, body: `${product.stock} units remain.`, kind: "stock" });
      }
      if (entity === "orders") {
        if (!previous && get("settings", "workspace")?.paused) throw new WorkspaceError("New orders are paused. Resume them in workspace settings.");
        record = canonicalOrder(record as Order, previous as Order | undefined) as Records[K];
        adjustInventory(record as Order, previous as Order | undefined);
        if (!previous && get("settings", "workspace")?.orderAlerts) notify({ title: `New order ${recordName(record)}`, body: "A fictional order was created locally. No customer has been contacted.", kind: "order" });
      }
      const result = { ...record, revision: (previous?.revision ?? -1) + 1, updatedAt: new Date().toISOString() };
      put(entity, result);
      log(previous ? "Updated" : "Created", entity, recordName(result), previous ?? null, result);
      return result;
    });
  }

  function remove(entity: Entity, id: string, revision: number) {
    transaction(() => {
      const record = get(entity, id);
      if (!record) throw new WorkspaceError("This record no longer exists.", 404);
      if (record.revision !== revision) throw new WorkspaceError("This record changed. Refresh and try again.", 409);
      if (entity === "settings") throw new WorkspaceError("Workspace settings cannot be deleted.");
      if (entity === "customers" && list("orders").some(order => order.customerId === id)) throw new WorkspaceError("This customer has order history. Keep the contact or remove its demo orders first.");
      if (entity === "products" && list("orders").some(order => order.items.some(item => item.productId === id))) throw new WorkspaceError("This product has order history. Archive it instead.");
      if (entity === "media" && list("products").some(product => product.mediaId === id)) throw new WorkspaceError("This image is used by a product. Remove the product's image assignment first.");
      if (entity === "team" && (record as Records["team"]).role === "Owner" && list("team").filter(member => member.role === "Owner" && member.status === "Active").length <= 1) throw new WorkspaceError("Keep at least one demo owner.");
      if (entity === "orders") adjustInventory(undefined, record as Order);
      db.prepare("DELETE FROM records WHERE entity=? AND id=?").run(entity, id);
      log("Deleted", entity, recordName(record), record, null);
    });
  }

  function markNotifications(id?: string) {
    transaction(() => {
      for (const row of db.prepare("SELECT id,body FROM notifications").all()) {
        if (!id || row.id === id) db.prepare("UPDATE notifications SET body=? WHERE id=?").run(JSON.stringify({ ...JSON.parse(String(row.body)), read: true }), String(row.id));
      }
    });
  }
  function restore(activityId: string) {
    const row = db.prepare("SELECT body FROM activity WHERE id=?").get(activityId);
    if (!row) throw new WorkspaceError("The history entry was not found.", 404);
    const entry = JSON.parse(String(row.body));
    if (!entry.before || !["products", "content", "promotions", "settings", "shipping"].includes(entry.entity)) throw new WorkspaceError("Only product, content, promotion, shipping, and workspace edits can be restored.");
    const current = get(entry.entity as Entity, entry.before.id);
    if (!current) throw new WorkspaceError("The record was deleted. Re-create it before restoring an older edit.");
    save(entry.entity, { ...entry.before, revision: current.revision });
  }
  return { snapshot, save, remove, markNotifications, restore, reset: seed, close: () => db.close() };
}
