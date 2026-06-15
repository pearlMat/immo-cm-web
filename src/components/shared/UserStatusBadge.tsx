import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserStatus } from "@/types/enums"

const STATUS_STYLES: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  [UserStatus.SUSPENDED]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  [UserStatus.BANNED]: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const t = useTranslations("UserStatus")

  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status], className)}>
      {t(status)}
    </Badge>
  )
}
