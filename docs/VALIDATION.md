# Validation evidence

## Portfolio migration — 2026-10-15

The project moved to `C:\Portfolio\forma-dashboard-template` and has its own Git repository. The portfolio build runs SQLite in the browser with IndexedDB persistence, sharing the native engine's transaction and validation code. All eight automated tests pass, including browser-compatible fixture creation and WASM SQLite serialization, inventory reversal, stale-edit rejection and history restoration. `pnpm build:demo` and TypeScript checking pass. Browser startup loads bundled assets with zero API requests and no resources outside the application's origin.

The source repository is `https://github.com/Icey11111/forma-dashboard-template`; source and deployment ignore rules exclude .local databases, environment files, installed dependencies, exports and generated builds. No client records or original application files were added. The Vercel project is connected to this independent repository.

## Original local validation — 2026-10-08

Verified locally on 2026-10-08. This is an independent demonstration template; every included record is fictional.

## Automated checks

- TypeScript checking and the production Vite build pass.
- All six database tests pass: synthetic fixtures and restart persistence; authoritative order totals and inventory reversal; transaction rollback and stale revisions; relationships, discounts, paused ordering and owner constraints; history restoration, media metadata and reset; paid revenue and cost reporting.
- Test databases are isolated temporary files. Tests never read another project's database.

## Browser checks

- All 13 navigation destinations rendered at 320px and 390px widths without document-level horizontal overflow. Tables retain their own horizontal scrolling for full record columns.
- Reviewed desktop, mobile, dark theme, a mobile record editor, and mobile Settings captures. A stable scrollbar gutter keeps full-page captures consistent with the browser layout.
- Created a fictional product through its editor, saved it, and verified that it survived a reload.
- Created a paid local order with two units; its total came from current product prices and stock decreased by two. Cancelling returned those units and produced history records.
- Published a fictional review-queue item and verified the queue updated.
- Used keyboard search to jump to a product editor.
- Reset through the Settings confirmation and verified the initial 12 products, 36 fictional contacts and 186 orders were restored.
- No browser errors or warnings were reported in the checked development and production previews.

## Local boundary checks

- The server listens on `127.0.0.1`. Its health endpoint reports local SQLite, synthetic data and zero service connections.
- An outside Origin and an unexpected Host both returned 403; form-style mutation returned 415; an invalid reset returned 400; an allowed local origin returned 200; an unknown API endpoint returned 404.
- The workspace snapshot was unchanged after those rejected requests.
- Browser resource inspection found no HTTP requests outside the local origin. Fonts and artwork load locally. The production connection policy permits only the same origin.
- The built application rendered successfully from the production server. Its temporary test server was stopped afterward; the development preview remains available while its process runs.
- The portfolio screenshot contains its local capture provenance. The shipping raster scan found no missing provenance.

## Finish review

The separate Impeccable finish reviewer returned **`disposition: ship`**, with no remaining material fixes. Current desktop, 390px and 320px captures preserve full panel edges and the fictional-data disclosure. Corrected light text pairs meet the checked 4.5:1 contrast threshold; revenue tooltip text uses the foreground color instead of pastel series colors.

## Portable source package

- Verified all 58 archive entries against the source file hashes. The archive contains no database, environment files, repository, installed dependencies, logs, exports or build output.
- Extracted a separate copy and installed its locked dependencies entirely offline from the existing public package cache; no packages were downloaded and dependency scripts were disabled for this check.
- The extracted copy passed TypeScript and the production build, then started successfully on a separate loopback port and created its own SQLite database.
- Its initial snapshot contained 12 products, 36 fictional contacts and 186 orders. Every sample email used `example.test`; browser resource inspection found no outside requests and no console errors or warnings.
- The temporary extracted-copy server was stopped after verification.

## Scope and limitations

This evidence covers the named flows and checks, not a formal accessibility certification or an exhaustive browser matrix. Payment, fulfillment, publishing and team roles are local simulations, described in the README. The build reports a non-failing warning about the main JavaScript chunk exceeding 500 kB; charts are separately loaded. Reuse copies should install their own dependencies and initialize their own database.
