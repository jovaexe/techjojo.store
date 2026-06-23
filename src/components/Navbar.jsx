import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { preloadAllProducts, getCachedProducts, getCacheVersion } from "../lib/productCache";

const logo = {
  light: "/logo-transparent-inverted.png",
  dark: "/logo-transparent.webp",
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

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

  const openSearch = () => { setSearchOpen(true); preloadAllProducts(); };

  const suggestion = useMemo(() => {
    if (!searchVal.trim()) return "";
    const needle = searchVal.toLowerCase();
    const cached = getCachedProducts();
    if (!cached) return "";
    let best = null;
    for (const group of cached) {
      for (const p of group.rows) {
        const fields = [p._name?.toLowerCase(), p._brand?.toLowerCase()].filter(Boolean);
        for (const f of fields) {
          const idx = f.indexOf(needle);
          if (idx === -1) continue;
          if (!best || idx < best.idx || (idx === best.idx && f.length < best.len)) {
            best = { name: p._name, idx, len: f.length };
          }
        }
      }
    }
    return best ? best.name : "";
  }, [searchVal, getCacheVersion()]);

  const handleKeyDown = (e) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestion) {
      e.preventDefault();
      setSearchVal(suggestion);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = searchVal.trim();
    if (val) navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-black/70 dark:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center group">
          <img
            src={logo[theme]}
            alt="techjojo"
            className="h-11 w-auto transition duration-300 group-hover:scale-105"
          />
        </Link>

        <nav className="flex items-center gap-1">
          <div
            ref={containerRef}
            className={`overflow-hidden rounded-lg border transition-all duration-300 ease-in-out ${
              searchOpen
                ? "w-40 sm:w-60 border-gray-400 dark:border-neutral-500"
                : "w-48 border-gray-400 dark:border-neutral-800 hover:bg-gray-100/80 dark:hover:bg-neutral-900"
            }`}
          >
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={() => {
                      if (document.activeElement === inputRef.current && suggestion) {
                        setSearchVal(suggestion);
                      }
                    }}
                    placeholder="Search products..."
                    className="relative z-10 w-full bg-transparent py-2.5 pl-[3px] pr-3 text-sm outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    style={{ background: "transparent" }}
                  />
                  {suggestion && searchVal && (
                    <div className="pointer-events-none absolute inset-0 z-0 flex items-center py-2.5 pl-[3px] pr-3 text-sm">
                      <span className="invisible">{searchVal}</span>
                      <span className="text-gray-300 dark:text-gray-600">{suggestion.slice(searchVal.length)}</span>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900 transition dark:text-gray-100"
              >
                <Search className="h-4 w-4" />
                Search All Products
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color mode"
            className="rounded-lg border border-gray-400 px-3 py-2 text-sm transition hover:bg-gray-100/80 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <span className="block leading-none">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
