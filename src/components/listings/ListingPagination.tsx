import { getTranslations } from "next-intl/server"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ListingFilters } from "@/types/filters"

interface ListingPaginationProps {
  page: number
  totalPages: number
  filters: ListingFilters
  basePath: string
  locale: string
}

export async function ListingPagination({
  page,
  totalPages,
  filters,
  basePath,
  locale,
}: ListingPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const t = await getTranslations("ListingPagination")

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams()

    if (filters.search) params.set("q", filters.search)
    if (filters.cityId) params.set("cityId", filters.cityId)
    if (filters.neighborhoodId) params.set("neighborhoodId", filters.neighborhoodId)
    if (filters.listingType) params.set("listingType", filters.listingType)
    if (filters.propertyType) params.set("propertyType", filters.propertyType)
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice))
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice))
    if (filters.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms))
    if (filters.sort) params.set("sort", filters.sort)
    if (targetPage > 1) params.set("page", String(targetPage))

    const query = params.toString()
    const path = `/${locale}${basePath}`
    return query ? `${path}?${query}` : path
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? hrefFor(page - 1) : undefined}
            aria-disabled={page <= 1}
            text={t("previous")}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={hrefFor(p)} isActive={p === page}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? hrefFor(page + 1) : undefined}
            aria-disabled={page >= totalPages}
            text={t("next")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
