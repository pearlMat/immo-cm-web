"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { ListingPreview } from "@/components/admin/ListingPreview"
import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { RejectionReasonModal } from "@/components/shared/RejectionReasonModal"
import { StatusHistoryTimeline } from "@/components/shared/StatusHistoryTimeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "@/i18n/navigation"
import { ApiError } from "@/lib/api"
import { approveListing, deleteListing, getAdminListing, rejectListing } from "@/lib/admin"
import { ListingStatus } from "@/types/enums"

interface ListingReviewPanelProps {
  id: string
}

type Action = "approve" | "reject" | "delete"

export function ListingReviewPanel({ id }: ListingReviewPanelProps) {
  const t = useTranslations("ListingReviewPage")
  const queryClient = useQueryClient()
  const router = useRouter()
  const [action, setAction] = useState<Action | null>(null)
  const [pending, setPending] = useState(false)

  const { data: listing, isLoading } = useQuery({
    queryKey: ["admin-listing", id],
    queryFn: () => getAdminListing(id),
    staleTime: 60_000,
    retry: 1,
  })

  async function handleApprove() {
    setPending(true)
    try {
      await approveListing(id)
      await queryClient.invalidateQueries({ queryKey: ["admin-listing", id] })
      toast.success(t("approveSuccess"))
      setAction(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleReject(reason: string) {
    setPending(true)
    try {
      await rejectListing(id, reason)
      await queryClient.invalidateQueries({ queryKey: ["admin-listing", id] })
      toast.success(t("rejectSuccess"))
      setAction(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(reason: string) {
    setPending(true)
    try {
      await deleteListing(id, reason)
      toast.success(t("deleteSuccess"))
      router.push("/admin/annonces")
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
      setPending(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  if (!listing) {
    return <p className="text-sm text-muted-foreground">{t("notFound")}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">{t("previewTitle")}</h2>
        <ListingPreview listing={listing} />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{t("actionPanelTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {listing.status === ListingStatus.PENDING && (
              <>
                <Button onClick={() => setAction("approve")}>{t("actionApprove")}</Button>
                <Button variant="outline" onClick={() => setAction("reject")}>
                  {t("actionReject")}
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={() => setAction("delete")}>
              {t("actionDelete")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("statusHistoryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusHistoryTimeline entries={listing.statusLog} />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={action === "approve"}
        onOpenChange={(open) => !open && setAction(null)}
        title={t("approveConfirmTitle")}
        description={t("approveConfirmDescription")}
        loading={pending}
        onConfirm={handleApprove}
      />
      <RejectionReasonModal
        open={action === "reject"}
        onOpenChange={(open) => !open && setAction(null)}
        title={t("rejectConfirmTitle")}
        description={t("rejectConfirmDescription")}
        loading={pending}
        onConfirm={handleReject}
      />
      <RejectionReasonModal
        open={action === "delete"}
        onOpenChange={(open) => !open && setAction(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        loading={pending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
