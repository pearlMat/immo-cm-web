import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MyListingsTable } from "@/components/agent/MyListingsTable"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MyListingsPage")
  return { title: t("title") }
}

export default async function MyListingsPage() {
  const t = await getTranslations("MyListingsPage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <MyListingsTable />
    </div>
  )
}
