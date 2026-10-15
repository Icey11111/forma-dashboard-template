import type { Snapshot, Order } from "@shared/schema";

export const round = (value: number) => Math.round(value * 100) / 100;
export function money(value: number, currency = "USD", compact = false) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: compact ? 0 : 2 }).format(value);
}
export function dateLabel(value: string, timezone = "UTC", full = false) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", ...(full ? { year: "numeric" } : {}), timeZone: timezone }).format(new Date(value));
}
export function orderSubtotal(order: Order) { return round(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)); }
export function metrics(data: Snapshot, days: number, timezone = data.settings[0].timezone) {
  const current = new Date(Math.max(Date.now(), new Date(data.meta.seededAt).getTime()));
  const format = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const end = format.format(current);
  const calendarDay = (offset: number) => { const date = new Date(end + "T12:00:00Z"); date.setUTCDate(date.getUTCDate() - offset); return date.toISOString().slice(0, 10); };
  const start = calendarDay(days - 1), previousStart = calendarDay(days * 2 - 1);
  const selected = data.orders.filter(order => { const day = format.format(new Date(order.date)); return day >= start && day <= end; });
  const previous = data.orders.filter(order => { const day = format.format(new Date(order.date)); return day >= previousStart && day < start; });
  const eligible = (orders: Order[]) => orders.filter(order => order.fulfillment !== "Cancelled" && order.payment !== "Refunded");
  const paid = (orders: Order[]) => eligible(orders).filter(order => order.payment === "Paid");
  const revenue = (orders: Order[]) => round(paid(orders).reduce((sum, order) => sum + order.total - order.shipping, 0));
  const valid = eligible(selected), paidOrders = paid(selected), netRevenue = revenue(selected);
  const visits = data.sessions.filter(session => session.date >= start && session.date <= end).reduce((sum, session) => sum + session.visits, 0);
  const previousVisits = data.sessions.filter(session => session.date >= previousStart && session.date < start).reduce((sum, session) => sum + session.visits, 0);
  const point = (offset: number, source: Order[], prior = false) => {
    const date = calendarDay(offset + (prior ? days : 0));
    return revenue(source.filter(order => format.format(new Date(order.date)) === date));
  };
  const chart = Array.from({ length: days }, (_, i) => ({ date: calendarDay(days - 1 - i), label: dateLabel(calendarDay(days - 1 - i) + "T12:00:00Z", "UTC"), revenue: point(days - 1 - i, selected), previous: point(days - 1 - i, previous, true) }));
  const profit = round(netRevenue - paidOrders.reduce((sum, order) => sum + order.items.reduce((subtotal, item) => subtotal + item.cost * item.quantity, 0), 0));
  const categories = [...new Set(data.products.map(product => product.category))].map(name => ({ name, revenue: round(paidOrders.reduce((sum, order) => sum + order.items.filter(item => data.products.find(product => product.id === item.productId)?.category === name).reduce((total, item) => total + item.price * item.quantity * (1 - (orderSubtotal(order) ? order.discount / orderSubtotal(order) : 0)), 0), 0)) }));
  return { selected, eligible: valid, revenue: netRevenue, previousRevenue: revenue(previous), profit, count: valid.length, previousCount: eligible(previous).length,
    average: valid.length ? round(valid.reduce((sum, order) => sum + order.total, 0) / valid.length) : 0, visits, previousVisits, conversion: visits ? valid.length / visits * 100 : 0,
    customers: new Set(valid.map(order => order.customerId)).size, chart, categories, start, end,
  };
}
