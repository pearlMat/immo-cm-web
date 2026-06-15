"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { AdminListingsTable } from "@/components/admin/AdminListingsTable"
import { RejectionReasonModal } from "@/components/shared/RejectionReasonModal"
import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { ApiError } from "@/lib/api"
import { approveListing, getAdminListings, rejectListing } from "@/lib/admin"
import { ListingStatus } from "@/types/enums"
import type { Listing } from "@/types/listing"

export function PendingQueueTable() {
  const t = useTranslations("PendingQueuePage")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [approveTarget, setApproveTarget] = useState<Listing | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Listing | null>(null)
  const [pending, setPending] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings", "pending"],
    queryFn: () => getAdminListings({ status: ListingStatus.PENDING, sort: "oldest", limit: 50 }),
    staleTime: 60_000,
    retry: 1,
  })

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
  }

  async function handleApprove() {
    if (!approveTarget) return
    setPending(true)
    try {
      await approveListing(approveTarget.id)
      await invalidate()
      toast.success(t("approveSuccess"))
      setApproveTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return
    setPending(true)
    try {
      await rejectListing(rejectTarget.id, reason)
      await invalidate()
      toast.success(t("rejectSuccess"))
      setRejectTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  const listings = data?.data ?? []

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <AdminListingsTable
          listings={listings}
          locale={locale}
          onApprove={(listing) => setApproveTarget(listing)}
          onReject={(listing) => setRejectTarget(listing)}
        />
      )}

      <ConfirmModal
        open={approveTarget !== null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={t("approveConfirmTitle")}
        description={t("approveConfirmDescription")}
        loading={pending}
        onConfirm={handleApprove}
      />
      <RejectionReasonModal
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("rejectConfirmTitle")}
        description={t("rejectConfirmDescription")}
        loading={pending}
        onConfirm={handleReject}
      />
    </div>
  )
}
