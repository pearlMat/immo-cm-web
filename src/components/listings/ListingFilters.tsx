"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

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
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { ListingType, PropertyType } from "@/types/enums"
import type { ListingFilters as ListingFiltersValue } from "@/types/filters"
import type { City } from "@/types/reference"

const BEDROOM_OPTIONS = [1, 2, 3, 4] as const

interface ListingFiltersProps {
  cities: City[]
  filters: ListingFiltersValue
  basePath: string
  className?: string
}

export function ListingFilters({ cities, filters, basePath, className }: ListingFiltersProps) {
  const t = useTranslations("ListingFilters")
  const tPropertyType = useTranslations("PropertyType")
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "")
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "")

  const selectedCity = cities.find((city) => city.id === filters.cityId)

  function navigate(overrides: Partial<ListingFiltersValue>) {
    const next: ListingFiltersValue = { ...filters, ...overrides, page: 1 }
    const params = new URLSearchParams()

    if (next.search) params.set("q", next.search)
    if (next.cityId) params.set("cityId", next.cityId)
    if (next.neighborhoodId) params.set("neighborhoodId", next.neighborhoodId)
    if (next.listingType) params.set("listingType", next.listingType)
    if (next.propertyType) params.set("propertyType", next.propertyType)
    if (next.minPrice !== undefined) params.set("minPrice", String(next.minPrice))
    if (next.maxPrice !== undefined) params.set("maxPrice", String(next.maxPrice))
    if (next.bedrooms !== undefined) params.set("bedrooms", String(next.bedrooms))
    if (next.sort) params.set("sort", next.sort)

    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  function handleCityChange(cityId: string) {
    const isSame = filters.cityId === cityId
    navigate({ cityId: isSame ? undefined : cityId, neighborhoodId: undefined })
  }

  function handlePropertyTypeChange(propertyType: PropertyType) {
    const isSame = filters.propertyType === propertyType
    navigate({ propertyType: isSame ? undefined : propertyType })
  }

  function handleBedroomsChange(bedrooms: number) {
    const isSame = filters.bedrooms === bedrooms
    navigate({ bedrooms: isSame ? undefined : bedrooms })
  }

  function handlePriceApply() {
    navigate({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("listingTypeTitle")}</h3>
        <div className="flex gap-2">
          {([ListingType.RENT, ListingType.SALE] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={filters.listingType === type ? "default" : "outline"}
              size="sm"
              aria-pressed={filters.listingType === type}
              onClick={() =>
                navigate({ listingType: filters.listingType === type ? undefined : type })
              }
            >
              {type === ListingType.RENT ? t("rent") : t("buy")}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("cityTitle")}</h3>
        <div className="flex flex-col gap-1.5">
          {cities.map((city) => (
            <label key={city.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="city"
                checked={filters.cityId === city.id}
                onChange={() => handleCityChange(city.id)}
              />
              {city.name}
            </label>
          ))}
        </div>
      </div>

      {selectedCity && selectedCity.neighborhoods.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("neighborhoodTitle")}</h3>
          <Select
            value={filters.neighborhoodId}
            onValueChange={(value) => navigate({ neighborhoodId: value ?? undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("neighborhoodPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {selectedCity.neighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("propertyTypeTitle")}</h3>
        <div className="flex flex-col gap-1.5">
          {Object.values(PropertyType).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.propertyType === type}
                onChange={() => handlePropertyTypeChange(type)}
              />
              {tPropertyType(type)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("priceTitle")}</h3>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
              {t("minLabel")}
            </Label>
            <Input
              id="minPrice"
              type="number"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
              {t("maxLabel")}
            </Label>
            <Input
              id="maxPrice"
              type="number"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handlePriceApply}>
          {t("apply")}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{t("bedroomsTitle")}</h3>
        <div className="flex flex-col gap-1.5">
          {BEDROOM_OPTIONS.map((count) => (
            <label key={count} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="bedrooms"
                checked={filters.bedrooms === count}
                onChange={() => handleBedroomsChange(count)}
              />
              {count === 4 ? "4+" : count}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
