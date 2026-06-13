"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import type { City } from "@/types/reference"

interface SearchBarProps {
  cities: City[]
  className?: string
}

export function SearchBar({ cities, className }: SearchBarProps) {
  const t = useTranslations("SearchBar")
  const tPropertyType = useTranslations("PropertyType")
  const router = useRouter()
  const [cityId, setCityId] = useState<string>()
  const [propertyType, setPropertyType] = useState<PropertyType>()
  const [listingType, setListingType] = useState<ListingType>(ListingType.RENT)

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("listingType", listingType)
    if (cityId) params.set("cityId", cityId)
    if (propertyType) params.set("propertyType", propertyType)

    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl bg-card p-4 shadow-md sm:flex-row sm:items-end", className)}>
      <div className="flex rounded-lg border border-input p-0.5">
        {([ListingType.RENT, ListingType.SALE] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={listingType === type}
            onClick={() => setListingType(type)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              listingType === type
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type === ListingType.RENT ? t("rent") : t("buy")}
          </button>
        ))}
      </div>

      <Select value={cityId} onValueChange={(value) => setCityId(value ?? undefined)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t("cityPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={propertyType}
        onValueChange={(value) => setPropertyType((value as PropertyType) ?? undefined)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={t("propertyTypePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PropertyType).map((type) => (
            <SelectItem key={type} value={type}>
              {tPropertyType(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleSearch} className="sm:w-auto">
        <SearchIcon />
        {t("search")}
      </Button>
    </div>
  )
}
