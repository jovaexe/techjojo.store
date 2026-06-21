import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

  const openSearch = () => setSearchOpen(true);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const val = searchVal.trim();
      if (val) navigate(`/search?q=${encodeURIComponent(val)}`);
    }
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
                : "w-28 border-gray-400 dark:border-neutral-800 hover:bg-gray-100/80 dark:hover:bg-neutral-900"
            }`}
          >
            {searchOpen ? (
              <div className="flex items-center">
                <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full bg-transparent py-2.5 pr-3 pl-2 text-sm outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
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
