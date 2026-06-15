import { useLocale, useTranslations } from "next-intl"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { ListingStatusLog } from "@/types/listing"

interface StatusHistoryTimelineProps {
  entries: ListingStatusLog[]
}

export function StatusHistoryTimeline({ entries }: StatusHistoryTimelineProps) {
  const t = useTranslations("StatusHistoryTimeline")
  const locale = useLocale()

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>
  }

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-1 border-l-2 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <span className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt, locale)}
            </span>
          </div>
          {entry.reason && <p className="text-sm">{entry.reason}</p>}
        </li>
      ))}
    </ol>
  )
}
