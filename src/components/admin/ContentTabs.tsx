"use client"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/admin/contenu/quartiers", labelKey: "quartiers" },
  { href: "/admin/contenu/equipements", labelKey: "equipements" },
] as const

export function ContentTabs() {
  const t = useTranslations("ContentNav")
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 border-b">
      {TABS.map(({ href, labelKey }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t(labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
