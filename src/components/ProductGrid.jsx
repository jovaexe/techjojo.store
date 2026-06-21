// src/components/ProductGrid.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import PriceSlider from "./filters/PriceSlider";

// ===== Helpers =====
function formatNaira(n) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₦${(n ?? 0).toLocaleString()}`;
  }
}

/** forgiving normalization for search */
function normalize(v) {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** canonicalizer for exact filter equality (ignores punctuation/spaces) */
function canon(v) {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

// --- Emoji spec helpers -------------------------------------------------
function findHeader(headers, candidates) {
  const lowers = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

function hasValue(v) {
  if (v == null) return false;
  const s = Array.isArray(v) ? v.join(", ") : String(v);
  return isMeaningful(cleanOne(s)) && s !== "-";
}

function specIconFor(header, value) {
  const h = header.toLowerCase();
  // prefer header-based mapping; fall back to value keywords if needed
  if (["display", "screen", "screen size", "panel"].some((k) => h.includes(k))) return "🖥";
  if (["cpu", "processor", "chip"].some((k) => h.includes(k))) return "⚙️";
  if (["ram", "memory"].some((k) => h.includes(k))) return "🧠";
  if (["storage", "ssd", "hdd", "drive", "disk"].some((k) => h.includes(k))) return "💾";
  if (["gpu", "graphics", "video"].some((k) => h.includes(k))) return "🎮";
  if (["keyboard"].some((k) => h.includes(k))) return "⌨";
  if (["cellular", "network", "sim", "esim", "carrier"].some((k) => h.includes(k))) return "📶";
  if (["ports"].some((k) => h.includes(k))) return "🔌";
  if (["connectivity", "wifi", "bluetooth"].some((k) => h.includes(k))) return "📶";
  if (["refresh", "hz", "response"].some((k) => h.includes(k))) return "🎮";
  if (["adjustments", "adjustment", "tilt", "swivel", "pivot", "height"].some((k) => h.includes(k))) return "🔧";
  if (["lock", "kensington", "security"].some((k) => h.includes(k))) return "🔒";
  if (["condition"].some((k) => h.includes(k))) return "📦";
  if (["battery", "battery health", "cycles"].some((k) => h.includes(k))) return "🔋";
  if (["bundle", "included", "extras"].some((k) => h.includes(k))) return "🎁";
  if (["delivery", "shipping"].some((k) => h.includes(k))) return "🚚";
  if (["referral"].some((k) => h.includes(k))) return "💰";

  // NEW: gaming accessories extras
  if (["special_features", "special features", "features"].some((k) => h.includes(k))) return "✨";
  if (["build", "build quality", "material"].some((k) => h.includes(k))) return "🛠";

  // value-based fallback hints
  const s = cleanOne(value).toLowerCase();
  if (s.includes("free shipping")) return "🚚";
  if (s.includes("backlit")) return "⌨";
  if (s.includes("wifi") || s.includes("bluetooth")) return "📶";
  return "•";
}

/** Build a curated, emoji-annotated list of spec lines in a nice order */
function buildEmojiSpecs(p, headers) {
  // Look up real header names from possible aliases in your CSV
  const H = {
    category: findHeader(headers, ["category", "type", "segment"]),
    display: findHeader(headers, ["display", "screen", "screen size", "panel", "display size"]),
    cpu: findHeader(headers, ["cpu", "processor", "chip", "processor model"]),
    ram: findHeader(headers, ["ram", "memory", "system memory"]),
    storage: findHeader(headers, ["storage", "ssd", "hdd", "drive", "disk"]),
    gpu: findHeader(headers, ["gpu", "graphics", "graphics card", "video"]),
    keyboard: findHeader(headers, ["keyboard", "backlit", "keyboard type"]),
    refresh: findHeader(headers, ["refresh rate", "hz", "response time"]),
    connectivity: findHeader(headers, ["connectivity", "wifi", "bluetooth"]),
    ports: findHeader(headers, ["ports", "port"]),
    adjustments: findHeader(headers, ["adjustments", "height", "tilt", "swivel", "pivot"]),
    security: findHeader(headers, ["security", "fingerprint", "tpm", "smart card", "camera shutter"]),
    lock: findHeader(headers, ["lock", "kensington lock", "kensington lock slot"]),
    condition: findHeader(headers, ["condition"]),
    battery: findHeader(headers, ["battery", "battery health", "battery capacity", "cycles"]),
    bundle: findHeader(headers, ["bundle", "included", "freebies", "extras"]),
    delivery: findHeader(headers, ["delivery", "shipping"]),
    referral: findHeader(headers, ["referral bonus", "referral"]),
    // NEW: gaming accessories
    special_features: findHeader(headers, ["special_features", "special features", "features"]),
    cellular: findHeader(headers, ["cellular", "network", "sim", "esim", "carrier"]),
    build: findHeader(headers, ["build", "build quality", "material"]),
  };

  const order = [
    "display",
    "cpu",
    "ram",
    "storage",
    "gpu",
    "keyboard",
    "connectivity",
    "ports",
    "refresh",
    // NEW: accessories-specific details
    "special_features",
    "cellular",
    "build",
    // misc
    "adjustments",
    "security",
    "lock",
    "battery",
    "condition",
    "bundle",
    "delivery",
    "referral",
  ];

  const lines = [];
  for (const key of order) {
    const header = H[key];
    if (!header) continue;
    let v = p[header];
    if (!hasValue(v)) continue;
    const val = Array.isArray(v) ? v.join(", ") : String(v);
    const icon = specIconFor(header, val);

    const label =
      key === "refresh" ? "Refresh Rate"
      : key === "lock" ? "Security"
      : key === "cpu" ? "Processor"
      : key === "ram" ? "RAM"
      : key === "gpu" ? "GPU"
      : key === "special_features" ? "Features"
      : key === "build" ? "Build"
      : header.charAt(0).toUpperCase() + header.slice(1);

    lines.push({ icon, label, text: val });
  }

  if (H.category && hasValue(p[H.category])) {
    const cat = String(p[H.category]);
    const catIcon = /monitor/i.test(cat)
      ? "🖥"
      : /desktop/i.test(cat)
      ? "🖥"
      : /laptop|notebook/i.test(cat)
      ? "💻"
      : /accessor/i.test(cat)
      ? "🖱️"
      : "🧩";
    lines.unshift({ icon: catIcon, label: cat, text: "" });
  }

  return lines;
}

// ================= APPLIANCE SPECS BUILDER =================
function buildApplianceSpecs(p, headers) {
  const H = {
    capacity: findHeader(headers, ["capacity", "size", "volume"]),
    power: findHeader(headers, ["power", "watt", "wattage", "hp"]),
    control: findHeader(headers, ["control_type", "control type", "controls"]),
    features: findHeader(headers, ["special_features", "special features", "features"]),
    build: findHeader(headers, ["build", "material", "body"]),
    condition: findHeader(headers, ["condition"]),
    delivery: findHeader(headers, ["delivery"]),
  };

  const order = [
    { key: "capacity", icon: "📦", label: "Capacity" },
    { key: "power", icon: "⚡", label: "Power" },
    { key: "control", icon: "🎛", label: "Controls" },
    { key: "features", icon: "✨", label: "Features" },
    { key: "build", icon: "🛠", label: "Build" },
    { key: "condition", icon: "📦", label: "Condition" },
    { key: "delivery", icon: "🚚", label: "Delivery" },
  ];

  const specs = [];

  for (const row of order) {
    const header = H[row.key];
    if (!header) continue;

    const raw = p[header];
    if (!hasValue(raw)) continue;

    specs.push({
      icon: row.icon,
      label: row.label,
      value: Array.isArray(raw) ? raw.join(", ") : String(raw),
    });
  }

  return specs;
}


// Shorten long appliance values for UI readability
function formatApplianceValue(value) {
  if (!value) return "";

  let text = String(value);

  // Remove bracketed explanations
  text = text.replace(/\(.*?\)/g, "").trim();

  // Split by commas and keep only first 3 parts
  const parts = text.split(",").map(p => p.trim());
  if (parts.length > 3) {
    return parts.slice(0, 3).join(", ") + "…";
  }

  // Hard length limit
  if (text.length > 80) {
    return text.slice(0, 80) + "…";
  }

  return text;
}



/* -------------------- CLEANING + CSV UTILITIES -------------------- */
const JUNK = new Set(["", "-", "—", "n/a", "na", "any", "null", "undefined"]);

function cleanOne(v) {
  if (v == null) return "";
  let s = String(v)
    // normalize smart quotes → straight quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }

  s = s.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();
  s = s.replace(/""/g, '"');
  return s;
}

function isMeaningful(s) {
  const k = String(s || "").toLowerCase();
  return !JUNK.has(k);
}

function uniqueCI(arr) {
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

// CSV line splitter that respects quotes (commas inside quotes won't split)
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/* -------------------- UI building blocks -------------------- */
function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-gray-200 shadow-sm " +
        "bg-white" +
        " dark:border-neutral-800 dark:!bg-neutral-900 " +
        className
      }
    >
      {children}
    </div>
  );
}

function ImgWithLoader({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  const safeSrc = !src ? "" : src;

  if (!safeSrc || gaveUp) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-neutral-800">
        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-neutral-800">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-neutral-700 dark:border-t-neutral-300" />
        </div>
      )}
      <img
        key={retryCount}
        src={retryCount > 0 ? `${safeSrc}${safeSrc.includes("?") ? "&" : "?"}retry=${retryCount}` : safeSrc}
        alt={alt}
        onLoad={() => { setLoaded(true); }}
        onError={() => {
          if (retryCount < 2) {
            setLoaded(false);
            setRetryCount(c => c + 1);
          } else {
            console.warn("Image failed after retries:", safeSrc);
            setGaveUp(true);
          }
        }}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />
    </div>
  );
}

function ImagePreview({ src, alt, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="relative max-h:[85vh] max-w-[92vw]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 rounded-full bg-white p-1 shadow dark:bg-neutral-900"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <img
          src={src}
          alt={alt || "Preview"}
          className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

/* -------------------- CSV loader hook (headers + rows) -------------------- */
function useProductsFromSheet(sheetCsvUrl) {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(!!sheetCsvUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sheetCsvUrl) return;
    let cancelled = false;

    const parseCSV = (csv) => {
      const lines = csv.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
      if (lines.length === 0) return { headers: [], rows: [] };

      const rawHeaders = splitCsvLine(lines[0]).map(h => cleanOne(h));
      const out = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]).map(c => cleanOne(c));
        const obj = {};
        rawHeaders.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));

        // normalize price to number when possible
        if ("price" in obj && obj.price !== "") {
          const n = Number(obj.price);
          obj.price = Number.isFinite(n) ? n : cleanOne(obj.price);
        }

        // normalize tags to array if present
        if (typeof obj.tags === "string" && obj.tags.length) {
          obj.tags = obj.tags
            .split(/[|,]/)
            .map(t => cleanOne(t))
            .filter(isMeaningful);
        }

        out.push(obj);
      }

      return { headers: rawHeaders, rows: out };
    };

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(sheetCsvUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        const text = await res.text();
        if (cancelled) return;
        const parsed = parseCSV(text);
        setHeaders(parsed.headers);
        setRows(parsed.rows);
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sheetCsvUrl]);

  return { headers, rows, loading, error };
}

/* -------------------- Price helpers -------------------- */
function parsePriceCell(input) {
  if (input == null) return NaN;
  if (typeof input === "number") return input;
  const s = String(input)
    .replace(/[₦,]/g, "")
    .replace(/\s+/g, " ")
    .replace(/ngn/i, "")
    .trim();
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
}

function isApplianceProduct(p, headers) {
  // Detect by existence of appliance-related fields (most reliable)
  const capacityHeader = findHeader(headers, ["capacity"]);
  const powerHeader = findHeader(headers, ["power", "watt", "wattage", "hp"]);
  const controlHeader = findHeader(headers, ["control_type", "control type", "controls"]);

  const hasCapacity = capacityHeader && hasValue(p[capacityHeader]);
  const hasPower = powerHeader && hasValue(p[powerHeader]);
  const hasControl = controlHeader && hasValue(p[controlHeader]);

  if (hasCapacity || hasPower || hasControl) return true;

  // Fallback: category-based detection (extra safety)
  const categoryHeader = findHeader(headers, ["category", "type"]);
  if (!categoryHeader) return false;

  const value = String(p[categoryHeader] || "").toLowerCase();

  return [
    "refrigerator",
    "freezer",
    "washing",
    "air conditioner",
    "microwave",
    "oven",
    "fan",
    "blender",
    "iron",
    "appliance",
  ].some((k) => value.includes(k));
}


/* -------------------- Main component -------------------- */
export default function ProductGrid({
  title = "Products",
  items = [],
  pageSize = 3,
  sheetCsvUrl,
  whatsAppNumber = "2348054717837",
  renderFilters,
}) {
  const {
    headers: csvHeaders,
    rows: csvRows,
    loading,
    error,
  } = useProductsFromSheet(sheetCsvUrl);

  const usingCsv = !!sheetCsvUrl;
  const activeRows = usingCsv ? csvRows : items;

  const headers = useMemo(() => {
    if (usingCsv) return csvHeaders || [];
    if (!activeRows || !activeRows.length) return [];
    return Object.keys(activeRows[0]);
  }, [usingCsv, csvHeaders, activeRows]);

  const [previewSrc, setPreviewSrc] = useState("");
  const [previewAlt, setPreviewAlt] = useState("");
  const closePreview = () => {
    setPreviewSrc("");
    setPreviewAlt("");
  };

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSizeSafe = Math.max(1, pageSize);
  const topRef = useRef(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [soldVersion, setSoldVersion] = useState(0);

  // Normalize each row & compute helpers
  const sourceItems = useMemo(() => {
    const result = (activeRows || []).map((row) => {
      const o = {};
      headers.forEach((h) => {
        let val = row[h];

        if (h.toLowerCase() === "price") {
          if (val === undefined || val === "") {
            o[h] = "-";
          } else {
            const n = Number(val);
            o[h] = Number.isFinite(n) ? n : cleanOne(val);
          }
        } else if (h.toLowerCase() === "tags") {
          if (Array.isArray(val)) {
            o[h] = val.filter(isMeaningful);
          } else if (typeof val === "string" && val.trim()) {
            o[h] = val.split(/[|,]/).map(t => cleanOne(t)).filter(isMeaningful);
          } else {
            o[h] = "-";
          }
        } else {
          const s = cleanOne(val);
          o[h] = s === "" ? "-" : s;
        }
      });

      const nameKey = headers.find((h) => h.toLowerCase() === "name") || null;
      const brandKey = headers.find((h) => h.toLowerCase() === "brand") || null;
      const imgKey =
        headers.find((h) => h.toLowerCase() === "img") ||
        headers.find((h) => h.toLowerCase() === "image") ||
        headers.find((h) => h.toLowerCase() === "imageurl") ||
        headers.find((h) => h.toLowerCase() === "image_url") ||
        null;

      o.__id = String(
        row.id ??
          row.ID ??
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`),
      );
      o.__name = nameKey ? String(o[nameKey]) : "-";
      o.__brand = brandKey ? String(o[brandKey]) : "-";
      o.__img = imgKey ? String(o[imgKey]) : "-";
      return o;
    });
    return result;
  }, [activeRows, headers]);

  // ——— Sold product tracking (stable key = name|brand) ———
  function stableKey(p) {
    return `${p.__name}|${p.__brand}`;
  }

  useEffect(() => {
    if (!sheetCsvUrl || !sourceItems.length || !headers.length) return;
    const sourceKey = sheetCsvUrl.replace(/[^a-zA-Z0-9]/g, "_");
    const backupKey = `tj_prod_${sourceKey}`;
    const soldKey = `tj_sold_${sourceKey}`;
    let backup = {};
    let sold = {};
    try { backup = JSON.parse(localStorage.getItem(backupKey) || "{}"); } catch {}
    try { sold = JSON.parse(localStorage.getItem(soldKey) || "{}"); } catch {}
    const currentKeys = new Set(sourceItems.map(p => stableKey(p)));
    let dirty = false;
    for (const p of sourceItems) {
      const key = stableKey(p);
      if (sold[key]) { delete sold[key]; dirty = true; }
    }
    for (const p of sourceItems) {
      const key = stableKey(p);
      if (!backup[key]) { backup[key] = p; dirty = true; }
    }
    for (const key of Object.keys(backup)) {
      if (!currentKeys.has(key) && !sold[key]) { sold[key] = { soldAt: Date.now() }; dirty = true; }
    }
    const TTL = 24 * 60 * 60 * 1000;
    const now = Date.now();
    for (const key of Object.keys(sold)) {
      if (now - sold[key].soldAt >= TTL) { delete sold[key]; delete backup[key]; dirty = true; }
    }
    if (dirty) {
      try { localStorage.setItem(backupKey, JSON.stringify(backup)); } catch {}
      try { localStorage.setItem(soldKey, JSON.stringify(sold)); } catch {}
      setSoldVersion(v => v + 1);
    }
  }, [sourceItems, headers, sheetCsvUrl]);

  const soldItems = useMemo(() => {
    if (!sheetCsvUrl || !headers.length) return [];
    const sourceKey = sheetCsvUrl.replace(/[^a-zA-Z0-9]/g, "_");
    const backupKey = `tj_prod_${sourceKey}`;
    const soldKey = `tj_sold_${sourceKey}`;
    let backup = {};
    let sold = {};
    try { backup = JSON.parse(localStorage.getItem(backupKey) || "{}"); } catch {}
    try { sold = JSON.parse(localStorage.getItem(soldKey) || "{}"); } catch {}
    const TTL = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const items = [];
    for (const [key, info] of Object.entries(sold)) {
      if (now - info.soldAt < TTL && backup[key]) items.push({ ...backup[key], __sold: true });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, sheetCsvUrl, soldVersion]);

  // Merge sold items into sourceItems for display
  const displayItems = useMemo(() => [...sourceItems, ...soldItems], [sourceItems, soldItems]);

  // Build facets dynamically from headers (skip private/display-only fields)
  const facets = useMemo(() => {
    const out = {};
    const skip = new Set(["id", "img", "image", "imageurl", "image_url", "price", "amount", "cost", "ngn", "price (ngn)"]);
    const keys = headers.filter((h) => !skip.has(h.toLowerCase()));

    const maps = Object.fromEntries(keys.map((k) => [k, new Map()]));
    for (const row of sourceItems) {
      for (const k of keys) {
        let v = row[k];
        if (Array.isArray(v)) v = v.join(", ");
        v = cleanOne(v);
        if (!isMeaningful(v) || v === "-") continue;
        const norm = normalize(String(v));
        const label = String(v);
        const hit = maps[k].get(norm);
        if (hit) hit.count += 1;
        else maps[k].set(norm, { label, count: 1 });
      }
    }

    for (const k of keys) {
      const arr = Array.from(maps[k].values())
        .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label)))
        .map((v) => String(v.label));
      out[k] = arr.length > 1 ? uniqueCI(arr) : [];
    }
    return out;
  }, [headers, sourceItems]);

  // Price range for slider
  const priceHeader = findHeader(headers, ["price", "amount", "cost", "ngn", "price (ngn)"]);
  const { priceMin, priceMax } = useMemo(() => {
    if (!priceHeader) return { priceMin: 0, priceMax: 1000000 };
    let min = Infinity, max = -Infinity;
    for (const row of sourceItems) {
      const p = parsePriceCell(row[priceHeader]);
      if (isFinite(p)) {
        if (p < min) min = p;
        if (p > max) max = p;
      }
    }
    return { priceMin: isFinite(min) ? min : 0, priceMax: isFinite(max) ? max : 1000000 };
  }, [sourceItems, priceHeader]);

  const [sliderMin, setSliderMin] = useState(priceMin);
  const [sliderMax, setSliderMax] = useState(priceMax);

  useEffect(() => {
    setSliderMin(priceMin);
    setSliderMax(priceMax);
  }, [priceMin, priceMax]);

  // Filters state mirrors headers (skip 'id', 'img')
  const [filters, setFilters] = useState({});
  useEffect(() => {
    const skip = new Set(["id", "img", "image", "imageurl", "image_url", "price", "amount", "cost", "ngn", "price (ngn)"]);
    setFilters((prev) => {
      const next = {};
      headers.forEach((h) => {
        if (!skip.has(h.toLowerCase())) next[h] = prev[h] ?? "";
      });
      return next;
    });
  }, [headers]);

  const onSpecChange = (key, value) =>
    setFilters((f) => ({ ...f, [key]: cleanOne(value) }));

  const clearSpecs = () => {
    setFilters((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => (next[k] = ""));
      return next;
    });
    setSliderMin(priceMin);
    setSliderMax(priceMax);
  };

  // Active filters count (include price slider)
  const activeFiltersCount = useMemo(() => {
    const headerCount = Object.entries(filters).filter(([k, v]) => {
      const c = cleanOne(v);
      return c && isMeaningful(c) && facets[k]?.length;
    }).length;
    const priceActive = (sliderMin !== priceMin || sliderMax !== priceMax) ? 1 : 0;
    return headerCount + priceActive;
  }, [filters, facets, sliderMin, sliderMax, priceMin, priceMax]);

  // Reset page when search/filters change
  useEffect(() => {
    setPage(1);
  }, [q, filters, sliderMin, sliderMax]);

  // search + filter (apply price range first)
  const filtered = useMemo(() => {
    const needle = normalize(q);

    const ph = findHeader(headers, ["price", "amount", "cost", "ngn", "price (ngn)"]);

    return displayItems.filter((row) => {
      // 1) price range slider
      if (ph && (sliderMin !== priceMin || sliderMax !== priceMax)) {
        const p = parsePriceCell(row[ph]);
        if (!(isFinite(p) && p >= sliderMin && p <= sliderMax)) return false;
      }

      // 2) search across all headers
      const hay = headers
        .map((h) => {
          const v = row[h];
          return Array.isArray(v) ? v.join(" ") : v === "-" ? "" : String(v);
        })
        .map(normalize)
        .join(" ");
      const searchMatch = !needle || hay.includes(needle);
      if (!searchMatch) return false;

      // 3) per-header facet filters (tolerant equality)
      const specsMatch = Object.entries(filters).every(([key, val]) => {
        const cval = cleanOne(val);
        if (!cval) return true;
        if (!facets[key]?.length) return true;
        let v = row[key];
        if (Array.isArray(v)) v = v.join(", ");
        return canon(cleanOne(v)) === canon(cval);
      });

      return specsMatch;
    });
  }, [displayItems, headers, q, filters, facets, sliderMin, sliderMax, priceMin, priceMax]);

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSizeSafe));
  const pageSafe = Math.min(page, pages);
  const start = (pageSafe - 1) * pageSizeSafe;
  const current = filtered.slice(start, start + pageSizeSafe);

  function scrollToTopOfProducts() {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function goto(p) {
    const next = Math.min(Math.max(1, p), pages);
    setPage(next);
    scrollToTopOfProducts();
  }
  function onSearchChange(e) {
    setQ(e.target.value);
  }

  // numbered pagination window (with ellipses)
  const pageItems = useMemo(() => {
    const items = [];
    const siblings = 2;
    const boundaries = 1;
    if (pages <= 1) return [1];

    const startPage = Math.max(
      boundaries + 1,
      Math.min(pageSafe - siblings, pages - boundaries - siblings * 2),
    );
    const endPage = Math.min(
      pages - boundaries,
      Math.max(pageSafe + siblings, boundaries + siblings * 2 + 1),
    );

    for (let i = 1; i <= Math.min(boundaries, pages); i++) items.push(i);
    if (startPage > boundaries + 1) items.push("…");
    for (let i = startPage; i <= endPage; i++) items.push(i);
    if (endPage < pages - boundaries) items.push("…");
    for (
      let i = Math.max(pages - boundaries + 1, boundaries + 1);
      i <= pages;
      i++
    )
      if (i >= 1) items.push(i);

    return items.filter(
      (v, i, arr) =>
        v === "…" ||
        (typeof v === "number" && v >= 1 && v <= pages && arr.indexOf(v) === i),
    );
  }, [pages, pageSafe]);

  const from = total ? start + 1 : 0;
  const to = start + current.length;
  const phoneDigitsOnly = whatsAppNumber.replace(/[^\d]/g, "");

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      {/* Image Preview Modal */}
      {previewSrc && (
        <ImagePreview
          src={previewSrc}
          alt={previewAlt}
          onClose={closePreview}
        />
      )}

      <section
        ref={topRef}
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-6"
      >
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900"
            >
              ← Home
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse through our catalogue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none sm:w-80">
              <input
                value={q}
                onChange={onSearchChange}
                placeholder='Search by any header e.g. "144Hz", "8GB", "Dell"…'
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition placeholder:text-gray-400 focus:border-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-neutral-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* NEW: Filters toggle + quick reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((s) => !s)}
                className="rounded-lg border px-3 py-2 text-xs transition hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                title="Show filters"
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] text-white dark:bg-neutral-200 dark:text-neutral-900">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {!filtersOpen && activeFiltersCount > 0 && (
                <button
                  onClick={clearSpecs}
                  className="rounded-md border px-2 py-2 text-[11px] text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}

            </div>
          </div>
        </header>

        {/* Pluggable filter panel — HIDDEN by default, toggled by button */}
        {filtersOpen &&
            (typeof renderFilters === "function" ? (
            renderFilters({
              headers,
              facets,
              filters,
              onChange: onSpecChange,
              clear: clearSpecs,
              // pass data for custom panels
              items: sourceItems,
              // price slider
              priceHeader,
              sliderMin, setSliderMin,
              sliderMax, setSliderMax,
              priceMin, priceMax,
              // extra helpers for custom panels
              onSpecChange,
              clearSpecs,
              activeFiltersCount,
              isOpen: filtersOpen,
              close: () => setFiltersOpen(false),
            })
          ) : (
            // Fallback generic filter UI
            <Card className="mb-4 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Filters
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>

              {priceHeader && priceMin < priceMax && (
                <div className="mt-3">
                  <PriceSlider
                    priceMin={priceMin}
                    priceMax={priceMax}
                    sliderMin={sliderMin}
                    sliderMax={sliderMax}
                    setSliderMin={setSliderMin}
                    setSliderMax={setSliderMax}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => { setSliderMin(priceMin); setSliderMax(priceMax); }}
                      className="rounded-md border px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                    >
                      Reset Price
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {headers
                  .filter(
                    (h) =>
                      !["id", "img", "image", "imageurl", "image_url", "price", "amount", "cost", "ngn"].includes(
                        h.toLowerCase(),
                      ),
                  )
                  .map((key) => (
                    <label key={key} className="flex flex-col gap-1 text-[11px]">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {key}
                      </span>
                      <select
                        value={filters[key] || ""}
                        onChange={(e) => onSpecChange(key, e.target.value)}
                        className="w-full rounded-md border bg-white px-3 py-1.5 text-xs outline-none ring-0 transition focus:border-gray-400 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:focus:border-neutral-500"
                      >
                        <option value="">Any</option>
                        {(facets[key] || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
              </div>

              {Object.values(filters).some(Boolean) && (
                <div className="mt-3">
                  <button
                    onClick={clearSpecs}
                    className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                  >
                    Reset
                  </button>
                </div>
              )}
            </Card>
          ))}

        {/* Products */}
        {sheetCsvUrl && loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            Loading products…
          </div>
        ) : error ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-red-600 dark:border-neutral-800 dark:bg-neutral-900">
            Error: {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {current.map((p) => (
              <Card
                key={p.__id}
                className="flex h-full flex-col overflow-hidden transition hover:shadow-lg"
              >
                <div className="relative w-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (!p.__img || p.__img === "-") return;
                      setPreviewSrc(p.__img);
                      setPreviewAlt(p.__name);
                    }}
                    className="block w-full cursor-zoom-in"
                    title="Click to preview"
                  >
                    <ImgWithLoader
                      src={p.__img !== "-" ? p.__img : ""}
                      alt={p.__name}
                    />
                  </button>
                  {p.__sold && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="-rotate-12 border-4 border-black px-6 py-3 font-['Montserrat'] text-2xl font-black tracking-[0.3em] text-black dark:border-white dark:text-white">
                        SOLD
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold">
                      {p.__name || "-"}
                    </h3>
                    {p.__brand && p.__brand !== "-" && (
                      <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-neutral-700 dark:text-gray-300">
                        {p.__brand}
                      </span>
                    )}
                  </div>

                  {/* Emoji spec list */}
             {/* Emoji spec list */}
<div className="flex-1 space-y-1 text-xs text-gray-700 dark:text-gray-300">

  {/* ✅ Appliance Section FIRST */}
  {isApplianceProduct(p, headers) &&
    buildApplianceSpecs(p, headers).length > 0 && (
      <div className="mb-2 rounded-lg p-2 dark:border-neutral-700">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Appliance Specs
        </div>

        <div className="space-y-1">
          {buildApplianceSpecs(p, headers).map((spec, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[12px]">
              <span aria-hidden>{spec.icon}</span>
              <span className="font-medium">{spec.label}:</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">{formatApplianceValue(spec.value)}</span>
            </div>
          ))}
        </div>
      </div>
  )}

  {/* 🔹 Normal Emoji Specs AFTER */}
  {buildEmojiSpecs(p, headers).map(({ icon, label, text }, i) => (
    <div key={i} className="flex items-start gap-1.5">
      <span className="shrink-0 leading-5" aria-hidden>{icon}</span>
      <div className="leading-5">
        {label}
        {text ? (
          <>
            {label.endsWith(":") ? " " : ": "}
            <span className="font-semibold text-gray-600 dark:text-gray-400">{text}</span>
          </>
        ) : null}
      </div>
    </div>
  ))}

</div>



                  {/* Bottom row: bold price + Message button with emojis */}
                  {(() => {
                    const priceKey = headers.find((h) => h.toLowerCase() === "price");
                    const raw = priceKey ? p[priceKey] : undefined;
                    const priceText =
                      typeof raw === "number"
                        ? formatNaira(raw)
                        : raw && raw !== "-"
                        ? String(raw)
                        : "Contact for price";

                    return (
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="text-sm font-bold">
                          <span aria-hidden>💰</span>{" "}
                          {priceText}
                        </div>

                        <a
                          href={waLinkForProduct(p, phoneDigitsOnly, headers)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                          title={`WhatsApp: ${whatsAppNumber}`}
                        >
                          <span aria-hidden className="mr-1">📩</span>
                          Message
                        </a>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing <b>{from}</b>–<b>{to}</b> of <b>{total}</b> item
            {total === 1 ? "" : "s"}
          </div>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => goto(pageSafe - 1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Previous"
            >
              ‹
            </button>

            {pageItems.map((it, idx) =>
              it === "…" ? (
                <span
                  key={`dots-${idx}`}
                  className="select-none px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => goto(it)}
                  aria-current={it === pageSafe ? "page" : undefined}
                  className={
                    "rounded-lg border px-3 py-1.5 text-xs transition " +
                    (it === pageSafe
                      ? "border-gray-900 bg-gray-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                      : "hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800")
                  }
                >
                  {it}
                </button>
              ),
            )}

            <button
              onClick={() => goto(pageSafe + 1)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Next"
            >
              ›
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}

// WhatsApp helpers (kept at bottom to avoid hoist noise)
function productToWhatsAppText(p, headers) {
  const lines = ["Hi! I'm interested in this product:"];
  headers
    .filter((h) => h.toLowerCase() !== "id")
    .forEach((h) => {
      const v = p[h];
      const out =
        v == null || v === ""
          ? "-"
          : Array.isArray(v)
          ? v.join(", ")
          : h.toLowerCase() === "price" && typeof v === "number"
          ? formatNaira(v)
          : String(v);
      lines.push(`• ${h}: ${out}`);
    });
  return encodeURIComponent(lines.join("\n"));
}
function waLinkForProduct(p, phoneDigitsOnly, headers) {
  return `https://wa.me/${phoneDigitsOnly}?text=${productToWhatsAppText(
    p,
    headers,
  )}`;
}
