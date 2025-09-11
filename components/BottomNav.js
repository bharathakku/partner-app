import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Crown, Settings, Gift, Bell, Truck } from "lucide-react"
import { cn } from "../lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/orders", icon: Truck, label: "Orders" },
  { href: "/dashboard/wallet", icon: Crown, label: "Subscription" },
  { href: "/dashboard/incentives", icon: Gift, label: "Incentives" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/50 mobile-safe-area">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 transition-colors duration-200",
                isActive 
                  ? "text-brand-600" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "fill-current"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
