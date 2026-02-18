"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Essays", href: "/essays" },
  { label: "Works", href: "/works" },
  { label: "Blog", href: "/blog" },
  { label: "Quotes", href: "/quotes" },
]

export function LeftNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex fixed left-16 top-24 z-50">
      <div className="flex flex-col gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("group flex items-center gap-3 transition-all duration-200", "hover:translate-x-1")}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isActive
                    ? "bg-foreground scale-100"
                    : "bg-muted-foreground/40 scale-75 group-hover:scale-100 group-hover:bg-foreground",
                )}
              />
              <span
                className={cn(
                  "text-sm uppercase tracking-wider transition-all",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
