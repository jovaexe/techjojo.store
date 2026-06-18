// src/components/filters/FiltersBase.jsx
import { useMemo, useState } from "react";
import SpecSelect from "./SpecSelect";

/* --------------------------- helpers --------------------------- */
function caseFindHeader(headers, candidates) {
  const lowers = headers.map((h) => String(h).toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

const JUNK = new Set(["", "-", "—", "n/a", "na", "any", "null", "undefined"]);

function cleanOne(v) {
  if (v == null) return "";
  let s = String(v)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();
  return s;
}
function isMeaningful(s) {
  const k = String(s || "").toLowerCase();
  return !JUNK.has(k);
}
function uniqueCaseInsensitive(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = String(x).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(x);
    }
  }
  return out;
}
function parsePrice(input) {
  if (input == null) return NaN;
  const s = String(input)
    .replace(/[₦,]/g, "")
    .replace(/\s+/g, " ")
    .replace(/ngn/i, "")
    .trim();
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
}

const STEP = 100_000;
const toK = (n) => `${Math.round(n / 1000)}K`;

/* ------------------------- component ------------------------- */
export default function FiltersBase({
  title = "Filters",
  headers = [],
  facets = {},
  filters = {},
  onChange = () => {},
  clear = () => {},
  keys = [],
  /** rows from CSV; used to build dynamic price buckets */
  items = [],
}) {
  const [open, setOpen] = useState(true);

  // Map config key -> actual CSV header (respecting aliases)
  const actualHeaderByConfigKey = useMemo(() => {
    const map = {};
    keys.forEach((entry) => {
      const cfg = typeof entry === "string" ? { key: entry } : entry;
      const { key, aliases = [] } = cfg;
      const actual = caseFindHeader(headers, [key, ...aliases]);
      if (actual) map[key] = actual;
    });
    return map;
  }, [headers, keys]);

  // Clean, deduped options from facets
  const optionsByHeader = useMemo(() => {
    const out = {};
    Object.values(actualHeaderByConfigKey).forEach((actual) => {
      const raw = facets?.[actual] || [];
      const cleaned = uniqueCaseInsensitive(
        raw.map(cleanOne).filter(isMeaningful)
      ).sort((a, b) => a.localeCompare(b));
      out[actual] = cleaned;
    });
    return out;
  }, [facets, actualHeaderByConfigKey]);

  // Detect Price header
  const priceHeader = useMemo(
    () => caseFindHeader(headers, ["Price", "Amount", "Cost", "NGN", "Price (NGN)"]),
    [headers]
  );

  // Build dynamic ₦100k buckets from items (min→max). If no data, fall back to 100–900K.
  const priceOptions = useMemo(() => {
    const opts = [];

    if (!items?.length || !priceHeader) {
      for (let s = 100_000; s < 900_000; s += STEP) {
        const e = s + STEP;
        const lbl = `${toK(s)}–${toK(e)}`;
        opts.push(lbl);
      }
      return opts;
    }

    const prices = [];
    for (const row of items) {
      const p = parsePrice(row?.[priceHeader]);
      if (isFinite(p)) prices.push(p);
    }
    if (!prices.length) {
      for (let s = 100_000; s < 900_000; s += STEP) {
        const e = s + STEP;
        opts.push(`${toK(s)}–${toK(e)}`);
      }
      return opts;
    }

    let min = Math.min(...prices);
    let max = Math.max(...prices);

    // Pad to STEP boundaries
    const start = Math.floor(min / STEP) * STEP;
    const end = Math.ceil(max / STEP) * STEP;

    for (let s = Math.max(0, start); s < end; s += STEP) {
      const e = s + STEP;
      const lbl = `${toK(s)}–${toK(e)}`;
      opts.push(lbl);
    }

    // Optional: only keep buckets that actually contain items
    // Count into buckets then filter empty ones
    const counts = new Map(opts.map((l) => [l, 0]));
    for (const p of prices) {
      const bucketStart = Math.floor((p - Math.max(0, start)) / STEP) * STEP + Math.max(0, start);
      const lbl = `${toK(bucketStart)}–${toK(bucketStart + STEP)}`;
      if (counts.has(lbl)) counts.set(lbl, (counts.get(lbl) || 0) + 1);
    }
    const withData = opts.filter((l) => (counts.get(l) || 0) > 0);
    return withData.length ? withData : opts;
  }, [items, priceHeader]);

  const priceValue = cleanOne(filters["price_range"] || "");

  // Count of active filters (CSV-backed + synthetic price_range)
  const activeCount = useMemo(() => {
    const baseCount = Object.entries(filters).filter(([k, v]) => {
      const cleaned = cleanOne(v);
      const hasOptions = (optionsByHeader[k] || []).length > 0;
      return cleaned && isMeaningful(cleaned) && hasOptions;
    }).length;

    const priceActive =
      cleanOne(filters["price_range"]) &&
      isMeaningful(cleanOne(filters["price_range"]))
        ? 1
        : 0;

    return baseCount + priceActive;
  }, [filters, optionsByHeader]);

  return (
    <div className="mb-4 rounded-2xl border bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        >
          <span className="font-semibold">{title}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
              {activeCount}
            </span>
          )}
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <button
          onClick={clear}
          className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
          title="Reset all filters"
        >
          Reset
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* ---- Price (dynamic ₦100K buckets) ---- */}
          <SpecSelect
            label="Price"
            value={priceValue}
            options={priceOptions /* array of strings like "300K–400K" */}
            onChange={(v) => onChange("price_range", v)}
          />

          {/* ---- CSV-backed filters ---- */}
          {keys.map((entry) => {
            const cfg = typeof entry === "string" ? { key: entry } : entry;
            const { key, label } = cfg;

            const actual = actualHeaderByConfigKey[key];
            const options = actual ? optionsByHeader[actual] || [] : [];

            const rawValue = actual ? filters[actual] : "";
            const safeValue = options.includes(cleanOne(rawValue))
              ? cleanOne(rawValue)
              : "";

            return (
              <SpecSelect
                key={key}
                label={label || key}
                value={safeValue}
                options={options}
                onChange={(v) => actual && onChange(actual, v)}
                disabled={!actual || options.length === 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
