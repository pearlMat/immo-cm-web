import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { getAdminDashboardStats } from "@/lib/admin"
import type { AdminDashboardStats } from "@/types/listing"

const EMPTY_STATS: AdminDashboardStats = {
  pending: 0,
  approved: 0,
  rejected: 0,
  totalAgents: 0,
  newAgentsThisWeek: 0,
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminDashboard")
  return { title: t("title") }
}

export default async function AdminDashboardPage() {
  const [t, stats] = await Promise.all([
    getTranslations("AdminDashboard"),
    getAdminDashboardStats().catch(() => EMPTY_STATS),
  ])

  const statCards = [
    { key: "statPending", value: stats.pending, highlight: true },
    { key: "statApproved", value: stats.approved, highlight: false },
    { key: "statRejected", value: stats.rejected, highlight: false },
    { key: "statTotalAgents", value: stats.totalAgents, highlight: false },
    { key: "statNewAgents", value: stats.newAgentsThisWeek, highlight: false },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button render={<Link href="/admin/annonces/en-attente" />}>{t("pendingQueueCta")}</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map(({ key, value, highlight }) => (
          <Card key={key} className={highlight ? "border-primary" : undefined}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t(key)}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
