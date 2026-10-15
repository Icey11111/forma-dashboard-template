# Forma — reusable operations workspace

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Independent React and TypeScript application, Tailwind CSS v4, shadcn Base UI primitives, Cult UI interactions, Vite, and a Node 24+ loopback server with built-in SQLite. The existing application's React/TypeScript/Tailwind foundation informs this stack; there are no imports from that application.

The portfolio deployment additionally uses sql.js SQLite in the browser and IndexedDB persistence. It shares domain transactions with the Node adapter. Source hosting is GitHub and static hosting is Vercel, explicitly authorized on 2026-10-15. The project now lives at `C:\Portfolio\forma-dashboard-template`.

## Users

Confirmed: the owner wants a reusable template for future projects and a portfolio piece. Confirmed focus: general business and store-management features. Inferred usage: desktop business administration, with responsive mobile access and a demonstrable workflow for portfolio visitors.

## Product Purpose

A working generic dashboard whose business and commerce operations can be explored and customized locally.

## Capabilities and Constraints

Preserve the source dashboard's feature categories: overview, orders, customers, catalog and inventory, merchandising, content, analytics, media, publishing, notifications, team and business settings, shipping, history, and health. Rebuild the implementation and branding. Every seed record is fabricated. Do not access or copy the source database, credentials, exports, customer data, or brand assets. GitHub source hosting and Vercel static deployment were explicitly authorized on 2026-10-15; other business service integrations remain disabled. The local server binds to 127.0.0.1 and keeps its database in .local. The hosted demo keeps SQLite bytes in each visitor's IndexedDB and sends no records to a backend. Bundle fonts, artwork and WASM with the application. No real login or messaging is needed for this demonstration.

## Product Principles

1. Every visible control performs an understandable local action.
2. Settings and data survive a restart; reset restores fictional fixtures.
3. Keep branding, fixtures, domain validation, persistence, and UI separately reusable.
4. Label demo data and simulated actions clearly.

## Accessibility & Inclusion

Keyboard-operable controls and overlays, visible focus, reduced motion, sufficient contrast, narrow-mobile navigation, and accessible chart summaries.
