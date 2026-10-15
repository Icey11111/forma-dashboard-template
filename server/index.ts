import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
import { z } from "zod";
import { schemas, type Entity } from "../shared/schema";
import { openWorkspaceDatabase, WorkspaceError } from "./database";

const root = fileURLToPath(new URL("../", import.meta.url));
const production = process.argv.includes("--production");
const port = Number(process.env.FORMA_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("FORMA_PORT must be a port from 1024 to 65535.");
const workspace = openWorkspaceDatabase(resolve(root, ".local/workspace.sqlite"));
const origins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);
const mimeTypes: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".webp": "image/webp", ".json": "application/json" };

function json(response: ServerResponse, value: unknown, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}
async function body(request: IncomingMessage) {
  let size = 0; const chunks: Buffer[] = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) throw new WorkspaceError("The request is too large. Images must be under 5 MB.", 413);
    chunks.push(Buffer.from(chunk));
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new WorkspaceError("Send valid JSON."); }
}

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'self' ${production ? "" : "'unsafe-inline'"}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' ${production ? "" : `ws://127.0.0.1:${port} ws://localhost:${port}`}; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`);
  try {
    const host = request.headers.host;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) throw new WorkspaceError("This workspace accepts local requests only.", 403);
    if (request.headers.origin && !origins.has(request.headers.origin)) throw new WorkspaceError("Cross-origin requests are not allowed.", 403);
    const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith("/api/")) {
      if (!["GET", "HEAD"].includes(request.method || "") && request.headers["content-type"]?.split(";")[0] !== "application/json") throw new WorkspaceError("Use JSON for local changes.", 415);
      if (url.pathname === "/api/workspace" && request.method === "GET") return json(response, workspace.snapshot());
      if (url.pathname === "/api/health" && request.method === "GET") return json(response, { local: true, database: "SQLite", synthetic: true, connections: 0 });
      if (url.pathname === "/api/export" && request.method === "GET") {
        response.setHeader("Content-Disposition", "attachment; filename=forma-local-workspace.json");
        return json(response, workspace.snapshot());
      }
      if (url.pathname === "/api/reset" && request.method === "POST") {
        const input = z.object({ confirm: z.literal("RESET FICTIONAL DATA") }).parse(await body(request));
        if (input.confirm) workspace.reset(); return json(response, workspace.snapshot());
      }
      if (url.pathname === "/api/notifications" && request.method === "POST") {
        const input = z.object({ id: z.string().optional() }).parse(await body(request)); workspace.markNotifications(input.id); return json(response, workspace.snapshot());
      }
      if (url.pathname === "/api/restore" && request.method === "POST") {
        const input = z.object({ id: z.string().min(1) }).parse(await body(request)); workspace.restore(input.id); return json(response, workspace.snapshot());
      }
      const match = url.pathname.match(/^\/api\/records\/([a-z]+)(?:\/([^/]+))?$/);
      if (match && Object.hasOwn(schemas, match[1])) {
        const entity = match[1] as Entity;
        if (request.method === "POST" && !match[2]) { workspace.save(entity, await body(request)); return json(response, workspace.snapshot()); }
        if (request.method === "DELETE" && match[2]) {
          const input = z.object({ revision: z.number().int().nonnegative() }).parse(await body(request));
          workspace.remove(entity, decodeURIComponent(match[2]), input.revision); return json(response, workspace.snapshot());
        }
      }
      return json(response, { error: "Local endpoint not found." }, 404);
    }
    if (!production) return vite!.middlewares(request, response, () => { response.writeHead(404); response.end("Not found"); });
    const dist = resolve(root, "dist");
    let path = resolve(dist, `.${decodeURIComponent(url.pathname)}`);
    if (path !== dist && !path.startsWith(dist + sep)) throw new WorkspaceError("Path not found.", 404);
    try { if (!(await stat(path)).isFile()) path = resolve(dist, "index.html"); }
    catch { path = resolve(dist, "index.html"); }
    const file = await readFile(path);
    response.writeHead(200, { "Content-Type": `${mimeTypes[extname(path)] || "application/octet-stream"}; charset=utf-8`, "Cache-Control": path.endsWith("index.html") ? "no-cache" : "public, max-age=3600" });
    response.end(file);
  } catch (error) {
    if (error instanceof WorkspaceError) return json(response, { error: error.message }, error.status);
    if (error instanceof z.ZodError) return json(response, { error: error.issues.map(issue => issue.message).join(" ") }, 400);
    console.error(error instanceof Error ? error.message : "Local workspace error");
    return json(response, { error: "The local workspace could not save this change. Try again." }, 500);
  }
});
let vite: import("vite").ViteDevServer | undefined;
if (!production) {
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({ root, server: { middlewareMode: true, hmr: { server, host: "127.0.0.1", port } }, appType: "spa" });
}
server.listen(port, "127.0.0.1", () => console.log(`Forma is running locally at http://127.0.0.1:${port}\nFictional data · SQLite · no external connections`));
function shutdown() { server.close(() => { workspace.close(); void vite?.close().finally(() => process.exit(0)); if (!vite) process.exit(0); }); }
process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
