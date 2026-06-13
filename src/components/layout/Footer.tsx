import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

export async function Footer() {
  const t = await getTranslations("Footer")

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">ImmoCM</p>
          <p>{t("tagline")}</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/a-propos">{t("about")}</Link>
          <Link href="/contact">{t("contact")}</Link>
          <Link href="/mentions-legales">{t("legal")}</Link>
        </nav>
      </div>
    </footer>
  )
}
