"use client"

import { useTranslations } from "next-intl"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "@/i18n/navigation"
import type { ListingFilters } from "@/types/filters"

const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "oldest"] as const

interface SortSelectProps {
  filters: ListingFilters
  basePath: string
}

export function SortSelect({ filters, basePath }: SortSelectProps) {
  const t = useTranslations("SortSelect")
  const router = useRouter()

  function handleChange(sort: string) {
    const params = new URLSearchParams()

    if (filters.search) params.set("q", filters.search)
    if (filters.cityId) params.set("cityId", filters.cityId)
    if (filters.neighborhoodId) params.set("neighborhoodId", filters.neighborhoodId)
    if (filters.listingType) params.set("listingType", filters.listingType)
    if (filters.propertyType) params.set("propertyType", filters.propertyType)
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice))
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice))
    if (filters.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms))
    if (sort !== "newest") params.set("sort", sort)

    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  return (
    <Select
      value={filters.sort ?? "newest"}
      onValueChange={(value) => handleChange(value ?? "newest")}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label={t("sortBy")}>
        <SelectValue placeholder={t("sortBy")} />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((value) => (
          <SelectItem key={value} value={value}>
            {t(value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
