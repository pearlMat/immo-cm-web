import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AdminUsersTable } from "@/components/admin/AdminUsersTable"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminUsersPage")
  return { title: t("title") }
}

export default async function AdminUsersPage() {
  const t = await getTranslations("AdminUsersPage")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <AdminUsersTable />
    </div>
  )
}
