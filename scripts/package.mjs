import { readFile, readdir, lstat, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json", "vite.config.ts", "components.json", "index.html", ".gitignore", ".vercelignore", "vercel.json", "README.md", "PRODUCT.md", "DESIGN.md", "THIRD-PARTY-NOTICES.md", "Start Forma.cmd"];
const directories = ["src", "shared", "server", "public", "tests", "docs", "scripts"];
async function collect(directory) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const name = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Package refuses symbolic link: ${name}`);
    if (entry.isDirectory()) await collect(name);
    else if (entry.isFile()) files.push(name);
  }
}
for (const directory of directories) await collect(directory);
try { await lstat(resolve(root, ".impeccable/design.json")); files.push(".impeccable/design.json"); } catch { /* Optional design sidecar. */ }
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) { let crc = i; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; table[i] = crc; }
function crc32(buffer) { let crc = 0xffffffff; for (const byte of buffer) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
const locals = [], central = []; let offset = 0;
const now = new Date(), dosTime = now.getHours() << 11 | now.getMinutes() << 5 | Math.floor(now.getSeconds() / 2), dosDate = now.getFullYear() - 1980 << 9 | now.getMonth() + 1 << 5 | now.getDate();
for (const file of [...new Set(files)].sort()) {
  const path = resolve(root, file);
  if (!path.startsWith(resolve(root) + sep) || relative(root, path).startsWith("..")) throw new Error("Package path escaped the template.");
  if ((await lstat(path)).isSymbolicLink()) throw new Error(`Package refuses symbolic link: ${file}`);
  const bytes = await readFile(path), compressed = deflateRawSync(bytes), name = Buffer.from(`forma-dashboard-template/${file}`, "utf8"), checksum = crc32(bytes);
  const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(8, 8); header.writeUInt16LE(dosTime, 10); header.writeUInt16LE(dosDate, 12); header.writeUInt32LE(checksum, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
  locals.push(header, name, compressed);
  const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x800, 8); entry.writeUInt16LE(8, 10); entry.writeUInt16LE(dosTime, 12); entry.writeUInt16LE(dosDate, 14); entry.writeUInt32LE(checksum, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(bytes.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
  central.push(entry, name); offset += header.length + name.length + compressed.length;
}
const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
const destination = resolve(root, "release/forma-dashboard-template-1.0.0.zip"); await mkdir(resolve(root, "release"), { recursive: true });
await writeFile(destination, Buffer.concat([...locals, directory, end]));
console.log(`Packaged ${files.length} source and documentation files.\n${destination}\nLocal databases, dependencies, exports, environment files, and build output excluded.`);
