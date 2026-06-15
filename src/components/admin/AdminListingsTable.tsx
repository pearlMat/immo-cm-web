"use client"

import { useTranslations } from "next-intl"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@/i18n/navigation"
import { formatDate, formatFCFA } from "@/lib/utils"
import { ListingStatus } from "@/types/enums"
import type { Listing } from "@/types/listing"

interface AdminListingsTableProps {
  listings: Listing[]
  locale: string
  selectable?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: () => void
  showStatusColumn?: boolean
  onApprove?: (listing: Listing) => void
  onReject?: (listing: Listing) => void
  onDelete?: (listing: Listing) => void
}

export function AdminListingsTable({
  listings,
  locale,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  showStatusColumn = false,
  onApprove,
  onReject,
  onDelete,
}: AdminListingsTableProps) {
  const t = useTranslations("AdminListingsTable")

  const allSelected = listings.length > 0 && listings.every((l) => selectedIds?.has(l.id))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleSelectAll?.()}
                aria-label={t("selectAll")}
              />
            </TableHead>
          )}
          <TableHead>{t("columnReference")}</TableHead>
          <TableHead>{t("columnTitle")}</TableHead>
          <TableHead>{t("columnAgent")}</TableHead>
          <TableHead>{t("columnNeighborhood")}</TableHead>
          <TableHead>{t("columnPrice")}</TableHead>
          {showStatusColumn && <TableHead>{t("columnStatus")}</TableHead>}
          <TableHead>{t("columnDate")}</TableHead>
          <TableHead>{t("columnActions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => (
          <TableRow key={listing.id}>
            {selectable && (
              <TableCell>
                <Checkbox
                  checked={selectedIds?.has(listing.id) ?? false}
                  onCheckedChange={() => onToggleSelect?.(listing.id)}
                  aria-label={t("selectRow", { reference: listing.referenceId })}
                />
              </TableCell>
            )}
            <TableCell className="font-mono text-xs">{listing.referenceId}</TableCell>
            <TableCell className="max-w-48 truncate font-medium">{listing.title}</TableCell>
            <TableCell>{listing.agentName}</TableCell>
            <TableCell>{listing.neighborhoodName}</TableCell>
            <TableCell>{formatFCFA(listing.price)}</TableCell>
            {showStatusColumn && (
              <TableCell>
                <StatusBadge status={listing.status} />
              </TableCell>
            )}
            <TableCell>{formatDate(listing.createdAt, locale)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" render={<Link href={`/admin/annonces/${listing.id}`} />}>
                  {t("actionView")}
                </Button>
                {listing.status === ListingStatus.PENDING && onApprove && (
                  <Button variant="outline" size="sm" onClick={() => onApprove(listing)}>
                    {t("actionApprove")}
                  </Button>
                )}
                {listing.status === ListingStatus.PENDING && onReject && (
                  <Button variant="outline" size="sm" onClick={() => onReject(listing)}>
                    {t("actionReject")}
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(listing)}>
                    {t("actionDelete")}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
