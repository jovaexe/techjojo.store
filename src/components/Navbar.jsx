import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Search } from "lucide-react";

const logo = {
  light: "/logo-transparent-inverted.png",
  dark: "/logo-transparent.webp",
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
          <button
            type="button"
            onClick={() => navigate("/search")}
            aria-label="Search products"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-400 px-4 py-2 text-sm font-medium transition hover:bg-gray-100/80 dark:border-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-900"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
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
