import { getTranslations } from "next-intl/server"

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher"
import { Button } from "@/components/ui/button"
import { getServerUser } from "@/lib/auth-server"
import { Link } from "@/i18n/navigation"
import { UserRole } from "@/types/enums"

export async function Header() {
  const [user, t] = await Promise.all([getServerUser(), getTranslations("Nav")])
  const dashboardHref =
    user?.role === UserRole.ADMIN ? "/admin/tableau-de-bord" : "/agent/tableau-de-bord"

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          ImmoCM
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/">{t("home")}</Link>
          <Link href="/annonces">{t("listings")}</Link>
          <Link href="/agent/annonces/nouvelle">{t("postListing")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <Button render={<Link href={dashboardHref} />} variant="outline" size="sm">
              {user.fullName}
            </Button>
          ) : (
            <Button render={<Link href="/connexion" />} size="sm">
              {t("login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
