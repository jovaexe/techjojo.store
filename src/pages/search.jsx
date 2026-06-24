import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCachedProducts, onReady, CSV_URLS } from "../lib/productCache";

// Emoji spec helpers (mirrors ProductGrid)
const JUNK = new Set(["", "-", "—", "n/a", "na", "any", "null", "undefined"]);

function cleanOne(v) {
  if (v == null) return "";
  let s = String(v).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1).trim();
  s = s.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim().replace(/""/g, '"');
  return s;
}

function isMeaningful(s) {
  return !JUNK.has(String(s || "").toLowerCase());
}

function hasValue(v) {
  if (v == null) return false;
  const s = Array.isArray(v) ? v.join(", ") : String(v);
  return isMeaningful(cleanOne(s)) && s !== "-";
}

function findHeader(headers, candidates) {
  const lowers = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

function specIconFor(header, value) {
  const h = header.toLowerCase();
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
  if (["special_features", "special features", "features"].some((k) => h.includes(k))) return "✨";
  if (["build", "build quality", "material"].some((k) => h.includes(k))) return "🛠";
  const s = cleanOne(value).toLowerCase();
  if (s.includes("free shipping")) return "🚚";
  if (s.includes("backlit")) return "⌨";
  if (s.includes("wifi") || s.includes("bluetooth")) return "📶";
  return "•";
}

function buildEmojiSpecs(p, headers) {
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
    special_features: findHeader(headers, ["special_features", "special features", "features"]),
    cellular: findHeader(headers, ["cellular", "network", "sim", "esim", "carrier"]),
    build: findHeader(headers, ["build", "build quality", "material"]),
  };
  const order = ["display", "cpu", "ram", "storage", "gpu", "keyboard", "connectivity", "ports", "refresh", "special_features", "cellular", "build", "adjustments", "security", "lock", "battery", "condition", "bundle", "delivery", "referral"];
  const lines = [];
  for (const key of order) {
    const header = H[key];
    if (!header) continue;
    let v = p[header];
    if (!hasValue(v)) continue;
    const val = Array.isArray(v) ? v.join(", ") : String(v);
    const icon = specIconFor(header, val);
    const label = key === "refresh" ? "Refresh Rate" : key === "lock" ? "Security" : key === "cpu" ? "Processor" : key === "ram" ? "RAM" : key === "gpu" ? "GPU" : key === "special_features" ? "Features" : key === "build" ? "Build" : header.charAt(0).toUpperCase() + header.slice(1);
    lines.push({ icon, label, text: val });
  }
  if (H.category && hasValue(p[H.category])) {
    const cat = String(p[H.category]);
    const catIcon = /monitor/i.test(cat) ? "🖥" : /desktop/i.test(cat) ? "🖥" : /laptop|notebook/i.test(cat) ? "💻" : /accessor/i.test(cat) ? "🖱️" : "🧩";
    lines.unshift({ icon: catIcon, label: cat, text: "" });
  }
  return lines;
}

function isApplianceProduct(p, headers) {
  const capacityHeader = findHeader(headers, ["capacity"]);
  const powerHeader = findHeader(headers, ["power", "watt", "wattage", "hp"]);
  const controlHeader = findHeader(headers, ["control_type", "control type", "controls"]);
  const hasCapacity = capacityHeader && hasValue(p[capacityHeader]);
  const hasPower = powerHeader && hasValue(p[powerHeader]);
  const hasControl = controlHeader && hasValue(p[controlHeader]);
  if (hasCapacity || hasPower || hasControl) return true;
  const categoryHeader = findHeader(headers, ["category", "type"]);
  if (!categoryHeader) return false;
  const value = String(p[categoryHeader] || "").toLowerCase();
  return ["refrigerator", "freezer", "washing", "air conditioner", "microwave", "oven", "fan", "blender", "iron", "appliance"].some((k) => value.includes(k));
}

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
    specs.push({ icon: row.icon, label: row.label, value: Array.isArray(raw) ? raw.join(", ") : String(raw) });
  }
  return specs;
}

function formatApplianceValue(value) {
  if (!value) return "";
  let text = String(value).replace(/\(.*?\)/g, "").trim();
  const parts = text.split(",").map(p => p.trim());
  if (parts.length > 3) return parts.slice(0, 3).join(", ") + "…";
  if (text.length > 80) return text.slice(0, 80) + "…";
  return text;
}

function formatNaira(n) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₦${(n ?? 0).toLocaleString()}`;
  }
}

function normalize(v) {
  return String(v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function ImgWithLoader({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  const safeSrc = !src ? "" : src;

  if (!safeSrc || gaveUp) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-neutral-800">
        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
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
      <img key={retryCount}
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
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`} loading="lazy" />
    </div>
  );
}

function ImagePreview({ src, alt, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="relative max-h:[85vh] max-w-[92vw]" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -right-3 -top-3 rounded-full bg-white p-1 shadow dark:bg-neutral-900" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
        <img src={src} alt={alt || "Preview"} className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl" />
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={"rounded-2xl border border-gray-200 shadow-sm bg-white dark:border-neutral-800 dark:bg-neutral-900 " + className}>
      {children}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [allProducts, setAllProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewAlt, setPreviewAlt] = useState("");
  const [showSold, setShowSold] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSource, setFilterSource] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [filterCondition, setFilterCondition] = useState(null);
  const [filterSpecs, setFilterSpecs] = useState({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const closePreview = () => { setPreviewSrc(""); setPreviewAlt(""); };
  const [toastState, setToastState] = useState(null);

  function shortId(fp) {
    let hash = 0;
    for (let i = 0; i < fp.length; i++) { hash = ((hash << 5) - hash) + fp.charCodeAt(i); hash |= 0; }
    return "p" + Math.abs(hash).toString(36);
  }

  function productFp(p) {
    const skip = new Set(["id", "img", "image", "imageurl", "image_url"]);
    return p._headers.filter(h => !skip.has(h.toLowerCase())).map(h => {
      const v = p._raw[h];
      if (h.toLowerCase() === "price" && typeof v === "number") return String(v);
      const s = cleanOne(v);
      return s === "" ? "-" : s;
    }).join("|||");
  }

  useEffect(() => {
    if (getCachedProducts()) {
      setAllProducts(getCachedProducts().flatMap(g => g.rows));
      setReady(true);
    } else {
      onReady(() => {
        const data = getCachedProducts();
        if (data) setAllProducts(data.flatMap(g => g.rows));
        setReady(true);
      });
    }
  }, []);

  // Load sold items from localStorage
  const soldPool = useMemo(() => {
    if (!showSold) return [];
    const items = [];
    const now = Date.now();
    const TTL = 24 * 60 * 60 * 1000;
    for (const { name, url } of CSV_URLS) {
      const sourceKey = url.replace(/[^a-zA-Z0-9]/g, "_") + "_v5";
      let backup = {}, sold = {};
      try { backup = JSON.parse(localStorage.getItem(`tj_prod_${sourceKey}`) || "{}"); } catch {}
      try { sold = JSON.parse(localStorage.getItem(`tj_sold_${sourceKey}`) || "{}"); } catch {}
      for (const [fp, info] of Object.entries(sold)) {
        if (now - info.soldAt < TTL && backup[fp]) {
          const b = backup[fp];
          const headers = Object.keys(b).filter(k => !k.startsWith("__"));
          const priceKey = headers.find(h => h.toLowerCase() === "price");
          const nameKey = headers.find(h => h.toLowerCase() === "name");
          const brandKey = headers.find(h => h.toLowerCase() === "brand");
          const imgKey = headers.find(h => ["img", "image", "imageurl", "image_url"].includes(h.toLowerCase()));
          items.push({
            _raw: b,
            _headers: headers,
            _name: nameKey ? String(b[nameKey]) : b.__name || "-",
            _brand: brandKey ? String(b[brandKey]) : b.__brand || "-",
            _img: imgKey ? String(b[imgKey]) : b.__img || "-",
            _price: priceKey ? b[priceKey] : "-",
            _source: name,
            __sold: true,
          });
        }
      }
    }
    return items;
  }, [showSold]);

  useEffect(() => {
    if (!toastState) return;
    if (toastState === "entering") {
      const t = setTimeout(() => setToastState("visible"), 10);
      return () => clearTimeout(t);
    }
    if (toastState === "closing") {
      const r = setTimeout(() => setToastState(null), 300);
      return () => clearTimeout(r);
    }
    const t = setTimeout(() => setToastState("closing"), 1700);
    return () => clearTimeout(t);
  }, [toastState]);

  function catPath(source) {
    return "/" + source.toLowerCase().replace(/\s+/g, "");
  }

  function cap(s) { return s.replace(/\b[a-z]/g, c => c.toUpperCase()); }
  function labelize(h) {
    const map = { cpu: "Processor", ram: "RAM", gpu: "GPU", ssd: "Storage", hdd: "Storage", display: "Display", screen: "Display", wifi: "Connectivity", bluetooth: "Connectivity" };
    return map[h.toLowerCase()] || cap(h);
  }

  // ─── Query expansion: translate human terms into structured constraints ───
  const PATTERN_RULES = [
    {
      // "10th gen", "8th gen", "12th gen" etc.
      regex: /^(\d+)(?:st|nd|rd|th)\s*gen(?:eration)?$/i,
      expand(match) {
        const gen = parseInt(match[1]);
        return { removes: match[0], adds: { field: "cpu", pattern: new RegExp(`-${gen}\\d{2,}`, "i") } };
      }
    },
    {
      // "30 series", "40 series", "20 series"
      regex: /^([1-9]\d?)0\s*series$/i,
      expand(match) {
        const family = match[1];
        return { removes: match[0], adds: { field: "gpu", pattern: new RegExp(`${family}0[5-9]0`, "i") } };
      }
    },
  ];

  const TERM_ALIASES = {
    desktop: "desktops", mac: "macbooks", macbook: "macbooks",
    phone: "smartphones", mobile: "smartphones", monitor: "monitors",
    accessory: "accessories", tech: "accessories",
  };

  const SPEC_HEADER_ALIASES = {
    cpu: ["cpu", "processor", "chip", "processor model"],
    gpu: ["gpu", "graphics", "graphics card", "video"],
    ram: ["ram", "memory", "system memory"],
    storage: ["storage", "ssd", "hdd", "drive", "disk"],
    display: ["display", "screen", "screen size", "panel"],
  };

  function findHeader(headers, candidates) {
    const lowers = headers.map(h => h.toLowerCase());
    for (const c of candidates) {
      const i = lowers.indexOf(String(c).toLowerCase());
      if (i !== -1) return headers[i];
    }
    return null;
  }

  function expandQuery(rawQuery) {
    const normalized = rawQuery.toLowerCase().trim();
    let tokens = normalized.split(/\s+/).filter(Boolean);
    const specConstraints = [];

    // Apply alias substitutions
    tokens = tokens.map(t => TERM_ALIASES[t] ?? t);

    // Apply pattern rules on consecutive token windows
    const expandedTokens = [];
    let i = 0;
    while (i < tokens.length) {
      let matched = false;
      for (const windowSize of [3, 2, 1]) {
        const phrase = tokens.slice(i, i + windowSize).join(" ");
        for (const rule of PATTERN_RULES) {
          const m = phrase.match(rule.regex);
          if (m) {
            const result = rule.expand(m);
            if (result.adds) specConstraints.push(result.adds);
            i += windowSize;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      if (!matched) { expandedTokens.push(tokens[i]); i++; }
    }

    return { coreTerms: expandedTokens, specConstraints };
  }

  function productMatchesSpecConstraints(p, specConstraints) {
    for (const constraint of specConstraints) {
      const header = findHeader(p._headers, SPEC_HEADER_ALIASES[constraint.field] || [constraint.field]);
      if (!header) return false;
      const rawValue = String(p._raw[header] ?? "");
      if (constraint.pattern) {
        if (!constraint.pattern.test(rawValue)) return false;
      } else {
        const ok = constraint.matchesAny.some(term => rawValue.toLowerCase().includes(term));
        if (!ok) return false;
      }
    }
    return true;
  }

  const allProductsWithSold = useMemo(() => {
    if (!showSold || !soldPool.length) return allProducts;
    const soldNames = new Set(soldPool.map(p => `${p._name}|${p._brand}`));
    const filtered = allProducts.filter(p => !soldNames.has(`${p._name}|${p._brand}`));
    return [...filtered, ...soldPool];
  }, [allProducts, soldPool, showSold]);

  const { filtered, isFallback } = useMemo(() => {
    if (!allProductsWithSold.length) return { filtered: [], isFallback: false };
    if (!query && !showSold) return { filtered: [], isFallback: false };

    const needle = normalize(query);
    const words = needle ? needle.split(/\s+/).filter(Boolean) : [];

    // Apply query expansion
    const { coreTerms, specConstraints } = expandQuery(query);
    const expandedNeedle = coreTerms.join(" ");

    // Determine which core terms are "meaningful"
    const meaningfulWords = new Set(coreTerms);
    if (coreTerms.length > 1) {
      for (const w of coreTerms) {
        let found = false;
        for (const p of allProductsWithSold) {
          const nameF = normalize(p._name);
          const brandF = normalize(p._brand);
          if (nameF.includes(w) || brandF.includes(w)) { found = true; break; }
        }
        if (!found) meaningfulWords.delete(w);
      }
    }

    const skipSpecs = new Set(["id", "img", "image", "imageurl", "image_url", "name", "brand", "price", "amount", "cost", "ngn"]);
    const FIELD_W = { name: 10, brand: 6, category: 4, specs: 0.3 };

    const results = [];
    for (const p of allProductsWithSold) {
      // Expand query applies spec constraints BEFORE scoring
      if (!productMatchesSpecConstraints(p, specConstraints)) continue;

      if (!coreTerms.length) { results.push({ product: p, score: 0, isExact: true }); continue; }

      const nameF  = normalize(p._name);
      const brandF = normalize(p._brand);
      const catF   = normalize(p._source);
      const specF  = normalize(p._headers.filter(h => !skipSpecs.has(h.toLowerCase())).map(h => String(p._raw[h] ?? "")).join(" "));

      let allCore = true;
      let total = 0;

      for (const w of coreTerms) {
        const nameHit  = nameF.includes(w);
        const brandHit = brandF.includes(w);
        const catHit   = catF.includes(w);
        const specHit  = specF.includes(w);
        const coreHit  = nameHit || brandHit || catHit;

        if (meaningfulWords.has(w) && !coreHit) allCore = false;

        if (nameHit)  total += FIELD_W.name;
        if (brandHit) total += FIELD_W.brand;
        if (catHit)   total += FIELD_W.category;
        if (!coreHit && specHit) total += FIELD_W.specs;
      }

      if (total <= 0) continue;
      if (allCore) total += 20;

      const fullQ = coreTerms.join(" ");
      if (nameF.includes(fullQ))  total += 15;
      if (brandF.includes(fullQ)) total += 8;
      if (catF.includes(fullQ))   total += 5;
      if (specF.includes(fullQ))  total += 1;

      results.push({ product: p, score: total, isExact: allCore });
    }

    const exactResults = results.filter(r => r.isExact);
    const useFallback = coreTerms.length > 0 && exactResults.length === 0 && results.length > 0;
    const displayed = useFallback ? results : exactResults.length ? exactResults : results;
    if (coreTerms.length) displayed.sort((a, b) => b.score - a.score);
    return { filtered: displayed.map(s => ({ ...s.product, __fallback: useFallback })), isFallback: useFallback };
  }, [allProductsWithSold, query, showSold]);

  const filteredBySidebar = useMemo(() => {
    const noActive = !filterSource && !filterBrand && !filterCondition && !priceMin && !priceMax && !Object.keys(filterSpecs).length;
    if (noActive) return filtered;
    const pLo = priceMin ? +priceMin : -Infinity;
    const pHi = priceMax ? +priceMax : Infinity;
    return filtered.filter(p => {
      if (filterSource && p._source !== filterSource) return false;
      if (filterBrand && p._brand !== filterBrand) return false;
      if (filterCondition) {
        const cond = p._raw?.condition || "";
        if (cond.toLowerCase() !== filterCondition.toLowerCase()) return false;
      }
      for (const [key, val] of Object.entries(filterSpecs)) {
        const cell = String(p._raw[key] ?? "").toLowerCase();
        if (!cell.includes(val.toLowerCase())) return false;
      }
      const pr = typeof p._price === "number" ? p._price : -1;
      if (pr >= 0 && (pr < pLo || pr > pHi)) return false;
      return true;
    });
  }, [filtered, filterSource, filterBrand, filterCondition, filterSpecs, priceMin, priceMax]);

  const sources = useMemo(() => {
    const s = new Set();
    for (const p of filtered) s.add(p._source);
    return [...s].sort();
  }, [filtered]);

  const brands = useMemo(() => {
    const s = new Set();
    for (const p of filtered) {
      if (p._brand && p._brand !== "-") s.add(p._brand);
    }
    return [...s].sort();
  }, [filtered]);

  const conditions = useMemo(() => {
    const s = new Set();
    for (const p of filtered) {
      const c = p._raw?.condition;
      if (c && c !== "-") s.add(c);
    }
    return [...s].sort();
  }, [filtered]);

  const specFilters = useMemo(() => {
    const skip = new Set(["id", "img", "image", "imageurl", "image_url", "name", "brand", "price", "amount", "cost", "ngn", "condition", "category", "type", "tags", "bundle", "delivery", "referral", "referral bonus", "description", "notes", "sku", "model"]);
    const map = {};
    for (const p of filtered) {
      for (const h of p._headers) {
        if (skip.has(h.toLowerCase())) continue;
        const v = String(p._raw[h] ?? "").trim();
        if (!v || v === "-" || v.length > 40) continue;
        if (!map[h]) map[h] = new Set();
        map[h].add(v);
      }
    }
    const out = {};
    for (const [h, vals] of Object.entries(map)) {
      const arr = [...vals].sort();
      if (arr.length > 1 && arr.length <= 20) out[h] = arr;
    }
    return out;
  }, [filtered]);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of filteredBySidebar) {
      if (!map[p._source]) map[p._source] = [];
      map[p._source].push(p);
    }
    return map;
  }, [filteredBySidebar]);

  const sortedGroups = useMemo(() => {
    const entries = Object.entries(grouped);
    for (const [, products] of entries) {
      products.sort((a, b) => {
        const pa = typeof a._price === "number" ? a._price : Infinity;
        const pb = typeof b._price === "number" ? b._price : Infinity;
        return pa - pb;
      });
    }
    const rankMap = {};
    filteredBySidebar.forEach((p, i) => {
      if (!(p._source in rankMap)) rankMap[p._source] = i;
    });
    entries.sort((a, b) => (rankMap[a[0]] ?? 999) - (rankMap[b[0]] ?? 999));
    return entries;
  }, [grouped, filteredBySidebar]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Results</h1>
          <button type="button" onClick={() => setShowFilters(v => !v)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition lg:hidden bg-white text-gray-600 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:border-neutral-700">
            Filters
          </button>
        </header>

        <div className="flex gap-6">
          {/* Mobile backdrop */}
          {showFilters && <div className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden" style={{ top: "4rem" }} onClick={() => setShowFilters(false)} />}
          {/* Sidebar filters */}
          <aside className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-72 flex-col overflow-y-auto overscroll-contain transition-transform duration-300 lg:relative lg:top-0 lg:z-auto lg:block lg:h-auto lg:w-56 lg:shrink-0 lg:translate-x-0 lg:overscroll-auto ${showFilters ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="rounded-xl border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:space-y-1">
              <div className="mb-2 flex items-center justify-between lg:hidden">
                <h2 className="text-sm font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <div className="mb-3 border-b pb-3 dark:border-neutral-700">
                <button type="button" onClick={() => setShowSold(v => !v)}
                  className={`w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition ${showSold ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-black" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800"} dark:border-neutral-700`}
                >
                  {showSold ? "Hide sold items" : "Show sold items"}
                </button>
              </div>
              <details open>
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">Category</summary>
                  <div className="mt-1.5 space-y-0.5 pl-1">
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                      <input type="radio" name="source" checked={!filterSource} onChange={() => setFilterSource(null)} className="accent-cyan-600" />
                      All
                    </label>
                    {sources.map(s => (
                      <label key={s} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                        <input type="radio" name="source" checked={filterSource === s} onChange={() => setFilterSource(s)} className="accent-cyan-600" />
                        {cap(s)}
                      </label>
                    ))}
                  </div>
              </details>
              {brands.length > 0 && (
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">Brand</summary>
                <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto pl-1">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                    <input type="radio" name="brand" checked={!filterBrand} onChange={() => setFilterBrand(null)} className="accent-cyan-600" />
                    All
                  </label>
                  {brands.map(b => (
                    <label key={b} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                      <input type="radio" name="brand" checked={filterBrand === b} onChange={() => setFilterBrand(b)} className="accent-cyan-600" />
                      {cap(b)}
                    </label>
                  ))}
                </div>
              </details>
              )}
              {conditions.length > 0 && (
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">Condition</summary>
                <div className="mt-1.5 space-y-1 pl-1">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                    <input type="radio" name="condition" checked={!filterCondition} onChange={() => setFilterCondition(null)} className="accent-cyan-600" />
                    All
                  </label>
                  {conditions.map(c => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                      <input type="radio" name="condition" checked={filterCondition === c} onChange={() => setFilterCondition(c)} className="accent-cyan-600" />
                      {cap(c)}
                    </label>
                  ))}
                </div>
              </details>
              )}
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">Price</summary>
                <div className="mt-1.5 flex items-center gap-2 pl-1 text-xs">
                  <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full rounded border bg-transparent px-2 py-1 text-gray-600 dark:border-neutral-700 dark:text-gray-400" placeholder="Min" />
                  <span>—</span>
                  <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full rounded border bg-transparent px-2 py-1 text-gray-600 dark:border-neutral-700 dark:text-gray-400" placeholder="Max" />
                </div>
              </details>
              {Object.entries(specFilters).map(([header, values]) => (
                <details key={header}>
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">{labelize(header)}</summary>
                  <div className="mt-1.5 space-y-1 pl-1">
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                      <input type="radio" name={header} checked={!filterSpecs[header]} onChange={() => setFilterSpecs(s => { const n = {...s}; delete n[header]; return n; })} className="accent-cyan-600" />
                      All
                    </label>
                    {values.map(v => (
                      <label key={v} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800">
                        <input type="radio" name={header} checked={filterSpecs[header] === v} onChange={() => setFilterSpecs(s => ({...s, [header]: v}))} className="accent-cyan-600" />
                        {cap(v)}
                      </label>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">

        {previewSrc && <ImagePreview src={previewSrc} alt={previewAlt} onClose={closePreview} />}

        {!ready && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            Loading products...
          </div>
        )}

        {ready && !query && !showSold && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            Enter a search term to find products across all categories.
          </div>
        )}

        {ready && !query && showSold && filtered.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            No sold items available.
          </div>
        )}

        {ready && query && filtered.length === 0 && !isFallback && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            No products found for "{query}".
          </div>
        )}

        {isFallback && filteredBySidebar.length > 0 && (
          <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-100 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
            No exact matches found for "<strong>{query}</strong>". Here are similar products you might be interested in:
          </div>
        )}

        {ready && filteredBySidebar.length > 0 && (query || showSold) && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {isFallback ? `Showing ${filteredBySidebar.length} similar product${filteredBySidebar.length === 1 ? "" : "s"}` :
             query && showSold ? `Found ${filteredBySidebar.length} result${filteredBySidebar.length === 1 ? "" : "s"} for "${query}"` :
             query ? `Found ${filteredBySidebar.length} result${filteredBySidebar.length === 1 ? "" : "s"} for "${query}"` :
             `Showing ${filteredBySidebar.length} sold item${filteredBySidebar.length === 1 ? "" : "s"}`}
          </div>
        )}

        {ready && sortedGroups.map(([source, products]) => (
          <div key={source} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">{source}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => {
                const raw = p._price;
                const priceText = typeof raw === "number" ? formatNaira(raw) : raw && raw !== "-" ? String(raw) : "Contact for price";
                const waDigits = "2348054717837";
                const waText = encodeURIComponent(`Hi! I'm interested in this product:\n${p._headers.filter(h => h.toLowerCase() !== "id" && h.toLowerCase() !== "img").map(h => `• ${h}: ${p._raw[h]}`).join("\n")}\n• link: ${window.location.origin}${catPath(p._source)}?p=${shortId(productFp(p))}-${p._name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}`);
                return (
                  <Card key={`${p._source}-${i}`} className="flex h-full flex-col overflow-hidden transition hover:shadow-lg">
                    <div className="relative">
                      <button type="button" onClick={() => { if (p._img && p._img !== "-") { setPreviewSrc(p._img); setPreviewAlt(p._name); } }} className="block w-full cursor-zoom-in">
                        <ImgWithLoader src={p._img !== "-" ? p._img : ""} alt={p._name} />
                      </button>
                      {p.__sold && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="-rotate-12 border-4 border-white px-6 py-3 font-['Montserrat'] text-2xl font-black tracking-[0.3em] text-white">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold">{p._name || "-"}</h3>
                        {p._brand && p._brand !== "-" && (
                          <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-neutral-700 dark:text-gray-300">{p._brand}</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                        {isApplianceProduct(p._raw, p._headers) &&
                          buildApplianceSpecs(p._raw, p._headers).length > 0 && (
                            <div className="mb-2 rounded-lg p-2 dark:border-neutral-700">
                              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Appliance Specs</div>
                              <div className="space-y-1">
                        {buildApplianceSpecs(p._raw, p._headers).map((spec, si) => {
                          const isFree = spec.value && spec.label === "Delivery";
                          return (
                            <div key={si} className="flex items-start gap-1.5 text-[12px]">
                              <span aria-hidden>{spec.icon}</span>
                              <span className="font-medium">{spec.label}:</span>
                              <span className={`font-semibold ${isFree ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-400"}`}>{formatApplianceValue(spec.value)}</span>
                            </div>
                          );
                        })}
                              </div>
                            </div>
                          )}
                        {buildEmojiSpecs(p._raw, p._headers).map(({ icon, label, text }, si) => {
                          const isFree = text && /bundle|freebies|extras|included|delivery|shipping/i.test(label) && !(p._source === "Tech Accessories" && /bundle|freebies|extras|included/i.test(label));
                          return (
                          <div key={si} className="flex items-start gap-1.5">
                            <span className="shrink-0 leading-5" aria-hidden>{icon}</span>
                             <div className="leading-5">
                              {label}
                              {text ? <>{label.endsWith(":") ? " " : ": "}<span className={`font-semibold ${isFree ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-400"}`}>{text}</span></> : null}
                            </div>
                          </div>
                        );})}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="text-sm font-bold"><span aria-hidden>💰</span> {priceText}</div>
                        <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const fp = productFp(p);
                            const sid = shortId(fp);
                            const slug = p._name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
                            const url = window.location.origin + catPath(p._source) + "?p=" + sid + "-" + slug;
                            navigator.clipboard.writeText(url);
                            setToastState("entering");
                          }}
                          title="Copy link to this product"
                          className="rounded p-1.5 text-gray-400 transition hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        </button>
                        <a href={`https://wa.me/${waDigits}?text=${waText}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-lg border px-2 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800">
                          <span aria-hidden className="mr-1">📩</span> Message
                        </a>
                      </div>
                    </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
          </div>
        </div>
      </section>

      {toastState && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-lg transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 ${toastState === "visible" ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          Link Copied
        </div>
      )}
    </main>
  );
}
