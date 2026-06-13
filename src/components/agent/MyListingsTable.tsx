"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "@/i18n/navigation"
import { ApiError } from "@/lib/api"
import { deleteAgentListing, getAgentListings, resubmitAgentListing } from "@/lib/agent"
import { listingHref } from "@/lib/slug"
import { formatDate, formatFCFA } from "@/lib/utils"
import { ListingStatus } from "@/types/enums"

const FILTER_TABS = [
  { value: "ALL", labelKey: "tabAll" },
  { value: ListingStatus.PENDING, labelKey: "tabPending" },
  { value: ListingStatus.APPROVED, labelKey: "tabApproved" },
  { value: ListingStatus.REJECTED, labelKey: "tabRejected" },
] as const

export function MyListingsTable() {
  const t = useTranslations("MyListingsPage")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<string>("ALL")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [resubmitTarget, setResubmitTarget] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const status = tab === "ALL" ? undefined : (tab as ListingStatus)

  const { data, isLoading } = useQuery({
    queryKey: ["agent-listings", status],
    queryFn: () => getAgentListings({ status, limit: 50 }),
    staleTime: 60_000,
    retry: 1,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setPending(true)
    try {
      await deleteAgentListing(deleteTarget)
      await queryClient.invalidateQueries({ queryKey: ["agent-listings"] })
      toast.success(t("deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleResubmit() {
    if (!resubmitTarget) return
    setPending(true)
    try {
      await resubmitAgentListing(resubmitTarget)
      await queryClient.invalidateQueries({ queryKey: ["agent-listings"] })
      toast.success(t("resubmitSuccess"))
      setResubmitTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  const listings = data?.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (typeof value === "string") setTab(value)
        }}
      >
        <TabsList>
          {FILTER_TABS.map(({ value, labelKey }) => (
            <TabsTrigger key={value} value={value}>
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>{t("columnTitle")}</TableHead>
              <TableHead>{t("columnNeighborhood")}</TableHead>
              <TableHead>{t("columnPrice")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead>{t("columnDate")}</TableHead>
              <TableHead>{t("columnActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  {listing.images[0] && (
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-48 truncate font-medium">{listing.title}</TableCell>
                <TableCell>{listing.neighborhoodName}</TableCell>
                <TableCell>{formatFCFA(listing.price)}</TableCell>
                <TableCell>
                  <StatusBadge status={listing.status} />
                </TableCell>
                <TableCell>{formatDate(listing.createdAt, locale)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" render={<Link href={listingHref(listing)} />}>
                      {t("actionView")}
                    </Button>
                    {(listing.status === ListingStatus.PENDING ||
                      listing.status === ListingStatus.REJECTED) && (
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/agent/annonces/${listing.id}/modifier`} />}
                      >
                        {t("actionEdit")}
                      </Button>
                    )}
                    {listing.status === ListingStatus.REJECTED && (
                      <Button variant="outline" size="sm" onClick={() => setResubmitTarget(listing.id)}>
                        {t("actionResubmit")}
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(listing.id)}>
                      {t("actionDelete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        destructive
        loading={pending}
        onConfirm={handleDelete}
      />
      <ConfirmModal
        open={resubmitTarget !== null}
        onOpenChange={(open) => !open && setResubmitTarget(null)}
        title={t("resubmitConfirmTitle")}
        description={t("resubmitConfirmDescription")}
        loading={pending}
        onConfirm={handleResubmit}
      />
    </div>
  )
}
