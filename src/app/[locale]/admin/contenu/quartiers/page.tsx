import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ContentTabs } from "@/components/admin/ContentTabs"
import { NeighborhoodsManager } from "@/components/admin/NeighborhoodsManager"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NeighborhoodsPage")
  return { title: t("title") }
}

export default async function NeighborhoodsPage() {
  const t = await getTranslations("NeighborhoodsPage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <ContentTabs />
      <NeighborhoodsManager />
    </div>
  )
}
