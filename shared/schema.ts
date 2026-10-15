import { z } from "zod";

const text = z.string().trim().min(1).max(200);
const note = z.string().max(5000).default("");
const id = z.string().min(1).max(100);
const base = { id, revision: z.number().int().nonnegative().default(0), updatedAt: z.string().default("") };
const money = z.number().finite().nonnegative().max(10000000);

export const productSchema = z.object({
  ...base, name: text, sku: text, category: text, description: note,
  price: money, cost: money, stock: z.number().int().nonnegative().max(1000000),
  threshold: z.number().int().nonnegative().max(1000000).default(10),
  status: z.enum(["Active", "Draft", "Archived"]), color: z.enum(["sand", "sage", "ink", "lilac", "sky", "rose"]),
  mediaId: z.string().max(100).default(""), featured: z.boolean().default(false),
});
export const customerSchema = z.object({
  ...base, name: text, email: z.email().max(200), company: z.string().max(200).default(""),
  city: text, segment: z.enum(["New", "Returning", "VIP"]), notes: note,
});
export const orderSchema = z.object({
  ...base, number: text, customerId: id, date: z.iso.datetime(),
  payment: z.enum(["Paid", "Pending", "Refunded"]),
  fulfillment: z.enum(["Unfulfilled", "Processing", "Shipped", "Delivered", "Cancelled"]),
  items: z.array(z.object({ productId: id, name: text, quantity: z.number().int().min(1).max(1000), price: money, cost: money })).min(1).max(50),
  shipping: money, discount: money, total: money, notes: note, tracking: z.string().max(200).default(""),
});
export const promotionSchema = z.object({
  ...base, name: text, code: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
  kind: z.enum(["Percentage", "Fixed amount"]), value: money, status: z.enum(["Active", "Draft", "Expired"]),
  minimum: money.default(0), description: note,
}).refine(p => p.kind !== "Percentage" || p.value <= 100, { message: "Percentage must be between 0 and 100.", path: ["value"] });
export const contentSchema = z.object({
  ...base, title: text, slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["Page", "Announcement", "Collection"]), status: z.enum(["Draft", "In review", "Published"]),
  body: note, featured: z.boolean().default(false),
});
export const mediaSchema = z.object({
  ...base, name: text, alt: z.string().max(500), mime: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]),
  data: z.string().max(7500000), size: z.number().int().nonnegative(), origin: z.enum(["Built-in demo", "Local upload"]),
});
export const teamSchema = z.object({
  ...base, name: text, email: z.email().max(200), role: z.enum(["Owner", "Admin", "Editor", "Viewer"]),
  status: z.enum(["Active", "Inactive"]),
});
export const shippingSchema = z.object({
  ...base, name: text, fee: money, freeAbove: money, delivery: text, enabled: z.boolean(),
});
export const settingsSchema = z.object({
  ...base, name: text, tagline: z.string().max(200), currency: z.enum(["USD", "EUR", "GBP", "EGP"]),
  timezone: z.enum(["UTC", "Africa/Cairo", "Europe/London", "America/New_York"]),
  accent: z.enum(["violet", "blue", "green"]), threshold: z.number().int().nonnegative().max(10000),
  orderAlerts: z.boolean(), stockAlerts: z.boolean(), paused: z.boolean(),
});
export const schemas = { products: productSchema, customers: customerSchema, orders: orderSchema,
  promotions: promotionSchema, content: contentSchema, media: mediaSchema,
  team: teamSchema, shipping: shippingSchema, settings: settingsSchema };
export type Entity = keyof typeof schemas;
export type Product = z.infer<typeof productSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type Content = z.infer<typeof contentSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type TeamMember = z.infer<typeof teamSchema>;
export type ShippingZone = z.infer<typeof shippingSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type Records = { products: Product; customers: Customer; orders: Order; promotions: Promotion;
  content: Content; media: Media; team: TeamMember; shipping: ShippingZone; settings: Settings };
export type Activity = { id: string; action: string; entity: string; name: string; at: string; actor: string; before: unknown; after: unknown };
export type Notification = { id: string; title: string; body: string; read: boolean; kind: "order" | "stock" | "content"; at: string };
export type SessionDay = { date: string; visits: number; sources: { Direct: number; Search: number; Social: number; Referral: number } };
export type Snapshot = { [K in Entity]: Records[K][] } & {
  activity: Activity[]; notifications: Notification[]; sessions: SessionDay[];
  meta: { version: 1; synthetic: true; seededAt: string; database: "SQLite" };
};
