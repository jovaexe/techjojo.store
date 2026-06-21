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
                to="/businesslaptops"
                className="font-orbitron lowercase transition hover:text-emerald-600 dark:hover:text-emerald-300 dark:hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.55)]"
              >
                business laptops
              </Link>
              <Link
                to="/gaminglaptops"
                className="font-orbitron lowercase tracking-wide transition hover:text-blue-600 dark:hover:text-blue-300 dark:hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.55)]"
              >
                gaming laptops
              </Link>
              <Link
                to="/macbooks"
                className="font-orbitron lowercase transition hover:text-stone-500 dark:hover:text-stone-300 dark:hover:drop-shadow-[0_0_8px_rgba(168,162,158,0.55)]"
              >
                macbooks
              </Link>
            </div>

            {/* middle column */}
            <div className="flex flex-col flex-wrap gap-2 lg:flex-row lg:flex-nowrap">
              <Link
                to="/desktops"
                className="font-orbitron lowercase tracking-wide transition hover:text-amber-600 dark:hover:text-amber-300 dark:hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.55)]"
              >
                desktops
              </Link>
              <Link
                to="/smartphones"
                className="font-orbitron lowercase transition hover:text-rose-600 dark:hover:text-rose-300 dark:hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.55)]"
              >
                smartphones
              </Link>
              <Link
                to="/monitors"
                className="font-orbitron lowercase tracking-wide transition hover:text-purple-600 dark:hover:text-purple-300 dark:hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.55)]"
              >
                monitors
              </Link>
            </div>

            {/* right column */}
            <div className="flex flex-col flex-wrap gap-2 lg:flex-row lg:flex-nowrap">
              <Link
                to="/techaccessories"
                className="font-orbitron lowercase transition hover:text-orange-600 dark:hover:text-orange-300 dark:hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.55)]"
              >
                tech accessories
              </Link>
              <Link
                to="/homeappliances"
                className="font-orbitron lowercase transition hover:text-cyan-600 dark:hover:text-cyan-300 dark:hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]"
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
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900 sm:w-auto"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`https://t.me/techjojo`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-900 sm:w-auto"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-[#229ED9]">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
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
