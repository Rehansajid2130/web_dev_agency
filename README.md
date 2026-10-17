# bit3labs — Enterprise Systems Engineering Platform

A modern, high-performance web agency platform engineered for custom web applications, native mobile apps, and enterprise ERP systems.

Built on an unapologetic **Zero-Dependency Architecture**: pure semantic HTML5, modular CSS3 design tokens, and lightweight Vanilla JavaScript. No framework overhead, no build-step tax, and permanent client IP ownership.

---

## ⚡ 30-Second Developer Quickstart

### Prerequisites
- Node.js 18+ (for native `--watch` support)

### Run Locally
```bash
# 1. Clone repository
git clone https://github.com/bit3labs/agency-platform.git
cd agency-platform

# 2. Start local development server with auto-reload
npm run dev

# 3. Open in your browser
# Server listens on port 8190 by default
open http://127.0.0.1:8190
```

### Smoke Test All Routes
```bash
npm run smoke
```

---

## 🛠️ Developer Scripts

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | `node --watch server.js` | Starts server with native Node file watcher on port `8190` |
| `npm start` | `node server.js` | Production server startup |
| `npm run check` | HTTP healthcheck | Pings `http://127.0.0.1:8190` to verify server liveness |
| `npm run smoke` | Multi-route verification | Tests status codes (`200 OK`) across all 8 site routes |

To run on a custom port:
```bash
PORT=3000 npm run dev
```

---

## 📁 Repository Structure

```
├── server.js            # Hardened Node.js static server (path-traversal safe, security headers)
├── package.json         # Developer scripts and project metadata
├── README.md            # Developer handbook (this file)
├── CONTRIBUTING.md      # Code standards, contribution guide & QA checklist
├── DESIGN_SYSTEM.md     # Design tokens, color system, and typography specifications
│
├── index.html           # Main studio overview (Hero, capabilities, process, telemetry)
├── services.html        # Engineering disciplines & SaaS vs. bespoke comparison
├── process.html         # 5-stage architectural delivery lifecycle & interactive phase tabs
├── projects.html        # Production case studies with interactive category filtering
├── about.html           # Studio manifesto, engineering principles & track record
├── contact.html         # Multi-step architecture consultation wizard & intake
├── privacy.html         # GDPR / CCPA privacy policy & data retention governance
├── terms.html           # Terms of service, IP assignment clauses & liability caps
│
├── styles.css           # Core design tokens, global layout grids, utility classes
├── legal.css            # Scoped typography and styling for legal & compliance documents
├── contact.css          # Multi-step intake wizard & scope selector styles
├── process.css          # Asymmetric delivery flow & phase showcase styling
├── projects.css         # Portfolio showcase & case study modal dialog styles
├── about.css            # Studio manifesto and engineering principle card styles
│
├── main.js              # Global client orchestrator (SPA router, theme engine, modals)
└── js/                  # Modular client architecture with full JSDoc typing
    ├── theme.js         # Dark/light mode & 8-color dynamic palette dock engine
    ├── cursor.js        # High-performance Figma canvas pointer & card glow physics
    ├── telemetry.js     # Animated stats counter & live API stream simulation
    ├── router.js        # Client-side SPA / PJAX transition router with prefetching
    └── components.js    # Multi-step intake, filter logic & native dialog controllers
```

---

## 🎨 Design System & Theming Engine

All styling derives from centralized CSS custom properties in [`styles.css`](file:///c:/Users/lenovo/Desktop/agency/option2/styles.css) and specifications in [`DESIGN_SYSTEM.md`](file:///c:/Users/lenovo/Desktop/agency/option2/DESIGN_SYSTEM.md):

- **Theme Modes**: Supports `dark` and `light` with automatic OS `prefers-color-scheme` fallback.
- **Dynamic Palette Swatches**: 8 runtime-switchable brand accent palettes:
  - `violet` (Electric Violet — Default)
  - `black` (Stealth Onyx / Titanium)
  - `green` (Nordic Pine)
  - `emerald` (Obsidian Emerald)
  - `cyan` (Quantum Cyan)
  - `amber` (Solar Amber)
  - `rose` (Champagne Ruby)
  - `blue` (Royal Cobalt)
- **Fluid Layout**: Strict rem-based typography and clamp-based containers preventing rigid pixel breakpoints.

---

## 🔒 Security & Regulatory Compliance

This platform implements enterprise-grade technical safeguards:
- **GDPR Article 32 Containment**: [`server.js`](file:///c:/Users/lenovo/Desktop/agency/option2/server.js) enforces path normalization and containment (`safePath.startsWith(__dirname)`), actively mitigating directory traversal attacks.
- **HTTP Defensive Headers**: Automatically injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Accessibility**: Strict WCAG 2.1 / 2.2 Level AA compliance with `aria-describedby`, `aria-live="polite"`, and native `<dialog>` focus management.

---

## 🤝 Contributing

Read [`CONTRIBUTING.md`](file:///c:/Users/lenovo/Desktop/agency/option2/CONTRIBUTING.md) for our engineering standards, component conventions, and QA approval checklists.
