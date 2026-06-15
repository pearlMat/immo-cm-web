import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AllListingsTable } from "@/components/admin/AllListingsTable"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminListingsPage")
  return { title: t("title") }
}

export default async function AdminListingsPage() {
  const t = await getTranslations("AdminListingsPage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <AllListingsTable />
    </div>
  )
}
