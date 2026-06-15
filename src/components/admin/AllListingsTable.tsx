"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { AdminListingsTable } from "@/components/admin/AdminListingsTable"
import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { RejectionReasonModal } from "@/components/shared/RejectionReasonModal"
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
  approveListing,
  bulkApproveListings,
  bulkDeleteListings,
  bulkRejectListings,
  deleteListing,
  getAdminListings,
  rejectListing,
} from "@/lib/admin"
import { getCities } from "@/lib/listings"
import { ApiError } from "@/lib/api"
import { ListingStatus, ListingType, PropertyType } from "@/types/enums"
import type { AdminListingFilters } from "@/types/filters"
import type { Listing } from "@/types/listing"

const DEFAULT_FILTERS: AdminListingFilters = { page: 1, limit: 20 }

const ALL_VALUE = "ALL"

type BulkAction = "approve" | "reject" | "delete"

export function AllListingsTable() {
  const t = useTranslations("AdminListingsPage")
  const tStatus = useTranslations("ListingStatus")
  const tListingType = useTranslations("ListingType")
  const tPropertyType = useTranslations("PropertyType")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<AdminListingFilters>(DEFAULT_FILTERS)
  const [agentInput, setAgentInput] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [approveTarget, setApproveTarget] = useState<Listing | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Listing | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null)
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null)
  const [pending, setPending] = useState(false)

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
    staleTime: 3_600_000,
    retry: 1,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings", "all", filters],
    queryFn: () => getAdminListings(filters),
    staleTime: 60_000,
    retry: 1,
  })

  const listings = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const page = filters.page ?? 1

  function updateFilters(overrides: Partial<AdminListingFilters>) {
    setSelectedIds(new Set())
    setFilters((prev) => ({ ...prev, ...overrides, page: 1 }))
  }

  function handleReset() {
    setAgentInput("")
    setSearchInput("")
    setSelectedIds(new Set())
    setFilters(DEFAULT_FILTERS)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (listings.every((listing) => prev.has(listing.id))) {
        return new Set()
      }
      return new Set(listings.map((listing) => listing.id))
    })
  }

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

  async function handleDelete(reason: string) {
    if (!deleteTarget) return
    setPending(true)
    try {
      await deleteListing(deleteTarget.id, reason)
      await invalidate()
      toast.success(t("deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleBulkApprove() {
    setPending(true)
    try {
      await bulkApproveListings([...selectedIds])
      await invalidate()
      toast.success(t("bulkSuccess"))
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleBulkReject(reason: string) {
    setPending(true)
    try {
      await bulkRejectListings([...selectedIds], reason)
      await invalidate()
      toast.success(t("bulkSuccess"))
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleBulkDelete(reason: string) {
    setPending(true)
    try {
      await bulkDeleteListings([...selectedIds], reason)
      await invalidate()
      toast.success(t("bulkSuccess"))
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-status">{t("filterStatusLabel")}</Label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({ status: value === ALL_VALUE ? undefined : (value as ListingStatus) })
            }
          >
            <SelectTrigger id="filter-status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterStatusAll")}</SelectItem>
              {Object.values(ListingStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-city">{t("filterCityLabel")}</Label>
          <Select
            value={filters.cityId ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({ cityId: value === ALL_VALUE || value === null ? undefined : value })
            }
          >
            <SelectTrigger id="filter-city" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterCityAll")}</SelectItem>
              {(cities ?? []).map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-listing-type">{t("filterListingTypeLabel")}</Label>
          <Select
            value={filters.listingType ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({
                listingType: value === ALL_VALUE ? undefined : (value as ListingType),
              })
            }
          >
            <SelectTrigger id="filter-listing-type" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterListingTypeAll")}</SelectItem>
              {Object.values(ListingType).map((type) => (
                <SelectItem key={type} value={type}>
                  {tListingType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-property-type">{t("filterPropertyTypeLabel")}</Label>
          <Select
            value={filters.propertyType ?? ALL_VALUE}
            onValueChange={(value) =>
              updateFilters({
                propertyType: value === ALL_VALUE ? undefined : (value as PropertyType),
              })
            }
          >
            <SelectTrigger id="filter-property-type" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("filterPropertyTypeAll")}</SelectItem>
              {Object.values(PropertyType).map((type) => (
                <SelectItem key={type} value={type}>
                  {tPropertyType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-date-from">{t("filterDateFromLabel")}</Label>
          <Input
            id="filter-date-from"
            type="date"
            className="w-40"
            value={filters.dateFrom ?? ""}
            onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-date-to">{t("filterDateToLabel")}</Label>
          <Input
            id="filter-date-to"
            type="date"
            className="w-40"
            value={filters.dateTo ?? ""}
            onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-agent">{t("filterAgentLabel")}</Label>
          <Input
            id="filter-agent"
            className="w-44"
            placeholder={t("filterAgentPlaceholder")}
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            onBlur={() => updateFilters({ agentName: agentInput || undefined })}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilters({ agentName: agentInput || undefined })
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-search">{t("filterSearchLabel")}</Label>
          <Input
            id="filter-search"
            className="w-44"
            placeholder={t("filterSearchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => updateFilters({ search: searchInput || undefined })}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilters({ search: searchInput || undefined })
            }}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleReset}>
          {t("filterReset")}
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{t("selectedCount", { count: selectedIds.size })}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setBulkAction("approve")}>
            {t("bulkApprove")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setBulkAction("reject")}>
            {t("bulkReject")}
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => setBulkAction("delete")}>
            {t("bulkDelete")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <AdminListingsTable
          listings={listings}
          locale={locale}
          showStatusColumn
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onApprove={(listing) => setApproveTarget(listing)}
          onReject={(listing) => setRejectTarget(listing)}
          onDelete={(listing) => setDeleteTarget(listing)}
        />
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
      <RejectionReasonModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        loading={pending}
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={bulkAction === "approve"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title={t("bulkApproveConfirmTitle")}
        description={t("bulkApproveConfirmDescription")}
        loading={pending}
        onConfirm={handleBulkApprove}
      />
      <RejectionReasonModal
        open={bulkAction === "reject"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title={t("bulkRejectConfirmTitle")}
        description={t("bulkRejectConfirmDescription")}
        loading={pending}
        onConfirm={handleBulkReject}
      />
      <RejectionReasonModal
        open={bulkAction === "delete"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title={t("bulkDeleteConfirmTitle")}
        description={t("bulkDeleteConfirmDescription")}
        loading={pending}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
