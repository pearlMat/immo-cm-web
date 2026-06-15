import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PendingQueueTable } from "@/components/admin/PendingQueueTable"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PendingQueuePage")
  return { title: t("title") }
}

export default async function PendingQueuePage() {
  const t = await getTranslations("PendingQueuePage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <PendingQueueTable />
    </div>
  )
}
