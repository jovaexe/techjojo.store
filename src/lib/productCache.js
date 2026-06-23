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

function splitCsvLine(line) {
  const out = [];
  let cur = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCSV(csv) {
  const lines = csv.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };
  const rawHeaders = splitCsvLine(lines[0]).map(h => cleanOne(h));
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]).map(c => cleanOne(c));
    const obj = {};
    rawHeaders.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
    if ("price" in obj && obj.price !== "") {
      const n = Number(obj.price);
      obj.price = Number.isFinite(n) ? n : cleanOne(obj.price);
    }
    if (typeof obj.tags === "string" && obj.tags.length) {
      obj.tags = obj.tags.split(/[|,]/).map(t => cleanOne(t)).filter(isMeaningful);
    }
    out.push(obj);
  }
  return { headers: rawHeaders, rows: out };
}

const CSV_URLS = [
  { name: "Business Laptops", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxW6gngjCF1L1wNTUdW-Bq9lTE5PBLAPVvQQKjvjFoiqvA9wDuqrPfFhcNTdImuF1V9-2g_ZDGzJEl/pub?output=csv" },
  { name: "Gaming Laptops", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYg3-LbibWCpecanR1TGzoNWUOnLAgbDVU1H_I0KsuXxoO444jKUt1P2LTYrxc_WkapaAMj6ozIgQ8/pub?output=csv" },
  { name: "Macbooks", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxuYThDUuYKmEwO5b1c30ym4Z7ZF8ID528VHQ97lQm1HdZxsAXmVdJpoGmOcYXvO4IptOyNmWsOsXF/pub?output=csv" },
  { name: "Desktops", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPuCdo6sGWyH86QZWQLNZLA7Ybd4x_KoxBLLpo0qdZjAlgkvuunJaP8hp_ELQHy5sT_4BG61C0SrIu/pub?output=csv" },
  { name: "Smartphones", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ64ouEghFYbhpBe_Y6ySWmm-HwqK8nKfZddvHEegQ__r56q6wzjHg0WdcqcX0aqn4la-cDoizVPId/pub?output=csv" },
  { name: "Monitors", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5ft5ucwP62CICVLAdQ3mhbd_d-kVAADV-0smlETAwSyvo_4C4N8WF78P0ygmXd4QTLU8XmlTfFXUn/pub?output=csv" },
  { name: "Tech Accessories", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsLafTJKrbBBRbcyq2w6J8TEQvMI3ZjqeSXshV-RZeD0tBPsWBC8oP_Clz59e9PMNAzYdjcnDWu_-x/pub?output=csv" },
  { name: "Home Appliances", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhRTH6lqI4LnjJs8JI_CcK9YDfAHPLAFcXHdMBD5OhqT0WKsABx3ML9RPTYuBmeSKiXUIyQrioHj0V/pub?output=csv" },
];

let cache = null;
let loading = false;
let loadPromise = null;
let listeners = [];

const CACHE_KEY = "tj_product_cache";

function notify() {
  listeners.forEach(fn => fn());
  listeners = [];
}

export function getCachedProducts() {
  return cache;
}

export function isLoading() {
  return loading;
}

export function onReady(fn) {
  if (cache) { fn(); return; }
  listeners.push(fn);
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data } = JSON.parse(raw);
    return data;
  } catch { return null; }
}

function saveToCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data })); } catch {}
}

async function fetchAll() {
  const results = await Promise.all(CSV_URLS.map(async ({ name, url }) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${name}: ${res.status}`);
      const text = await res.text();
      const { rows } = parseCSV(text);
      const headers = rows.length ? Object.keys(rows[0]) : [];
      const nameKey = headers.find(h => h.toLowerCase() === "name") || null;
      const brandKey = headers.find(h => h.toLowerCase() === "brand") || null;
      const imgKey = headers.find(h => ["img", "image", "imageurl", "image_url"].includes(h.toLowerCase())) || null;
      const priceKey = headers.find(h => h.toLowerCase() === "price") || null;
      return {
        source: name,
        rows: rows.map(row => ({
          _raw: row,
          _headers: headers,
          _name: nameKey ? String(row[nameKey]) : "-",
          _brand: brandKey ? String(row[brandKey]) : "-",
          _img: imgKey ? String(row[imgKey]) : "-",
          _price: priceKey ? row[priceKey] : "-",
          _source: name,
        })),
      };
    } catch { return null; }
  }));
  return results.filter(Boolean);
}

export function preloadAllProducts() {
  if (cache) return Promise.resolve(cache);
  if (loading) return loadPromise;

  // Try cache first
  const cached = loadFromCache();
  if (cached) {
    cache = cached;
    loading = false;
    notify();
    // Still refresh in background
    fetchAll().then(fresh => {
      if (fresh.length) { cache = fresh; saveToCache(fresh); }
    });
    return Promise.resolve(cached);
  }

  loading = true;
  loadPromise = fetchAll().then(results => {
    cache = results;
    loading = false;
    if (results.length) saveToCache(results);
    notify();
    return results;
  });
  return loadPromise;
}
export { CSV_URLS };
