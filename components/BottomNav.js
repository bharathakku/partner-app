import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Crown, Settings, Gift, Bell, Truck } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/orders", icon: Truck, label: "Orders" },
  { href: "/dashboard/subscription", icon: Crown, label: "Subscription" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/50 mobile-safe-area">
      <div
        className={
          // Always visible: flex for mobile, grid for desktop
          "flex w-full max-w-md mx-auto px-2 sm:px-4 md:px-6 lg:grid lg:grid-cols-4 lg:gap-0 lg:max-w-2xl lg:mx-auto lg:px-0"
        }
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href === "/dashboard/subscription" && pathname.startsWith("/dashboard/subscription"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Mobile: flex-1, Desktop: grid col, center, equal width
                "flex flex-col items-center justify-center flex-1 min-w-0 py-3 px-1 sm:px-2 md:px-3 transition-colors duration-200",
                "lg:py-4 lg:px-0 lg:justify-center lg:items-center lg:w-full lg:h-full",
                isActive
                  ? "text-brand-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
              tabIndex={0}
            >
              <Icon
                className={cn(
                  "w-6 h-6 mb-0.5 md:w-7 md:h-7 lg:w-7 lg:h-7",
                  isActive && "fill-current"
                )}
                aria-hidden="true"
              />
              <span className="text-[11px] md:text-xs font-medium truncate text-center leading-tight lg:text-sm lg:mt-1">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
