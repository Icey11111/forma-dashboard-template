import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { LayoutDashboard, ShoppingBag, Users, Package, Sparkles, FileText, ChartNoAxesCombined, Images, Settings, History, Bell, HeartPulse, ListChecks, PanelLeftClose, PanelLeftOpen, Search, Sun, Moon, ChevronsUpDown, ChevronRight, ArrowUpRight, BookOpen, Database, CheckCircle2, AlertCircle, Menu, X, Keyboard, CircleHelp, RefreshCw, ArrowRight, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace, exportSnapshot } from "@/lib/workspace";
import { TEMPLATE } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Avatar, Empty } from "@/components/common";
import { Overview, Analytics } from "@/pages/reports";
import { Products, Customers, Orders, Promotions } from "@/pages/commerce";
import { ContentPage, MediaPage, ActivityPage, NotificationsPage, SettingsPage, HealthPage } from "@/pages/workspace";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "Workspace" },
  { id: "customers", label: "Customers", icon: Users, group: "Workspace" },
  { id: "products", label: "Products", icon: Package, group: "Workspace" },
  { id: "merchandising", label: "Merchandising", icon: Sparkles, group: "Workspace" },
  { id: "content", label: "Content", icon: FileText, group: "Workspace" },
  { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined, group: "Workspace" },
  { id: "media", label: "Media library", icon: Images, group: "Workspace" },
  { id: "publishing", label: "Publishing", icon: ListChecks, group: "Manage" },
  { id: "activity", label: "Activity & history", icon: History, group: "Manage" },
  { id: "health", label: "Workspace health", icon: HeartPulse, group: "Manage" },
  { id: "settings", label: "Settings", icon: Settings, group: "Manage" },
];
function readRoute() { const [page = "overview", id] = location.hash.replace(/^#\/?/, "").split("/"); return { page: page || "overview", id: id ? decodeURIComponent(id) : undefined }; }
function readPreference(key: string, fallback: string) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }

export function App() {
  const { data, loading, error, refresh, toast } = useWorkspace();
  const [route, setRoute] = useState(readRoute), [collapsed, setCollapsed] = useState(false), [mobile, setMobile] = useState(false), [search, setSearch] = useState(false), [guide, setGuide] = useState(false);
  const [dark, setDark] = useState(() => readPreference("forma-theme", "light") === "dark"); const reduced = useReducedMotion();
  useEffect(() => { const change = () => { setRoute(readRoute()); window.scrollTo({ top: 0 }); }; window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); try { localStorage.setItem("forma-theme", dark ? "dark" : "light"); } catch { /* Preference persistence is optional. */ } }, [dark]);
  useEffect(() => { if (data) document.documentElement.dataset.accent = data.settings[0].accent; }, [data?.settings]);
  useEffect(() => { function shortcut(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearch(open => !open); } } window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut); }, []);
  function navigate(page: string, id?: string) {
    const event = new Event("forma:navigate", { cancelable: true }); if (!window.dispatchEvent(event)) return;
    location.hash = `/${page}${id ? `/${encodeURIComponent(id)}` : ""}`; setMobile(false); setSearch(false);
  }
  if (loading) return <div className="startup"><div className="brand-loading">{TEMPLATE.name}</div><p>Opening your local workspace…</p><Skeleton className="startup-skeleton" /></div>;
  if (error || !data) return <main className="startup"><Database size={32} /><h1>{import.meta.env.MODE === "portfolio" ? "Open your private demo workspace." : "Start your local workspace."}</h1><p>{error || "The local database could not be loaded."}</p><Button onClick={() => void refresh()}><RefreshCw />Try again</Button></main>;
  const active = navigation.find(item => item.id === route.page), owner = data.team.find(member => member.role === "Owner")?.name || "Demo owner";
  const pending = data.content.filter(item => item.status !== "Published").length, unread = data.notifications.filter(item => !item.read).length;
  const rail = (isMobile = false) => <><div className="brand"><button onClick={() => navigate("overview")} aria-label="Forma overview"><span className="brand-symbol" aria-hidden="true"><span /></span>{(!collapsed || isMobile) && <span>{TEMPLATE.name}<small>workspace</small></span>}</button>{!isMobile && !collapsed && <Button variant="ghost" size="icon-sm" aria-label="Collapse navigation" onClick={() => setCollapsed(true)}><PanelLeftClose size={16} /></Button>}</div>
    {(!collapsed || isMobile) && <button className="workspace-switcher" onClick={() => navigate("settings")}><span className="store-symbol">{data.settings[0].name.split(" ").slice(0, 2).map(part => part[0]).join("")}</span><span><strong>{data.settings[0].name}</strong><small>Business workspace</small></span><ChevronsUpDown size={14} /></button>}
    <nav className="navigation" aria-label="Main navigation">{["Workspace", "Manage"].map(group => <div key={group} className="nav-group">{(!collapsed || isMobile) && <p>{group}</p>}{navigation.filter(item => item.group === group).map(item => <button key={item.id} className={cn("nav-item", route.page === item.id && "active")} title={collapsed && !isMobile ? item.label : undefined} aria-label={item.label} aria-current={route.page === item.id ? "page" : undefined} onClick={() => navigate(item.id)}>{route.page === item.id && <motion.span className="nav-active-bg" layoutId={isMobile ? "mobile-nav-active" : "nav-active"} transition={{ duration: reduced ? 0 : .18 }} />}<item.icon size={18} strokeWidth={1.7} />{(!collapsed || isMobile) && <><span>{item.label}</span>{item.id === "orders" && <span className="nav-count">{data.orders.filter(o => o.fulfillment === "Unfulfilled").length}</span>}{item.id === "publishing" && pending > 0 && <span className="nav-count">{pending}</span>}</>}</button>)}</div>)}</nav>
    <div className="rail-footer">{(!collapsed || isMobile) && <><button className="template-guide" onClick={() => { setGuide(true); setMobile(false); }}><BookOpen size={17} /><span><strong>Make it your own</strong><small>Explore the template guide</small></span><ArrowUpRight size={14} /></button><div className="local-indicator"><span />Local demo<small>All data is fictional</small></div></>}{collapsed && !isMobile && <Button variant="ghost" size="icon" aria-label="Expand navigation" onClick={() => setCollapsed(false)}><PanelLeftOpen /></Button>}</div></>;
  let page: ReactNode;
  switch (route.page) {
    case "overview": page = <Overview navigate={navigate} />; break;
    case "orders": page = <Orders initialId={route.id} />; break;
    case "customers": page = <Customers initialId={route.id} />; break;
    case "products": page = <Products initialId={route.id} />; break;
    case "merchandising": page = <Promotions initialId={route.id} />; break;
    case "content": page = <ContentPage initialId={route.id} />; break;
    case "publishing": page = <ContentPage publishing />; break;
    case "analytics": page = <Analytics navigate={navigate} />; break;
    case "media": page = <MediaPage initialId={route.id} />; break;
    case "activity": page = <ActivityPage />; break;
    case "notifications": page = <NotificationsPage />; break;
    case "health": page = <HealthPage />; break;
    case "settings": page = <SettingsPage />; break;
    default: page = <Empty title="This page isn't in the workspace" description="Go back to your overview to continue." action={<Button onClick={() => navigate("overview")}>Open overview</Button>} />;
  }
  return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to content</a><div className={cn("app-shell", collapsed && "rail-collapsed")}><aside className="rail">{rail()}</aside><div className="workspace"><header className="topbar"><div className="breadcrumbs"><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu /></Button><span className="breadcrumb-home"><LayoutDashboard size={15} /></span><span className="breadcrumb-root">Workspace</span><ChevronRight size={13} /><strong>{active?.label || (route.page === "notifications" ? "Notifications" : "Overview")}</strong></div><div className="topbar-actions"><button className="search-trigger" onClick={() => setSearch(true)}><Search size={15} /><span>Search anything…</span><kbd>Ctrl K</kbd></button><span className="demo-badge">Demo workspace</span><Button variant="ghost" size="icon" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark(value => !value)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button><Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="notification-button" onClick={() => navigate("notifications")}><Bell size={18} />{unread > 0 && <span className="notification-dot" />}</Button><button className="owner-button" aria-label="Open team settings" onClick={() => navigate("settings")}><Avatar name={owner} small /></button></div></header>
      <main id="main-content" tabIndex={-1} className="main-content" key={`${route.page}/${route.id || ""}`}>{page}</main><footer className="workspace-footer"><span>{TEMPLATE.name} · A little order for your everyday.</span><button onClick={() => setGuide(true)}>Template guide<ArrowUpRight size={12} /></button></footer></div></div>
      <Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="mobile-rail"><SheetTitle className="sr-only">Workspace navigation</SheetTitle><SheetDescription className="sr-only">Choose a page in the Forma demo workspace.</SheetDescription>{rail(true)}</SheetContent></Sheet>
      <SearchPalette open={search} onClose={() => setSearch(false)} navigate={navigate} />
      <Dialog open={guide} onOpenChange={setGuide}><DialogContent className="guide-dialog"><DialogHeader><DialogTitle>Meet your next starting point.</DialogTitle><DialogDescription>{TEMPLATE.name} is a reusable business and store-management workspace.</DialogDescription></DialogHeader><div className="guide-intro"><span className="brand-symbol"><span /></span><div><h2>Built to be made yours.</h2><p>Explore the workflow, change a detail, and watch the rest of the workspace respond.</p></div></div><div className="guide-steps"><div><ShoppingBag /><span><strong>Run a demo business</strong><p>Create orders, manage stock, edit customer profiles, and test promotions.</p></span></div><div><FileText /><span><strong>Keep the team organized</strong><p>Review content, publish locally, manage team profiles, and follow activity history.</p></span></div><div><Database /><span><strong>Your computer is the whole workspace</strong><p>Records and uploaded images save to local SQLite. Every included record is fictional.</p></span></div><div><Palette /><span><strong>Give it a new identity</strong><p>Change the business name, currency, accent, and theme in Settings. The source and guide explain how to adapt it further.</p></span></div></div><div className="dialog-actions"><Button variant="outline" onClick={() => exportSnapshot(data)}><Download />Export local data</Button><Button onClick={() => { setGuide(false); navigate("settings"); }}>Make it yours<ArrowRight /></Button></div></DialogContent></Dialog>
      {toast && <div className={cn("toast", toast.error && "toast-error")} role={toast.error ? "alert" : "status"}>{toast.error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}<span>{toast.message}</span></div>}
    </MotionConfig>;
}
function SearchPalette({ open, onClose, navigate }: { open: boolean; onClose: () => void; navigate: (page: string, id?: string) => void }) {
  const { data } = useWorkspace(); const [query, setQuery] = useState(""), [index, setIndex] = useState(0); const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) { setQuery(""); setIndex(0); } }, [open]);
  const entries = [
    ...navigation.map(item => ({ title: item.label, subtitle: "Go to page", page: item.id, id: undefined as string | undefined, icon: item.icon })),
    ...data!.products.map(item => ({ title: item.name, subtitle: `Product · ${item.sku}`, page: "products", id: item.id, icon: Package })),
    ...data!.customers.map(item => ({ title: item.name, subtitle: `Customer · ${item.email}`, page: "customers", id: item.id, icon: Users })),
    ...data!.orders.map(item => ({ title: `#${item.number}`, subtitle: `Order · ${data!.customers.find(c => c.id === item.customerId)?.name}`, page: "orders", id: item.id, icon: ShoppingBag })),
    ...data!.content.map(item => ({ title: item.title, subtitle: `Content · ${item.status}`, page: "content", id: item.id, icon: FileText })),
  ];
  const results = entries.filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase())).slice(0, 9), safeIndex = Math.min(index, results.length - 1);
  function select(position: number) { const result = results[position]; if (result) { navigate(result.page, result.id); onClose(); } }
  return <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) onClose(); }}><DialogContent className="search-dialog" showCloseButton={false}><DialogHeader><DialogTitle className="sr-only">Search workspace</DialogTitle><DialogDescription className="sr-only">Search pages and fictional business records. Use arrow keys and Enter to open a result.</DialogDescription></DialogHeader><div className="palette-search"><Search size={20} /><Input placeholder="Search pages, orders, products…" aria-label="Search workspace" value={query} onChange={event => { setQuery(event.target.value); setIndex(0); }} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = Math.max(0, Math.min(results.length - 1, safeIndex + (event.key === "ArrowDown" ? 1 : -1))); setIndex(next); listRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); } if (event.key === "Enter") { event.preventDefault(); select(safeIndex); } }} /><kbd>esc</kbd></div><div className="search-results" ref={listRef}>{results.map((result, i) => <button key={`${result.page}-${result.id || "page"}`} className={cn(i === safeIndex && "highlighted")} onClick={() => select(i)} onMouseEnter={() => setIndex(i)}><result.icon size={18} /><span><strong>{result.title}</strong><small>{result.subtitle}</small></span><ArrowUpRight size={15} /></button>)}{!results.length && <Empty title="No matches yet" description="Try a product name, customer, order number, or page." />}</div><footer className="palette-footer"><span>↑ ↓ to navigate</span><span>Enter to open</span><span>Local records only</span></footer></DialogContent></Dialog>;
}
