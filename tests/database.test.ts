import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { openWorkspaceDatabase, WorkspaceError } from "../server/database";
import { metrics } from "../src/lib/metrics";
import type { Order } from "../shared/schema";

function order(db: ReturnType<typeof openWorkspaceDatabase>): Order {
  const state = db.snapshot(), product = state.products.find(p => p.status === "Active" && p.stock > 10)!;
  return { id: "test-order", revision: 0, updatedAt: "", number: "Untrusted number", customerId: state.customers[0].id, date: new Date().toISOString(),
    items: [{ productId: product.id, name: "Untrusted name", price: .01, cost: .01, quantity: 2 }], total: .01,
    shipping: 6, discount: 2, payment: "Pending", fulfillment: "Unfulfilled", tracking: "", notes: "Fictional test order" };
}
test("fixtures are synthetic and persistence survives closing and reopening SQLite", () => {
  const directory = mkdtempSync(join(tmpdir(), "forma-db-")), path = join(directory, "workspace.sqlite");
  let db = openWorkspaceDatabase(path);
  try {
    const data = db.snapshot(); assert.equal(data.meta.synthetic, true); assert.ok(data.customers.every(c => c.email.endsWith("@example.test")));
    const product = data.products[0]; const saved = db.save("products", { ...product, name: "Renamed fictional product" });
    db.close(); db = openWorkspaceDatabase(path); assert.equal(db.snapshot().products.find(p => p.id === saved.id)?.name, "Renamed fictional product");
    assert.ok(db.snapshot().activity.some(a => a.name === "Renamed fictional product"));
  } finally {
    db.close();
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.match(basename(directory), /^forma-db-/);
    rmSync(directory, { recursive: true, force: true });
  }
});
test("order totals are authoritative, stock updates, cancellation reverses once, and historical prices stay fixed", () => {
  const db = openWorkspaceDatabase(":memory:");
  try {
    const draft = order(db), product = db.snapshot().products.find(p => p.id === draft.items[0].productId)!;
    const saved = db.save("orders", draft);
    assert.equal(saved.items[0].price, product.price); assert.equal(saved.items[0].name, product.name); assert.equal(saved.total, product.price * 2 + 4);
    assert.notEqual(saved.number, draft.number); assert.equal(db.snapshot().products.find(p => p.id === product.id)?.stock, product.stock - 2);
    const currentProduct = db.snapshot().products.find(p => p.id === product.id)!; db.save("products", { ...currentProduct, price: product.price + 10 });
    const cancelled = db.save("orders", { ...saved, fulfillment: "Cancelled" }); assert.equal(cancelled.items[0].price, product.price);
    assert.equal(db.snapshot().products.find(p => p.id === product.id)?.stock, product.stock);
    db.save("orders", { ...cancelled, notes: "Still cancelled" }); assert.equal(db.snapshot().products.find(p => p.id === product.id)?.stock, product.stock);
  } finally { db.close(); }
});
test("insufficient stock rolls back the whole order and optimistic revisions reject stale edits", () => {
  const db = openWorkspaceDatabase(":memory:");
  try {
    const draft = order(db), before = db.snapshot(); draft.items[0].quantity = 1000;
    assert.throws(() => db.save("orders", draft), /units available/);
    assert.equal(db.snapshot().orders.length, before.orders.length); assert.equal(db.snapshot().activity.length, before.activity.length);
    const product = before.products[0]; db.save("products", { ...product, stock: product.stock + 1 });
    assert.throws(() => db.save("products", product), (error: unknown) => error instanceof WorkspaceError && error.status === 409);
    const bad = { ...before.products[1], stock: -1 }; assert.throws(() => db.save("products", bad), /stock/);
  } finally { db.close(); }
});
test("relations, discount limits, paused orders, and an active owner are enforced", () => {
  const db = openWorkspaceDatabase(":memory:");
  try {
    const state = db.snapshot();
    assert.throws(() => db.remove("products", state.orders[0].items[0].productId, 0), /order history/);
    assert.throws(() => db.remove("customers", state.orders[0].customerId, 0), /order history/);
    const draft = order(db); draft.discount = 999999; assert.throws(() => db.save("orders", draft), /Discount/);
    const owner = state.team.find(member => member.role === "Owner")!; assert.throws(() => db.save("team", { ...owner, role: "Viewer" }), /active demo owner/);
    db.save("settings", { ...state.settings[0], paused: true }); assert.throws(() => db.save("orders", order(db)), /paused/);
  } finally { db.close(); }
});
test("content revisions can be restored, media metadata can be edited, and reset removes all local edits", () => {
  const db = openWorkspaceDatabase(":memory:");
  try {
    const initial = db.snapshot(); const content = initial.content[0]; db.save("content", { ...content, title: "New fictional title" });
    const activity = db.snapshot().activity.find(entry => entry.name === "New fictional title")!; db.restore(activity.id);
    assert.equal(db.snapshot().content.find(c => c.id === content.id)?.title, content.title);
    const media = initial.media[0]; db.save("media", { ...media, alt: "A helpful alternate description." });
    assert.equal(db.snapshot().media.find(m => m.id === media.id)?.alt, "A helpful alternate description.");
    assert.throws(() => db.save("media", { ...media, id: "unsafe-image", origin: "Local upload", data: "data:image/svg+xml;base64,PHN2Zz4=" }), /PNG, JPEG, or WebP/);
    db.markNotifications(); assert.ok(db.snapshot().notifications.every(n => n.read));
    db.reset(); assert.equal(db.snapshot().orders.length, initial.orders.length); assert.equal(db.snapshot().content.find(c => c.id === content.id)?.revision, 0);
  } finally { db.close(); }
});
test("reports derive revenue and cost from paid eligible records", () => {
  const db = openWorkspaceDatabase(":memory:");
  try {
    const data = db.snapshot(); const m = metrics(data, 90);
    const expected = data.orders.filter(o => o.payment === "Paid" && o.fulfillment !== "Cancelled").reduce((sum, o) => sum + o.total - o.shipping, 0);
    assert.equal(m.revenue, Math.round(expected * 100) / 100);
    assert.ok(Math.abs(m.categories.reduce((sum, category) => sum + category.revenue, 0) - m.revenue) < .1);
    assert.equal(m.chart.length, 90); assert.ok(m.profit < m.revenue);
  } finally { db.close(); }
});
