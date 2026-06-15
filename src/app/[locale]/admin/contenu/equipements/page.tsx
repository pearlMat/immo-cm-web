import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AmenitiesManager } from "@/components/admin/AmenitiesManager"
import { ContentTabs } from "@/components/admin/ContentTabs"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AmenitiesPage")
  return { title: t("title") }
}

export default async function AmenitiesPage() {
  const t = await getTranslations("AmenitiesPage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <ContentTabs />
      <AmenitiesManager />
    </div>
  )
}
