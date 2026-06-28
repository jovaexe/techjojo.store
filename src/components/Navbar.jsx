import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search, Laptop, Smartphone, Cable, Gamepad2, TvIcon, Laptop2, Refrigerator, Menu } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getCachedProducts, getCacheVersion } from "../lib/productCache";

const logo = {
  light: "/logo-transparent-inverted.png",
  dark: "/logo-transparent.webp",
};
function logoFor(t) { return logo[t === "dark" ? "dark" : "light"]; }

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const catRef = useRef(null);

  const closeDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => { setDrawerClosing(false); setCatOpen(false); }, 280);
  };

  const categories = [
    { name: "Business Laptops", route: "/businesslaptops", icon: Laptop2 },
    { name: "Gaming Laptops", route: "/gaminglaptops", icon: Laptop },
    { name: "Macbooks", route: "/macbooks", icon: Laptop },
    { name: "Desktops", route: "/desktops", icon: Cable },
    { name: "Smartphones", route: "/smartphones", icon: Smartphone },
    { name: "Monitors", route: "/monitors", icon: TvIcon },
    { name: "Tech Accessories", route: "/techaccessories", icon: Gamepad2 },
    { name: "Home Appliances", route: "/homeappliances", icon: Refrigerator },
  ];

  const location = useLocation();

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchVal("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  useEffect(() => {
    if (!catOpen) return;
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catOpen]);

  const openSearch = () => setSearchOpen(true);

  const suggestions = useMemo(() => {
    if (!searchVal.trim()) return [];
    const needle = searchVal.toLowerCase();
    const words = needle.split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    const cached = getCachedProducts();
    if (!cached) return [];

    const results = [];
    const seen = new Set();
    const addResult = (text, source, score) => {
      const key = text + "|||" + source;
      if (seen.has(key)) return;
      seen.add(key);
      results.push({ text, source, score });
    };

    // 1. Match product names from the cache
    for (const group of cached) {
      for (const p of group.rows) {
        const name = p._name;
        if (!name || name === "-") continue;
        const nameL = name.toLowerCase();
        const hay = nameL + " " + (p._brand || "").toLowerCase() + " " + group.source.toLowerCase();
        if (!hay.includes(needle)) continue;

        let score = 0;
        if (nameL.startsWith(needle)) score = 100;
        else if (nameL.includes(needle)) score = 60;
        else score = 30;
        addResult(name, group.source, score);
      }
    }

    // 2. Broad category suggestions
    const broadTerms = [
      { match: [/\bgaming\b/i, /game\b/i],          text: "Gaming Laptop", src: "Category" },
      { match: [/^business/i, /office/i],            text: "Business Laptop", src: "Category" },
      { match: [/^mac\b/i, /macbook/i],              text: "MacBook", src: "Category" },
      { match: [/^desktop/i],                         text: "Desktop PC", src: "Category" },
      { match: [/phone|smartphone|^mobile/i],        text: "Smartphone", src: "Category" },
      { match: [/^monitor|^display|screen/i],         text: "Monitor", src: "Category" },
      { match: [/^tv\b/i],                            text: "Monitor", src: "Category" },
      { match: [/^accessor/i],                        text: "Tech Accessories", src: "Category" },
      { match: [/appliance|fridge|^home\b|^kitchen|^oven|^washer/i], text: "Home Appliance", src: "Category" },
      { match: [/^laptop/i],                          text: "Laptop", src: "Category" },
      { match: [/^tablet/i],                          text: "Tablet", src: "Category" },
      { match: [/^printer/i],                         text: "Printer", src: "Category" },
      { match: [/^router/i],                          text: "Router", src: "Category" },
      { match: [/^keyboard/i],                        text: "Keyboard", src: "Category" },
      { match: [/^mouse\b/i],                         text: "Mouse", src: "Category" },
      { match: [/^headphone|^headset|^earphone|^earbuds/i], text: "Headphones", src: "Category" },
      { match: [/^cable|^charger|^adapter/i],         text: "Cables & Chargers", src: "Category" },
      { match: [/^cheap|^budget|^affordable|^inexpensive/i], text: "Budget Laptop", src: "Category" },
      { match: [/^premium|^high.?end|^flagship/i],    text: "Premium Laptop", src: "Category" },
      { match: [/^used|^refurbished|^second.?hand|^grade.?[a-z]/i], text: "Used Laptop", src: "Category" },
      { match: [/^dell/i],                            text: "Dell Laptop", src: "Brand" },
      { match: [/^hp\b/i],                            text: "HP Laptop", src: "Brand" },
      { match: [/^lenovo/i],                          text: "Lenovo Laptop", src: "Brand" },
      { match: [/^apple/i],                           text: "Apple Laptop", src: "Brand" },
      { match: [/^samsung/i],                         text: "Samsung Laptop", src: "Brand" },
      { match: [/^asus/i],                            text: "ASUS Laptop", src: "Brand" },
      { match: [/^acer/i],                            text: "Acer Laptop", src: "Brand" },
      { match: [/^msi\b/i],                           text: "MSI Laptop", src: "Brand" },
      { match: [/^huawei/i],                          text: "Huawei Laptop", src: "Brand" },
      { match: [/^google/i],                          text: "Google Pixel", src: "Brand" },
      { match: [/^oneplus/i],                         text: "OnePlus Phone", src: "Brand" },
      { match: [/^nokia/i],                           text: "Nokia Phone", src: "Brand" },
      { match: [/^intel/i],                           text: "Intel Laptop", src: "Component" },
      { match: [/^amd\b/i],                           text: "AMD Laptop", src: "Component" },
      { match: [/^nvidia/i],                          text: "NVIDIA Laptop", src: "Component" },
      { match: [/^ryzen\s*\d/i],                      text: "Ryzen Laptop", src: "CPU" },
      { match: [/i[3579]\b/, /^core\s*i[3579]/i],    text: (needle.match(/i[3579]/) ? "Core " + needle.match(/i[3579]/i)[0].toUpperCase() : "") + " Laptop", src: "CPU" },
      { match: [/^rtx\b/i],                           text: "RTX Laptop", src: "GPU" },
      { match: [/^gtx\b/i],                           text: "GTX Laptop", src: "GPU" },
      { match: [/^quadro/i],                          text: "Quadro Laptop", src: "GPU" },
      { match: [/^radeon/i],                          text: "Radeon Laptop", src: "GPU" },
      { match: [/^(10[5-9]0|16[5-6]0|20[5-9]0|30[5-9]0|40[5-9]0)$/i], text: "RTX " + needle.toUpperCase() + " Laptop", src: "GPU" },
      { match: [/^(rx\s*\d{3,4})$/i],                text: "AMD " + needle.toUpperCase() + " Laptop", src: "GPU" },
    ];
    for (const bt of broadTerms) {
      if (bt.match.some(r => r.test(needle))) {
        const text = bt.text;
        if (text && text.trim()) addResult(text, bt.src, 85);
      }
    }

    // Sort by score, take top 5
    results.sort((a, b) => b.score - a.score);
    // Deduplicate similar texts (e.g., same product name from different sources)
    const deduped = [];
    const textSeen = new Set();
    for (const r of results) {
      const k = r.text.toLowerCase();
      if (textSeen.has(k)) continue;
      textSeen.add(k);
      deduped.push(r);
    }
    return deduped.slice(0, 5);
  }, [searchVal, getCacheVersion()]);

  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Close suggestions on outside click or scroll
  useEffect(() => {
    if (!showSuggestions) return;
    const close = () => { setShowSuggestions(false); setSelectedIdx(-1); };
    const clickHandler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", clickHandler);
    window.addEventListener("scroll", close, true);
    return () => { document.removeEventListener("mousedown", clickHandler); window.removeEventListener("scroll", close, true); };
  }, [showSuggestions]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIdx];
      if (selected) {
        setSearchVal(selected.text);
        closeSuggestions();
        navigate(`/search?q=${encodeURIComponent(selected.text)}`);
      }
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const val = searchVal.trim();
    if (val) navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  const closeSuggestions = () => { setShowSuggestions(false); setSelectedIdx(-1); };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-black/70 dark:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-black/60">

        {/* Mobile layout */}
        <div className="mx-auto max-w-6xl px-4 lg:hidden">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setCatOpen(true); }}
                className="rounded-lg border border-gray-400 p-2.5 text-sm transition hover:bg-gray-100/80 active:bg-gray-200 dark:border-neutral-800 dark:hover:bg-neutral-900 dark:active:bg-neutral-700" aria-label="Categories">
                <Menu className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
              <Link to="/" className="flex items-center group">
                <img src={logoFor(theme)} alt="techjojo" className="h-10 w-auto transition duration-300 group-hover:scale-105" />
              </Link>
            </div>
            <button type="button" onClick={toggleTheme} aria-label="Toggle color mode"
              className="rounded-lg border border-gray-400 px-3 py-2 text-sm transition hover:bg-gray-100/80 dark:border-neutral-800 dark:hover:bg-neutral-900">
              <span className="block leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>
          </div>
          <div className="pb-3">
              <form onSubmit={(e) => { setShowSuggestions(false); handleSearch(e); }} className="flex items-center rounded-lg border bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="relative flex-1">
                  <input ref={inputRef} value={searchVal} onChange={(e) => { setSearchVal(e.target.value); setSelectedIdx(-1); setShowSuggestions(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search All Products"
                    className="w-full bg-transparent px-2 py-1 text-sm outline-none text-gray-900 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500" />
                  {showSuggestions && suggestions.length > 0 && (
                    <div ref={dropdownRef} className="absolute left-0 top-full mt-1 z-50 w-full rounded-xl border bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                      {suggestions.map((s, i) => (
                        <button key={s.text + s.source} type="button"
                          onClick={() => { setSearchVal(s.text); closeSuggestions(); navigate(`/search?q=${encodeURIComponent(s.text)}`); }}
                          onMouseEnter={() => setSelectedIdx(i)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition ${i === selectedIdx ? "bg-gray-100 dark:bg-neutral-800" : "hover:bg-gray-50 dark:hover:bg-neutral-850"}`}>
                          <span className="text-gray-600 dark:text-gray-400">{s.text}</span>
                          <span className="ml-auto shrink-0 text-[10px] text-gray-400 dark:text-gray-500">{s.source}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </form>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="mx-auto hidden h-16 max-w-6xl items-center justify-between px-4 lg:flex">
          <div className="flex items-center gap-3">
            <div className="relative" ref={catRef}>
              <button type="button" onClick={(e) => { e.stopPropagation(); setCatOpen(v => !v); }}
                className="rounded-lg border border-gray-400 p-2.5 text-sm transition hover:bg-gray-100/80 active:bg-gray-200 dark:border-neutral-800 dark:hover:bg-neutral-900 dark:active:bg-neutral-700" aria-label="Categories">
                <Menu className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    const active = location.pathname === cat.route;
                    return (
                      <button key={cat.route} type="button" onClick={() => { navigate(cat.route); setCatOpen(false); }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition hover:bg-gray-100 dark:hover:bg-neutral-800 ${active ? "bg-gray-100 font-semibold dark:bg-neutral-800 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        <Icon className="h-4 w-4" />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Link to="/" className="flex items-center group">
              <img src={logoFor(theme)} alt="techjojo" className="h-11 w-auto transition duration-300 group-hover:scale-105" />
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <div ref={containerRef}
              className={`rounded-lg border transition-all duration-300 ease-in-out ${searchOpen ? "w-60 border-gray-400 dark:border-neutral-500 overflow-visible" : "w-48 border-gray-400 dark:border-neutral-800 hover:bg-gray-100/80 dark:hover:bg-neutral-900 overflow-hidden"}`}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                   <div className="relative flex-1">
                     <input ref={inputRef} value={searchVal} onChange={(e) => { setSearchVal(e.target.value); setSelectedIdx(-1); setShowSuggestions(true); }}
                       onKeyDown={handleKeyDown}
                       placeholder="Search All Products"
                       className="w-full bg-transparent py-2.5 pr-3 pl-2 text-sm outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                     {showSuggestions && suggestions.length > 0 && (
                       <div ref={dropdownRef} className="absolute left-0 top-full mt-1 z-50 w-full rounded-xl border bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                         {suggestions.map((s, i) => (
                           <button key={s.text + s.source} type="button"
                             onClick={() => { setSearchVal(s.text); closeSuggestions(); navigate(`/search?q=${encodeURIComponent(s.text)}`); }}
                             onMouseEnter={() => setSelectedIdx(i)}
                             className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition ${i === selectedIdx ? "bg-gray-100 dark:bg-neutral-800" : "hover:bg-gray-50 dark:hover:bg-neutral-850"}`}>
                             <span className="text-gray-600 dark:text-gray-400">{s.text}</span>
                             <span className="ml-auto shrink-0 text-[10px] text-gray-400 dark:text-gray-500">{s.source}</span>
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                </form>
              ) : (
                <button onClick={openSearch}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900 transition dark:text-gray-100">
                  <Search className="h-4 w-4" />
                  Search All Products
                </button>
              )}
            </div>
            <button type="button" onClick={toggleTheme} aria-label="Toggle color mode"
              className="rounded-lg border border-gray-400 px-3 py-2 text-sm transition hover:bg-gray-100/80 dark:border-neutral-800 dark:hover:bg-neutral-900">
              <span className="block leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>
          </nav>
        </div>

      </header>

      {(catOpen || drawerClosing) && createPortal(
        <div className="fixed inset-0 z-[999] pointer-events-auto lg:hidden" style={{ animation: drawerClosing ? "drawerFadeOut 0.25s ease-in forwards" : "drawerFadeIn 0.2s ease-out" }}>
          <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={closeDrawer} onTouchEnd={(e) => { e.preventDefault(); closeDrawer(); }} />
          <nav className="absolute left-0 top-0 bottom-0 flex w-64 flex-col border-r bg-white p-4 shadow-xl pointer-events-auto dark:border-neutral-700 dark:bg-neutral-900" style={{ touchAction: "manipulation", animation: drawerClosing ? "drawerSlideOut 0.25s ease-in forwards" : "drawerSlideIn 0.25s ease-out" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</h2>
              <button onClick={closeDrawer} type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto pointer-events-auto">
              {categories.map(cat => {
                const Icon = cat.icon;
                const active = location.pathname === cat.route;
                return (
                  <button key={cat.route} type="button" onTouchEnd={(e) => { e.preventDefault(); window.location.href = cat.route; }} onClick={() => { window.location.href = cat.route; }}
                    className={`pointer-events-auto flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 ${active ? "bg-gray-100 font-semibold dark:bg-neutral-800 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    <Icon className="h-5 w-5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>, document.body)}
    </>
  );
}
