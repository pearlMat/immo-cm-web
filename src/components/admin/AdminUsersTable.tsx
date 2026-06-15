"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { UserStatusBadge } from "@/components/shared/UserStatusBadge"
import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@/i18n/navigation"
import { deleteUser, getAdminUsers, reactivateUser, suspendUser } from "@/lib/admin"
import { ApiError } from "@/lib/api"
import { formatDate, formatPhone } from "@/lib/utils"
import { UserRole, UserStatus } from "@/types/enums"
import type { AdminUserFilters } from "@/types/filters"
import type { AdminUser } from "@/types/user"

const DEFAULT_FILTERS: AdminUserFilters = { page: 1, limit: 20 }

const ALL_VALUE = "ALL"

type Action = "suspend" | "reactivate" | "delete"

export function AdminUsersTable() {
  const t = useTranslations("AdminUsersPage")
  const tAccountType = useTranslations("UserAccountType")
  const tStatus = useTranslations("UserStatus")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState("")
  const [target, setTarget] = useState<{ user: AdminUser; action: Action } | null>(null)
  const [pending, setPending] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => getAdminUsers(filters),
    staleTime: 60_000,
    retry: 1,
  })

  const users = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const page = filters.page ?? 1

  function updateFilters(overrides: Partial<AdminUserFilters>) {
    setFilters((prev) => ({ ...prev, ...overrides, page: 1 }))
  }

  async function handleConfirm() {
    if (!target) return
    setPending(true)
    try {
      if (target.action === "suspend") {
        await suspendUser(target.user.id)
        toast.success(t("suspendSuccess"))
      } else if (target.action === "reactivate") {
        await reactivateUser(target.user.id)
        toast.success(t("reactivateSuccess"))
      } else {
        await deleteUser(target.user.id)
        toast.success(t("deleteSuccess"))
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  const modalTitle =
    target?.action === "suspend"
      ? t("suspendConfirmTitle")
      : target?.action === "reactivate"
        ? t("reactivateConfirmTitle")
        : t("deleteConfirmTitle")

  const modalDescription =
    target?.action === "suspend"
      ? t("suspendConfirmDescription")
      : target?.action === "reactivate"
        ? t("reactivateConfirmDescription")
        : t("deleteConfirmDescription")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-role">{t("filterRoleLabel")}</Label>
          <Select
            value={filters.role ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({ role: value === ALL_VALUE ? undefined : (value as UserRole) })
            }
          >
            <SelectTrigger id="filter-role" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterRoleAll")}</SelectItem>
              <SelectItem value={UserRole.AGENT}>{t("filterRoleAgent")}</SelectItem>
              <SelectItem value={UserRole.PUBLIC_USER}>{t("filterRolePublicUser")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-status">{t("filterStatusLabel")}</Label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({ status: value === ALL_VALUE ? undefined : (value as UserStatus) })
            }
          >
            <SelectTrigger id="filter-status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterStatusAll")}</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-search">{t("filterSearchLabel")}</Label>
          <Input
            id="filter-search"
            className="w-56"
            placeholder={t("filterSearchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => updateFilters({ search: searchInput || undefined })}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilters({ search: searchInput || undefined })
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnName")}</TableHead>
              <TableHead>{t("columnEmail")}</TableHead>
              <TableHead>{t("columnPhone")}</TableHead>
              <TableHead>{t("columnAccountType")}</TableHead>
              <TableHead>{t("columnListings")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead>{t("columnJoined")}</TableHead>
              <TableHead>{t("columnActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{formatPhone(user.phone)}</TableCell>
                <TableCell>{user.accountType ? tAccountType(user.accountType) : "—"}</TableCell>
                <TableCell>{user.listingsCount}</TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell>{formatDate(user.createdAt, locale)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/admin/utilisateurs/${user.id}`} />}
                    >
                      {t("actionView")}
                    </Button>
                    {user.status === UserStatus.ACTIVE ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTarget({ user, action: "suspend" })}
                      >
                        {t("actionSuspend")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTarget({ user, action: "reactivate" })}
                      >
                        {t("actionReactivate")}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setTarget({ user, action: "delete" })}
                    >
                      {t("actionDelete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: page - 1 }))}
          >
            {t("prevPage")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pageInfo", { page, totalPages })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: page + 1 }))}
          >
            {t("nextPage")}
          </Button>
        </div>
      )}

      <ConfirmModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={modalTitle}
        description={modalDescription}
        destructive={target?.action === "delete"}
        loading={pending}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
