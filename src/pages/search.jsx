import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const closePreview = () => { setPreviewSrc(""); setPreviewAlt(""); };

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
      const sourceKey = url.replace(/[^a-zA-Z0-9]/g, "_") + "_v2";
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

  const allProductsWithSold = useMemo(() => {
    if (!showSold || !soldPool.length) return allProducts;
    const soldNames = new Set(soldPool.map(p => `${p._name}|${p._brand}`));
    const filtered = allProducts.filter(p => !soldNames.has(`${p._name}|${p._brand}`));
    return [...filtered, ...soldPool];
  }, [allProducts, soldPool, showSold]);

  const filtered = useMemo(() => {
    if (!allProductsWithSold.length) return [];
    if (!query && !showSold) return [];

    const needle = normalize(query);
    const words = needle ? needle.split(/\s+/).filter(Boolean) : [];

    const scored = [];
    for (const p of allProductsWithSold) {
      if (!words.length) {
        scored.push({ product: p, score: 0 });
        continue;
      }

      const rawStr = normalize(Object.values(p._raw).join(" "));
      const nameStr = normalize(p._name);
      const sourceStr = normalize(p._source);
      const brandStr = normalize(p._brand);

      // Match if exact phrase OR all individual words appear
      const phraseMatch = rawStr.includes(needle);
      const wordsMatch = words.every(w => rawStr.includes(w));
      if (!phraseMatch && !wordsMatch) continue;

      let score = 0;
      for (const w of words) {
        if (nameStr.includes(w)) score += 3;
        if (brandStr.includes(w)) score += 2;
        if (sourceStr.includes(w)) score += 2;
        score += 1;
      }

      // Phrase bonus
      if (nameStr.includes(needle)) score += 5;
      if (brandStr.includes(needle)) score += 3;
      if (sourceStr.includes(needle)) score += 3;
      if (rawStr.includes(needle)) score += 2;

      scored.push({ product: p, score });
    }

    if (needle) scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  }, [allProductsWithSold, query, showSold]);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p._source]) map[p._source] = [];
      map[p._source].push(p);
    }
    return map;
  }, [filtered]);

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
    filtered.forEach((p, i) => {
      if (!(p._source in rankMap)) rankMap[p._source] = i;
    });
    entries.sort((a, b) => (rankMap[a[0]] ?? 999) - (rankMap[b[0]] ?? 999));
    return entries;
  }, [grouped, filtered]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900">
            ← Home
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Search</h1>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <button type="button" onClick={() => setShowSold(v => !v)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${showSold ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-black" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800"} dark:border-neutral-700`}
          >
            {showSold ? "Hide sold items" : "Show sold items"}
          </button>
        </div>

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

        {ready && query && filtered.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
            No products found for "{query}".
          </div>
        )}

        {ready && filtered.length > 0 && (query || showSold) && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {query && showSold ? `Found ${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${query}"` :
             query ? `Found ${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${query}"` :
             `Showing ${filtered.length} sold item${filtered.length === 1 ? "" : "s"}`}
          </div>
        )}

        {ready && sortedGroups.map(([source, products]) => (
          <div key={source} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">{source}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => {
                const raw = p._price;
                const priceText = typeof raw === "number" ? formatNaira(raw) : raw && raw !== "-" ? String(raw) : "Contact for price";
                const waDigits = "2348054717837";
                const waText = encodeURIComponent(`Hi! I'm interested in this product:\n${p._headers.filter(h => h.toLowerCase() !== "id").map(h => `• ${h}: ${p._raw[h]}`).join("\n")}`);
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
                                {buildApplianceSpecs(p._raw, p._headers).map((spec, si) => (
                                  <div key={si} className="flex items-start gap-1.5 text-[12px]">
                                    <span aria-hidden>{spec.icon}</span>
                                     <span className="font-medium">{spec.label}:</span>
                                     <span className="font-semibold text-gray-600 dark:text-gray-400">{formatApplianceValue(spec.value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {buildEmojiSpecs(p._raw, p._headers).map(({ icon, label, text }, si) => (
                          <div key={si} className="flex items-start gap-1.5">
                            <span className="shrink-0 leading-5" aria-hidden>{icon}</span>
                             <div className="leading-5">
                              {label}
                              {text ? <>{label.endsWith(":") ? " " : ": "}<span className="font-semibold text-gray-600 dark:text-gray-400">{text}</span></> : null}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="text-sm font-bold"><span aria-hidden>💰</span> {priceText}</div>
                        <a href={`https://wa.me/${waDigits}?text=${waText}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800">
                          <span aria-hidden className="mr-1">📩</span> Message
                        </a>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
