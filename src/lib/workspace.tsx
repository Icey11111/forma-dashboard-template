import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { Snapshot, Entity, Records } from "@shared/schema";

type WorkspaceContext = {
  data: Snapshot | null; error: string; loading: boolean; busy: boolean;
  toast: { message: string; error: boolean } | null;
  refresh: () => Promise<void>;
  save: <K extends Entity>(entity: K, record: Records[K]) => Promise<boolean>;
  remove: (entity: Entity, id: string, revision: number) => Promise<boolean>;
  action: (path: string, body?: unknown, message?: string) => Promise<boolean>;
  notify: (message: string, error?: boolean) => void;
};
const Context = createContext<WorkspaceContext | null>(null);
export async function localRequest(path: string, method = "GET", body?: unknown): Promise<Snapshot> {
  if (!path.startsWith("/api/")) throw new Error("Only local workspace endpoints are allowed.");
  if (import.meta.env.MODE === "portfolio") {
    const { browserRequest } = await import("./browser-workspace");
    return browserRequest(path, method, body);
  }
  const response = await fetch(path, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The local request failed.");
  return result;
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<WorkspaceContext["toast"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lock = useRef(false);
  const notify = useCallback((message: string, isError = false) => {
    if (timer.current) clearTimeout(timer.current); setToast({ message, error: isError });
    timer.current = setTimeout(() => setToast(null), isError ? 7500 : 3500);
  }, []);
  const refresh = useCallback(async () => {
    try { setData(await localRequest("/api/workspace")); setError(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Start the local server and reload."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); return () => { if (timer.current) clearTimeout(timer.current); }; }, [refresh]);
  async function change(path: string, method: string, body: unknown, message: string) {
    if (lock.current) { notify("Wait for the current change to finish.", true); return false; }
    lock.current = true; setBusy(true);
    try { setData(await localRequest(path, method, body)); notify(message); return true; }
    catch (error) { notify(error instanceof Error ? error.message : "The change could not be saved.", true); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ data, error, loading, busy, toast, refresh, notify,
    save: (entity, record) => change(`/api/records/${entity}`, "POST", record, "Changes saved locally."),
    remove: (entity, id, revision) => change(`/api/records/${entity}/${encodeURIComponent(id)}`, "DELETE", { revision }, "Record removed from the local workspace."),
    action: (path, body = {}, message = "Workspace updated.") => change(path, "POST", body, message),
  }}>{children}</Context.Provider>;
}
export function useWorkspace() { const context = useContext(Context); if (!context) throw new Error("Workspace provider missing."); return context; }
export function download(name: string, data: string, mime = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type: mime })); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportSnapshot(data: Snapshot) { download("forma-local-workspace.json", JSON.stringify(data, null, 2)); }
export function exportCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => { let text = String(value); if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
  download(name, [headers, ...rows].map(row => row.map(cell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}
