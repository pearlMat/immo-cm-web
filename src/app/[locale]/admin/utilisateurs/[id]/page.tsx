import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AdminUserDetail } from "@/components/admin/AdminUserDetail"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminUserDetailPage")
  return { title: t("title") }
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params
  const t = await getTranslations("AdminUserDetailPage")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" render={<Link href="/admin/utilisateurs" />}>
          {t("back")}
        </Button>
      </div>
      <AdminUserDetail id={id} />
    </div>
  )
}
