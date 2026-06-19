// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function Footer({
  className = "",
  whatsAppNumber = "+234 805 471 7837",
  fixed = true,
}) {
  const digits = whatsAppNumber.replace(/[^\d]/g, "");
  const fixedClasses = fixed ? " " : "";

  return (
    <footer
      role="contentinfo"
      className={`${fixedClasses} w-full border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-black/95 dark:supports-[backdrop-filter]:bg-black/80 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Grid on mobile -> 3 columns on sm+: [brand | nav | actions] */}
        <div className="grid grid-cols-1 gap-3 py-3 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-semibold lowercase text-gray-900 dark:text-white">
              techjojo
            </span>
            <span className="font-orbitron font-semibold lowercase text-gray-600 dark:text-gray-300">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Nav */}
          <nav aria-label="Footer navigation" className="flex gap-6">
            {/* left column */}
            <div className="flex flex-col flex-wrap gap-2 lg:flex-row lg:flex-nowrap">
              <Link
                to="/gaminglaptops"
                className="font-orbitron lowercase tracking-wide transition hover:text-gray-900 dark:hover:text-violet-300 dark:hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.65)]"
              >
                gaming laptops
              </Link>
              <Link
                to="/businesslaptops"
                className="font-orbitron lowercase transition hover:text-gray-900 dark:hover:text-emerald-300 dark:hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.55)]"
              >
                business laptops
              </Link>
              <Link
                to="/macbooks"
                className="font-orbitron lowercase transition hover:text-gray-900 dark:hover:text-blue-500 dark:hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.55)]"
              >
                macbooks
              </Link>
            </div>

            {/* middle column */}
            <div className="flex flex-col flex-wrap gap-2 lg:flex-row lg:flex-nowrap">
              <Link
                to="/smartphones"
                className="font-orbitron lowercase transition hover:text-gray-900 dark:hover:text-pink-200 dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
              >
                smartphones
              </Link>
              <Link
                to="/desktops"
                className="font-orbitron lowercase tracking-wide transition hover:text-gray-900 dark:hover:text-cyan-300 dark:hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]"
              >
                desktops
              </Link>
              <Link
                to="/monitors"
                className="font-orbitron lowercase tracking-wide transition hover:text-gray-900 dark:hover:text-amber-300 dark:hover:drop-shadow-[0_0_8px_rgba(252,211,77,0.55)]"
              >
                monitors
              </Link>
            </div>

            {/* right column */}
            <div className="flex flex-col flex-wrap gap-2 lg:flex-row lg:flex-nowrap">
              <Link
                to="/techaccessories"
                className="font-orbitron lowercase transition hover:text-gray-900 dark:hover:text-fuchsia-300 dark:hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.55)]"
              >
                tech accessories
              </Link>
              <Link
                to="/homeappliances"
                className="font-orbitron lowercase transition hover:text-gray-900 dark:hover:text-lime-300 dark:hover:drop-shadow-[0_0_8px_rgba(132,204,22,0.55)]"
              >
                home appliances
              </Link>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end sm:gap-3">
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noreferrer"
              title={`WhatsApp: ${whatsAppNumber}`}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900 sm:w-auto"
            >
              WhatsApp
            </a>
            <a
              href={`https://t.me/techjojo`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900 sm:w-auto"
            >
              Telegram
            </a>
            <a
              href={`https://akronrealty.co`}
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900 sm:w-auto"
            >
              Rent with Akron Realty!
              <img
                src={"/akronrealty.png"}
                alt="akronrealty logo"
                className="ml-1 h-4 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
