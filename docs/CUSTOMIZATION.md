# Reusable boundaries

| File or folder | Responsibility |
| --- | --- |
| `src/lib/brand.ts` | Template identity and version |
| `src/styles.css` | Semantic tokens, dark/accent themes, type, layout, density and responsive rules |
| `src/App.tsx` | Navigation, hash routing, search, theme, guide and application shell |
| `src/pages/commerce.tsx` | Product, order, customer and promotion workflows |
| `src/pages/workspace.tsx` | Content, media, publishing, history, notifications, settings and health |
| `src/pages/reports.tsx` | Overview and analytics compositions |
| `src/components/` | Reusable table, editor, confirmation, field, chart and display components |
| `src/components/ui/` | Public shadcn and Cult UI source primitives |
| `src/lib/workspace.tsx` | Local API adapter, global feedback and file exports |
| `src/lib/metrics.ts` | Reporting formulas and date/currency formatting |
| `shared/schema.ts` | Shared domain types and server validation |
| `shared/seed.ts` | Authored fictional fixtures and original geometric/typographic demo artwork |
| `shared/database.ts` | Shared SQLite transactions, domain validation, inventory, audit and revision restoration |
| `shared/sqljs.ts` | Browser SQLite statement adapter |
| `server/database.ts` | Native Node SQLite opener and local file initialization |
| `src/lib/browser-workspace.ts` | Private browser SQLite, IndexedDB persistence and Web Locks in portfolio mode |
| `server/index.ts` | Loopback-only HTTP service, request checks, static serving and dev middleware |
| `scripts/package.mjs` | Portable allowlisted ZIP creator |
| `vercel.json` / `.vercelignore` | Static portfolio build, browser policy and source upload exclusions |

Add a field by extending its schema, its fixture, and its editor. Server validation is the authority; table labels are presentation. Keep historical line prices in orders so future product edits do not change older orders.

Copies are independent. Keep `.local`, dependencies, exports, and build output out of a reusable source package. The seed imports no business files, environment files, credentials, or other database.

The project registers `@cult-ui` in `components.json`. It uses React 19, TypeScript and Tailwind v4 with Base UI foundations. Install only the UI features a future version needs; Anime.js and Three.js are not required by this dashboard.

Built-in SVG artwork is authored trusted source. New uploads accept PNG/JPEG/WebP only and verify file signatures. Use the media editor to give each image useful alternative text, and assign it from a product's editor.
