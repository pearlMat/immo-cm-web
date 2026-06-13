import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ListingStatus } from "@/types/enums"

const STATUS_STYLES: Record<ListingStatus, string> = {
  [ListingStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  [ListingStatus.APPROVED]:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  [ListingStatus.REJECTED]:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  [ListingStatus.PENDING_PAYMENT]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  [ListingStatus.DELETED]:
    "bg-muted text-muted-foreground",
}

interface StatusBadgeProps {
  status: ListingStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("ListingStatus")

  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status], className)}>
      {t(status)}
    </Badge>
  )
}
