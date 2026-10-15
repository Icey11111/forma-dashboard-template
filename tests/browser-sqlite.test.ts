import { test } from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { createWorkspaceDatabase } from "../shared/database";
import { adaptBrowserSqlite } from "../shared/sqljs";
import { seedSnapshot } from "../shared/seed";

test("fixtures initialize without Node Buffer in a browser environment", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Buffer")!;
  try {
    Reflect.deleteProperty(globalThis, "Buffer");
    const data = seedSnapshot();
    assert.equal(data.customers.length, 36);
    assert.ok(data.media.every(asset => asset.data.startsWith("data:image/svg+xml;base64,")));
  } finally { Object.defineProperty(globalThis, "Buffer", descriptor); }
});

test("browser SQLite preserves validated edits, history and inventory across serialization", async () => {
  const SQL = await initSqlJs();
  let raw = new SQL.Database();
  let db = createWorkspaceDatabase(adaptBrowserSqlite(raw));
  try {
    const initial = db.snapshot();
    assert.equal(initial.meta.synthetic, true);
    assert.ok(initial.customers.every(customer => customer.email.endsWith("@example.test")));
    const product = initial.products.find(item => item.status === "Active" && item.stock > 10)!;
    const saved = db.save("orders", {
      id: "wasm-test-order", revision: 0, updatedAt: "", number: "untrusted", date: new Date().toISOString(), customerId: initial.customers[0].id,
      items: [{ productId: product.id, name: "untrusted", quantity: 2, price: .01, cost: .01 }],
      shipping: 5, discount: 0, total: .01, payment: "Paid", fulfillment: "Unfulfilled", tracking: "", notes: "Fictional browser test",
    });
    assert.equal(saved.total, product.price * 2 + 5);
    assert.equal(db.snapshot().products.find(item => item.id === product.id)!.stock, product.stock - 2);
    const bytes = raw.export(); db.close();
    raw = new SQL.Database(bytes); db = createWorkspaceDatabase(adaptBrowserSqlite(raw));
    assert.equal(db.snapshot().orders.find(item => item.id === saved.id)!.total, saved.total);
    db.save("orders", { ...saved, fulfillment: "Cancelled" });
    assert.equal(db.snapshot().products.find(item => item.id === product.id)!.stock, product.stock);
    const current = db.snapshot().products.find(item => item.id === product.id)!;
    db.save("products", { ...current, name: "Browser edited product" });
    assert.throws(() => db.save("products", current), /changed in another view/);
    const edit = db.snapshot().activity.find(item => item.name === "Browser edited product")!;
    db.restore(edit.id);
    assert.equal(db.snapshot().products.find(item => item.id === product.id)!.name, product.name);
    db.reset();
    assert.equal(db.snapshot().orders.length, initial.orders.length);
    assert.equal(db.snapshot().products.find(item => item.id === product.id)!.revision, 0);
  } finally { db.close(); }
});
