import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createWorkspaceDatabase } from "../shared/database";

export { WorkspaceError } from "../shared/database";

export function openWorkspaceDatabase(path: string, now = new Date()) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  return createWorkspaceDatabase(new DatabaseSync(path), now);
}
