"use client"

import { useTranslations } from "next-intl"
import {
  Bell,
  LayoutDashboard,
  List,
  PlusCircle,
  User as UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

interface AgentSidebarProps {
  user: User | null
}

const NAV_ITEMS = [
  { href: "/agent/tableau-de-bord", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/agent/mes-annonces", labelKey: "myListings", icon: List },
  { href: "/agent/annonces/nouvelle", labelKey: "newListing", icon: PlusCircle },
  { href: "/agent/notifications", labelKey: "notifications", icon: Bell },
  { href: "/agent/profil", labelKey: "profile", icon: UserIcon },
] as const

export function AgentSidebar({ user }: AgentSidebarProps) {
  const t = useTranslations("AgentNav")
  const pathname = usePathname()

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r p-4 md:flex">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar>
              {user.profilePhoto && <AvatarImage src={user.profilePhoto} alt={user.fullName} />}
              <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{user.fullName}</span>
          </div>
        )}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[0.7rem] font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {t(labelKey)}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
