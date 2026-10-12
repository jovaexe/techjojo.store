import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Laptop, Smartphone, Cable , Gamepad2, TvIcon, Laptop2 } from "lucide-react"
import { getCachedProducts, onReady } from "../lib/productCache"

function Card({ children, className = "" }) {
  return (
    <div
      className={"rounded-2xl border bg-gray-100 shadow-sm " + "dark:bg-neutral-900 dark:border-neutral-800 " + className}
    >
      {children}
    </div>
  )
}
function CardHeader({ children, className = "" }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>
}
function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold font-orbitron ${className}`}>{children}</h3>
}
function CardContent({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>
}
// --------------------------------------------------------

const tiles = [
  {
    to: "/businesslaptops",
    title: "business laptops",
    subtitle: "HP • Dell • Lenovo",
    Icon: Laptop2,
    accent: "from-emerald-500/20 to-emerald-500/0 dark:from-emerald-400/10 dark:to-transparent",
    active: "active:bg-emerald-100 dark:active:bg-emerald-900/30",
  },
  {
    to: "/gaminglaptops",
    title: "gaming laptops",
    subtitle: "Intel • Nvidia • RGB",
    Icon: Laptop,
    accent: "from-blue-500/20 to-blue-500/0 dark:from-blue-400/10 dark:to-transparent",
    active: "active:bg-blue-100 dark:active:bg-blue-900/30",
  },
   {
  to: "/macbooks",
  title: "macbooks",
    subtitle: "Air • Pro • M1–M4",
  Icon: Laptop,
   accent: "from-stone-500/20 to-stone-500/0 dark:from-stone-400/10 dark:to-transparent",
   active: "active:bg-stone-100 dark:active:bg-stone-900/30",
},
  {
    to: "/desktops",
    title: "desktops",
    subtitle: "Towers • All-in-Ones • Mini PCs",
    Icon: Cable,
    accent: "from-amber-500/20 to-amber-500/0 dark:from-amber-400/10 dark:to-transparent",
    active: "active:bg-amber-100 dark:active:bg-amber-900/30",
  },
 {
    to: "/smartphones",
    title: "smartphones",
    subtitle: "Apple • Samsung • Motorola",
    Icon: Smartphone,
    accent: "from-rose-500/20 to-rose-500/0 dark:from-rose-400/10 dark:to-transparent",
    active: "active:bg-rose-100 dark:active:bg-rose-900/30",
  },
  {
    to: "/monitors",
    title: "monitors",
    subtitle: "Samsung • AoC • High Refresh Rate",
    Icon: TvIcon,
    accent: "from-purple-500/20 to-purple-500/0 dark:from-purple-400/10 dark:to-transparent",
    active: "active:bg-purple-100 dark:active:bg-purple-900/30",
  },
  {
    to: "/techaccessories",
    title: "tech accessories",
    subtitle: "Keyboard • Mouse • Headset",
    Icon: Gamepad2,
    accent: "from-orange-500/20 to-amber-500/0 dark:from-orange-400/10 dark:to-transparent",
    active: "active:bg-orange-100 dark:active:bg-orange-900/30",
  },
  {
    // External: opens the games collection on Notion. The picture lives in /public.
    href: "https://titanium-quartz-2b0.notion.site/The-Games-Collection-37df6bf57ab48082ad69c822e53f01ea",
    image: "/jojos-games.jpg",
    title: "Jojo's Games Collection",
    subtitle: "God of War • The Last of Us • and more",
    Icon: Gamepad2,
    accent: "from-violet-500/20 to-violet-500/0 dark:from-violet-400/10 dark:to-transparent",
    active: "active:bg-violet-100 dark:active:bg-violet-900/30",
  },
]

// Banner picture; quietly disappears if the image is missing or fails to load.
// `wide`: on small screens the subtitle is short, so the photo can stretch across the free space.
function BannerPhoto({ src, wide }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)}
      className={`pointer-events-none absolute right-3 top-[4.5rem] h-[calc(100%-5.25rem)] rounded-xl lg:top-3 lg:h-[calc(100%-1.5rem)] lg:w-auto lg:max-w-[58%] lg:object-contain lg:object-right ${wide ? "w-[52%] object-cover" : "w-auto max-w-[45%] object-contain object-right"} [-webkit-mask-image:linear-gradient(to_left,black_55%,transparent)] [mask-image:linear-gradient(to_left,black_55%,transparent)] transition duration-500 group-hover:scale-105`} />
  )
}

// Which catalog sheet supplies the photo for each banner (names match productCache.js)
const sourceFor = {
  "/businesslaptops": "Business Laptops",
  "/gaminglaptops": "Gaming Laptops",
  "/macbooks": "Macbooks",
  "/desktops": "Desktops",
  "/smartphones": "Smartphones",
  "/monitors": "Monitors",
  "/techaccessories": "Tech Accessories",
}

// ImageKit resizes on the fly: the sheets hold ~2500px photos, a banner needs ~600px.
function thumb(url, w) {
  if (!url || url === "-") return ""
  return `${url}${url.includes("?") ? "&" : "?"}tr=w-${w}`
}

// Products are preloaded by App; use them as soon as they are ready.
function useCatalog() {
  const [data, setData] = useState(() => getCachedProducts())
  useEffect(() => {
    let live = true
    if (!getCachedProducts()) onReady(() => live && setData(getCachedProducts()))
    return () => { live = false }
  }, [])
  return data
}

// Hand-picked product photos for banners where the first product is not the best showcase.
// If a product is later removed from its sheet, the banner falls back to the first photo.
const pickFor = {
  "/gaminglaptops": "ASUS ROG Strix G15",
  "/techaccessories": "Raiku R905 Wireless Gaming Keyboard & Mouse Combo",
}

function photoFor(data, route) {
  const group = (data || []).find((g) => g.source === sourceFor[route])
  if (!group) return ""
  const hasImg = (r) => r._img && r._img !== "-"
  const row = group.rows.find((r) => r._name === pickFor[route] && hasImg(r)) || group.rows.find(hasImg)
  return row ? thumb(row._img, 600) : ""
}


export default function Home() {
  const data = useCatalog()
  return (
    <main className="bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-6 min-h-screen">
        <header className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pick a category to browse products.</p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tiles.map(({ to, href, image, title, subtitle, Icon, accent, active }) => {
            const photo = image || photoFor(data, to)
            const Wrapper = href ? "a" : Link
            const linkProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { to }
            return (
            <Wrapper key={to || href} {...linkProps} className="group">
              <Card className={`relative h-48 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:hover:shadow-white/10 ${active}`}>
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
                <BannerPhoto src={photo} wide={subtitle.length <= 22} />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <span
                      className={
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl border " +
                        "bg-gray-50 dark:bg-neutral-800 " +
                        "border-gray-200 dark:border-neutral-700"
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative flex h-24 items-end">
                  <p className="max-w-[52%] text-sm text-gray-500 dark:text-gray-400 lg:max-w-[75%]">{subtitle}</p>
                </CardContent>
              </Card>
            </Wrapper>
            )
          })}
        </div>
      </section>
    </main>
  )
}
