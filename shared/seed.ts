import type { Snapshot, Product, Order, Media } from "./schema";

// These fixtures are authored from scratch. No production data is imported.
const firstNames = ["Alex", "Jamie", "Taylor", "Morgan", "Casey", "Sam", "Riley", "Avery", "Jordan", "Charlie", "Quinn", "Robin"];
const lastNames = ["Parker", "Reed", "Ellis", "Hayes", "Lane", "Brooks"];
const cities = ["Brookfield", "Northvale", "Lakeview", "Westport", "Cedar Grove", "Fairhaven"];
export function seedSnapshot(now = new Date()): Snapshot {
  const day = (offset: number, hour = 12) => {
    const date = new Date(now); date.setUTCDate(date.getUTCDate() - offset); date.setUTCHours(hour, 15, 0, 0); return date.toISOString();
  };
  const base = (id: string) => ({ id, revision: 0, updatedAt: day(1) });
  const productDefs: [string, string, number, number, number, Product["color"]][] = [
    ["Everyday tote", "Accessories", 38, 14, 68, "sand"], ["Studio notebook", "Stationery", 24, 7, 8, "lilac"],
    ["Ceramic desk cup", "Home & living", 32, 12, 42, "sage"], ["Canvas weekender", "Accessories", 124, 48, 25, "ink"],
    ["Soft linen throw", "Home & living", 86, 31, 6, "sand"], ["Brass bookmark", "Stationery", 18, 4, 82, "rose"],
    ["Daily planner", "Stationery", 36, 11, 33, "sky"], ["Glass carafe", "Home & living", 48, 18, 4, "sage"],
    ["Essential overshirt", "Apparel", 112, 43, 27, "ink"], ["Ribbed cotton tee", "Apparel", 46, 16, 54, "sand"],
    ["Travel pouch", "Accessories", 28, 9, 46, "rose"], ["Object tray", "Home & living", 44, 15, 16, "lilac"],
  ];
  const products = productDefs.map(([name, category, price, cost, stock, color], i) => ({
    ...base(`product-${i + 1}`), name, category, price, cost, stock, color, sku: `ST-${String(i + 1).padStart(3, "0")}`,
    description: `${name}, part of the fictional Studio Goods collection. An intentionally simple product record you can adapt to any business.`,
    threshold: 10, status: (i === 11 ? "Draft" : "Active") as Product["status"], featured: i < 4, mediaId: "",
  }));
  const customers = Array.from({ length: 36 }, (_, i) => {
    const first = firstNames[i % firstNames.length], last = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    return { ...base(`customer-${i + 1}`), name: `${first} ${last}`, email: `${first.toLowerCase()}.${last.toLowerCase()}.${i + 1}@example.test`,
      company: i % 4 === 0 ? `Example Studio ${i + 1}` : "", city: cities[i % cities.length],
      segment: (i < 6 ? "VIP" : i % 3 === 0 ? "New" : "Returning") as "VIP" | "New" | "Returning",
      notes: "Fictional demo contact. This record does not represent a real person.", };
  });
  const orders: Order[] = Array.from({ length: 186 }, (_, i) => {
    const offset = Math.floor(i / 3.1);
    const primary = products[(i * 7) % 11], second = products[(i * 5 + 2) % 11];
    const items = [{ productId: primary.id, name: primary.name, quantity: i % 3 + 1, price: primary.price, cost: primary.cost }];
    if (i % 3 !== 0 && second.id !== primary.id) items.push({ productId: second.id, name: second.name, quantity: 1, price: second.price, cost: second.cost });
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const shipping = subtotal >= 100 ? 0 : 6; const discount = i % 7 === 0 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const fulfillment: Order["fulfillment"] = i % 19 === 0 ? "Cancelled" : offset < 2 ? ["Unfulfilled", "Processing", "Shipped"][i % 3] as Order["fulfillment"] : offset < 5 ? "Shipped" : "Delivered";
    const payment: Order["payment"] = fulfillment === "Cancelled" ? "Refunded" : offset < 2 && i % 3 === 0 ? "Pending" : "Paid";
    return { ...base(`order-${i + 1}`), number: `FM-${2048 - i}`, customerId: customers[(i * 5 + 3) % 36].id, date: day(offset, 9 + i % 10),
      items, shipping, discount, total: Math.round((subtotal + shipping - discount) * 100) / 100, fulfillment, payment,
      notes: "Fictional order for exploring local business workflows.", tracking: fulfillment === "Shipped" || fulfillment === "Delivered" ? `DEMO-${String(i + 1).padStart(5, "0")}` : "", };
  });
  const svgData = (svg: string) => {
    let binary = "";
    for (const byte of new TextEncoder().encode(svg)) binary += String.fromCharCode(byte);
    return `data:image/svg+xml;base64,${btoa(binary)}`;
  };
  const artworks = [
    ["Studio wordmark", "#e9e3f7", "#494060", "STUDIO", "GOODS / EVERYDAY OBJECTS"],
    ["Autumn collection", "#dbe4d7", "#3b503c", "A slower", "KIND OF EVERYDAY."],
    ["Package label", "#efe9df", "#655b4d", "Made for", "YOUR EVERYDAY."],
    ["Social tile", "#dae6ec", "#3f535e", "Good things.", "SMALL DETAILS. BIG DIFFERENCE."],
    ["Seasonal announcement", "#eadfe1", "#66535a", "Something new", "MEET THE STUDIO COLLECTION."],
    ["Gift card artwork", "#30333f", "#eceaf5", "A little gift", "STUDIO GOODS / DEMO GIFT CARD"],
  ];
  const media: Media[] = artworks.map(([name, bg, fg, title, caption], i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${bg}"/><circle cx="680" cy="105" r="190" fill="${fg}" opacity=".07"/><path d="M64 68h55m-55 0v55M736 532h-55m55 0v-55" stroke="${fg}" stroke-width="2" fill="none"/><text x="70" y="325" fill="${fg}" font-family="sans-serif" font-size="${title.length > 10 ? 56 : 74}" font-weight="600">${title}</text><text x="74" y="370" fill="${fg}" font-family="sans-serif" font-size="15" letter-spacing="3">${caption}</text><text x="70" y="530" fill="${fg}" font-family="sans-serif" font-size="13">FICTIONAL BRAND ARTWORK · LOCAL DEMO</text></svg>`;
    return { ...base(`media-${i + 1}`), name, alt: `${name}: original geometric and typographic demo artwork.`, mime: "image/svg+xml", data: svgData(svg), size: new TextEncoder().encode(svg).byteLength, origin: "Built-in demo" };
  });
  const sessions = Array.from({ length: 90 }, (_, i) => {
    const visits = 140 + (i * 47) % 130 + Math.round((90 - i) * 1.6);
    return { date: day(i).slice(0, 10), visits, sources: { Direct: Math.round(visits * 0.36), Search: Math.round(visits * 0.31), Social: Math.round(visits * 0.23), Referral: visits - Math.round(visits * 0.36) - Math.round(visits * 0.31) - Math.round(visits * 0.23) } };
  });
  return { products, customers, orders, media, sessions,
    promotions: [
      { ...base("promotion-1"), name: "A welcome to the studio", code: "WELCOME10", kind: "Percentage", value: 10, minimum: 0, status: "Active", description: "Illustrative discount for a first order." },
      { ...base("promotion-2"), name: "Autumn edit", code: "AUTUMN15", kind: "Percentage", value: 15, minimum: 80, status: "Draft", description: "A fictional seasonal campaign, ready to review." },
      { ...base("promotion-3"), name: "A small thank you", code: "THANKYOU", kind: "Fixed amount", value: 8, minimum: 60, status: "Active", description: "Example loyalty offer for a returning customer." },
    ],
    content: [
      { ...base("content-1"), title: "Our story", slug: "our-story", type: "Page", status: "Published", featured: false, body: "Studio Goods is a fictional business built around useful everyday objects. This editable page demonstrates a reusable content workflow.\n\nWrite a story, save a draft, submit it for review, and publish it to this local workspace." },
      { ...base("content-2"), title: "The autumn edit", slug: "the-autumn-edit", type: "Collection", status: "In review", featured: true, body: "A fictional seasonal selection of home, stationery, and travel essentials.\n\nEvery example can be renamed or replaced when this template becomes your next project." },
      { ...base("content-3"), title: "Shipping & returns", slug: "shipping-and-returns", type: "Page", status: "Published", featured: false, body: "This is sample content for a local demo. It does not describe an actual business policy.\n\nUse the shipping settings to explore example zones and fees." },
      { ...base("content-4"), title: "New arrivals, soon", slug: "new-arrivals-soon", type: "Announcement", status: "Draft", featured: false, body: "A little something is coming to the studio. This announcement is an unpublished local draft." },
    ],
    team: [
      { ...base("team-1"), name: "Alex Morgan", email: "alex@example.test", role: "Owner", status: "Active" },
      { ...base("team-2"), name: "Jamie Ellis", email: "jamie@example.test", role: "Admin", status: "Active" },
      { ...base("team-3"), name: "Taylor Reed", email: "taylor@example.test", role: "Editor", status: "Active" },
    ],
    shipping: [
      { ...base("shipping-1"), name: "Local delivery", fee: 6, freeAbove: 100, delivery: "1–2 business days", enabled: true },
      { ...base("shipping-2"), name: "Standard delivery", fee: 12, freeAbove: 150, delivery: "3–5 business days", enabled: true },
      { ...base("shipping-3"), name: "Express delivery", fee: 24, freeAbove: 0, delivery: "Next business day", enabled: false },
    ],
    settings: [{ ...base("workspace"), name: "Studio Goods", tagline: "Considered goods for everyday living.", currency: "USD", timezone: "UTC", accent: "violet", threshold: 10, orderAlerts: true, stockAlerts: true, paused: false }],
    activity: [
      { id: "activity-seed-1", action: "Workspace created", entity: "workspace", name: "Studio Goods", at: day(0, 8), actor: "Demo owner", before: null, after: null },
      { id: "activity-seed-2", action: "Submitted for review", entity: "content", name: "The autumn edit", at: day(0, 9), actor: "Taylor Reed (demo)", before: null, after: null },
    ],
    notifications: [
      { id: "notification-1", title: "Three products need attention", body: "Studio notebook, Soft linen throw, and Glass carafe are below their stock threshold.", kind: "stock", read: false, at: day(0, 8) },
      { id: "notification-2", title: "The autumn edit is ready for review", body: "Open Publishing to review and publish the fictional collection.", kind: "content", read: false, at: day(0, 9) },
      { id: "notification-3", title: "Your demo workspace is ready", body: "All data is fictional. Edits save to SQLite on this computer.", kind: "order", read: true, at: day(1) },
    ],
    meta: { version: 1, synthetic: true, seededAt: now.toISOString(), database: "SQLite" },
  };
}
