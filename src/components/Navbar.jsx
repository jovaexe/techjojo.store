import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const logo = {
  light: "/logo-transparent-inverted.png",
  dark: "/logo-transparent.webp",
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-black dark:supports-[backdrop-filter]:bg-black">
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
            onClick={toggleTheme}
            aria-label="Toggle color mode"
            className="rounded-lg border border-gray-200/50 px-3 py-2 text-sm transition hover:bg-gray-100/80 dark:border-neutral-800 dark:hover:bg-neutral-900"
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
