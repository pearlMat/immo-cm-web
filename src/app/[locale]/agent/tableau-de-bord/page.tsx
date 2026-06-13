import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { getAgentListingStats, getRecentNotifications } from "@/lib/agent"
import { formatDate } from "@/lib/utils"
import type { AgentListingStats } from "@/types/listing"
import type { Notification } from "@/types/notification"

const EMPTY_STATS: AgentListingStats = { total: 0, pending: 0, approved: 0, rejected: 0 }

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AgentDashboard")
  return { title: t("title") }
}

export default async function AgentDashboardPage() {
  const [t, locale, stats, notifications] = await Promise.all([
    getTranslations("AgentDashboard"),
    getLocale(),
    getAgentListingStats().catch(() => EMPTY_STATS),
    getRecentNotifications(5).catch((): Notification[] => []),
  ])

  const statCards = [
    { key: "statTotal", value: stats.total },
    { key: "statPending", value: stats.pending },
    { key: "statApproved", value: stats.approved },
    { key: "statRejected", value: stats.rejected },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button render={<Link href="/agent/annonces/nouvelle" />}>{t("newListingCta")}</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ key, value }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t(key)}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span>{notification.message}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(notification.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
