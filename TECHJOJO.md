# techjojo.store — Architecture & Reference

## Overview
E-commerce site for gadgets in Lagos, Nigeria. React SPA with client-side routing, powered by Google Sheets CSV as a data source. Deploys on Vercel from `main` branch.

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | React 19, Vite 7 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS 3, dark mode via class |
| Fonts | Orbitron (titles), Rajdhani, Exo 2, JetBrains Mono |
| Analytics | @vercel/analytics |
| UI primitives | Radix Dialog, DropdownMenu, Toast, Label, Slot |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge, class-variance-authority |
| Dev | Prettier + Tailwind plugin |
| Build | `npm run dev` (dev), `npm run build` (prod), `npm run preview` (preview build) |

## Data Sources
8 Google Sheets CSV endpoints (public, read-only) defined in `src/lib/productCache.js`:

| Category | Route |
|----------|-------|
| Business Laptops | /businesslaptops |
| Gaming Laptops | /gaminglaptops |
| Macbooks | /macbooks |
| Desktops | /desktops |
| Smartphones | /smartphones |
| Monitors | /monitors |
| Tech Accessories | /techaccessories |
| Home Appliances | /homeappliances |

Additional endpoints for GPU/CPU product data are used by the search page.

## Routing (`src/App.jsx`)
All routes render a `<ProductGrid>` component with a `title` and `sheetCsvUrl` prop (or search-specific logic):
- `/` → Home (banner tiles, no ProductGrid)
- `/search` → SearchPage (custom search + ProductGrid-like rendering)
- `/{category}` → Category page → ProductGrid
- `*` → 404 page

`<Navbar>` and `<Footer>` are persistent across all pages. `preloadAllProducts()` fires on mount for instant category navigation.

## Component Architecture

### Navbar (`src/components/Navbar.jsx`)
- **Logo**: auto-switches between light/dark variants based on theme
- **Search bar**: animated expand/contract on focus. Mobile: full-width below nav with hamburger.
- **Hamburger menu** (mobile): fixed to top-left, opens a side drawer (`createPortal` to `document.body`) with backdrop + slide animation. Drawer has fade in/out + slide in/out keyframe animations.
- **Search suggestions** dropdown: built from cached product data. Scores: starts-with=100, contains=60, brand/source=30. Broad terms (categories, brands, GPUs, CPUs) added with score 85. Renders in a portal to `document.body`. Keyboard navigation (arrow keys, Enter, Escape). Closes on outside click and scroll.
- **Theme toggle**: sun/moon icon, toggles dark mode via `ThemeContext`.
- **Search navigation**: `searchQuery(q, pin)` generates `/search?q=...&pin=...`.

### ProductGrid (`src/components/ProductGrid.jsx`)
The main product listing component used by every category page.

#### Props
- `sheetCsvUrl`: Google Sheets CSV URL
- `title`: display name (used for category icon, page title)
- `category`: category string for icon mapping
- `loading`: external loading state override
- `showSoldToggle` / `soldToggleOverride`: optional sold visibility controls

#### Data Flow
1. `useProductsFromSheet(sheetCsvUrl)` hook fetches/returns cached CSV data
2. Products are cleaned (fingerprint `__fp` assigned, `__name`, `__brand`, `__img`, `__id`, `__index`)
3. Sold tracking runs, merges sold items
4. Display items sorted by price then original index
5. Facet filters built dynamically from headers
6. Paginated and rendered as a responsive grid

### Search Page (`src/pages/search.jsx`)
- Reads `?q=` and `?pin=` from URL
- `expandQuery(q)` applies pattern rules for generational terms
- Field-aware scoring: name (10), brand (6), category (10), specs (8)
- Whole-word spec matching prevents partial matches
- Spec coherence bonus (+25) for multiple hits in same spec field
- `allCore` bonus (+20) when all query words hit core fields
- Phrase match bonus (+15), name-starts-with bonus (+25)
- Pin system: `source|||name|||brand` natural key. Pinned product rendered in "Exact Match" box above results with scroll-to-product (`?p=` param) with lime highlight.
- Fallback: when spec constraints kill all results, retries with original query words
- Sidebar: facet filters, price slider, sold toggle

### Footer (`src/components/Footer.jsx`)
- Category links, WhatsApp contact number
- Dark/light mode styling

### Theme (`src/context/ThemeContext.jsx`)
- `ThemeProvider` wraps app
- Stores `'light'` or `'dark'` in localStorage key `"theme"`
- Initial: system preference via `prefers-color-scheme`, falls back to `light`
- Toggles `.dark` class on `<html>`, sets `data-theme` attribute
- Dark mode: pure black backgrounds (`bg-black`) site-wide, navbar `dark:bg-black/70 dark:backdrop-blur-xl`

### Global Product Cache (`src/lib/productCache.js`)
- Preloads all 8 CSV sheets on app mount
- Stores in memory (`cache` variable) and localStorage (`"tj_product_cache"`)
- Silent background refresh: returns cached data instantly, then refetches
- `getCachedSource(name)` / `getCachedProducts()` / `getCacheVersion()` / `isLoading()` / `onReady(fn)`
- Cache version bumps on refresh to trigger reactivity in components

### Filters (`src/components/filters/`)
Each category has a dedicated filter component:
- `FiltersBase.jsx` — shared base with accordion-style collapsible sections
- `SpecSelect.jsx` — reusable spec dropdown/checkbox
- `PriceSlider.jsx` — custom dual-thumb range slider with live editable inputs
- Individual category filters: `BusinessLaptopFilters`, `GamingLaptopFilter`, `DesktopFilters`, `Macbookfilter`, `MonitorFilters`, `SmartphoneFilters`, `TechaccessoriesFilter`, `GamingAccessoriesFilters`, `HomeAppliancesFilter`

Filter ordering matches spec listing order in the spreadsheet. CPU headers are labeled as "Processor" in all filters via `labelize()`.

## Sold Tracking System

### Architecture
LocalStorage-based system that tracks when products disappear from the spreadsheet (assumed sold).

### Keys
- `tj_prod_<sourceKey>` — backup snapshot of all products ever seen
- `tj_sold_<sourceKey>` — sold markers: `{ "<fingerprint>": { "soldAt": <epoch_ms> } }`
- `<sourceKey>` = `sheetCsvUrl.replace(/[^a-zA-Z0-9]/g, "_") + "_v7"`

### Content Fingerprint (`__fp`)
All columns except `id`/`img`/`image`/`imageurl`/`image_url` joined with `|||`. This uniquely identifies a product's content.

### Edit Detection (Fingerprint Migration)
When a product's fingerprint disappears but the product hasn't actually sold (it was edited):
1. Match by `__name|||__brand` to current products
2. Fallback: match by `__img` URL to current products
3. If matched: migrate the backup key to the new fingerprint
4. If unmatched: mark as sold

### 24-Hour Expiry
- `TTL = 24 * 60 * 60 * 1000` ms
- Runs inside a `useMemo` in ProductGrid (triggered by `[sourceItems, headers, sheetCsvUrl]`)
- Expired sold entries AND their backup entries are deleted from localStorage
- This prevents the "mark missing" loop from re-marking the product on the next render

### Key Fix (2025-07-09)
**Bug**: Expired sold entries were cleaned but backup entries remained, causing the "mark missing" loop to re-mark products as sold on the next render.
**Fix**: Added `delete backup[k]` alongside `delete sold[k]` in the TTL cleanup loop.

### Sold Display
- Sold items are appended to the end of the product list with a "SOLD" badge overlay (rotated, bordered)
- Merged into display items, sorted by price then original index
- Search page: sold items toggled via `showSold` state, deduplicated by `name|brand`

## Search System

### Query Expansion (`expandQuery()`)
Pattern-based rules that add related terms to search queries:
- **Gen detection**: `"10th gen"` or `"10-gen"` → adds CPU model tokens
- **Series detection**: `"30 series"` or `"30-series"` → adds GPU series tokens
- **GPU model**: `"rtx 3060"`, `"gtx 1660"`, `"radeon"` → adds GPU tokens
- **Bare GPU number**: `"3060"` → adds to spec field
- **CPU models**: `"i5"`, `"core i5"` → adds CPU tokens
- **AMD**: `"ryzen 5"`, `"rx 580"` → adds CPU/GPU tokens
- **Bare CPU prefix**: `"i7"` → adds to spec field

### Scoring
- name: 10, brand: 6, category: 10, specs: 8
- All-core bonus: +20 when every word hits name/brand/category
- Phrase bonus: +15 for exact name match
- Name-starts-with: +25
- Spec coherence: +25 when multiple words hit the same spec field

### Pin System
Natural key format: `source|||name|||brand`. Placed in URL via `&pin=`. Search page extracts, normalizes, and matches by this key. Pinned product rendered with "Exact Match" header. "View in {category}" link scrolls to product with lime-green highlight animation (`?p=` param, 2.5s timeout).

## Category Pages
Each category page passes `title` and `sheetCsvUrl` to `<ProductGrid>`. Uses `useProductsFromSheet` which checks `getCachedSource()` for instant loading. Category icons mapped in `CATEGORY_ICONS` in ProductGrid.

## Deployed Features
- WhatsApp message replaces image URL with product link
- Copy link button on product cards (short URL + toast)
- Scroll-to-product via `?p=` param with lime highlight
- Price slider (custom dual-thumb) with live editable inputs
- Sold toggle in search sidebar
- Mobile responsive: hamburger, full-width search, slide-in drawer

## Reverted Experiments
- **Framer-motion**: removed, used CSS animations instead
- **Warm theme variant**: removed, kept pure dark mode

## GitHub
- URL: https://github.com/jovaexe/techjojo.store.git
- Default branch: `main`
- Vercel auto-deploys from `main`
