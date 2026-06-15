"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { UserStatusBadge } from "@/components/shared/UserStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "@/i18n/navigation"
import { deleteUser, getAdminUser, reactivateUser, suspendUser } from "@/lib/admin"
import { ApiError } from "@/lib/api"
import { formatDate, formatPhone } from "@/lib/utils"
import { UserStatus } from "@/types/enums"

type Action = "suspend" | "reactivate" | "delete"

interface AdminUserDetailProps {
  id: string
}

export function AdminUserDetail({ id }: AdminUserDetailProps) {
  const t = useTranslations("AdminUserDetailPage")
  const tAccountType = useTranslations("UserAccountType")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [action, setAction] = useState<Action | null>(null)
  const [pending, setPending] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getAdminUser(id),
    staleTime: 60_000,
    retry: 1,
  })

  async function handleConfirm() {
    if (!action || !user) return
    setPending(true)
    try {
      if (action === "suspend") {
        await suspendUser(user.id)
        await queryClient.invalidateQueries({ queryKey: ["admin-user", id] })
        toast.success(t("suspendSuccess"))
        setAction(null)
      } else if (action === "reactivate") {
        await reactivateUser(user.id)
        await queryClient.invalidateQueries({ queryKey: ["admin-user", id] })
        toast.success(t("reactivateSuccess"))
        setAction(null)
      } else {
        await deleteUser(user.id)
        toast.success(t("deleteSuccess"))
        router.push("/admin/utilisateurs")
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
      setPending(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">{t("notFound")}</p>
  }

  const modalTitle =
    action === "suspend"
      ? t("suspendConfirmTitle")
      : action === "reactivate"
        ? t("reactivateConfirmTitle")
        : t("deleteConfirmTitle")

  const modalDescription =
    action === "suspend"
      ? t("suspendConfirmDescription")
      : action === "reactivate"
        ? t("reactivateConfirmDescription")
        : t("deleteConfirmDescription")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{user.fullName}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("email")}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("phone")}</dt>
              <dd>{formatPhone(user.phone)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("accountType")}</dt>
              <dd>{user.accountType ? tAccountType(user.accountType) : "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("listingsCount")}</dt>
              <dd>{user.listingsCount}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("status")}</dt>
              <dd>
                <UserStatusBadge status={user.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("joined")}</dt>
              <dd>{formatDate(user.createdAt, locale)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {user.status === UserStatus.ACTIVE ? (
          <Button variant="outline" onClick={() => setAction("suspend")}>
            {t("actionSuspend")}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setAction("reactivate")}>
            {t("actionReactivate")}
          </Button>
        )}
        <Button variant="destructive" onClick={() => setAction("delete")}>
          {t("actionDelete")}
        </Button>
      </div>

      <ConfirmModal
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={modalTitle}
        description={modalDescription}
        destructive={action === "delete"}
        loading={pending}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
