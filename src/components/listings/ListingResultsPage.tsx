import { SlidersHorizontal } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { ListingCard } from "@/components/listings/ListingCard"
import { ListingFilters } from "@/components/listings/ListingFilters"
import { ListingPagination } from "@/components/listings/ListingPagination"
import { SortSelect } from "@/components/listings/SortSelect"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  EMPTY_LISTINGS,
  getCities,
  getListings,
  parseListingFilters,
  type SearchParams,
} from "@/lib/listings"

type ResultsTitle = "titleBrowse" | "titleSearch"

interface ListingResultsPageProps {
  searchParams: Promise<SearchParams>
  basePath: string
  title: ResultsTitle
}

export async function ListingResultsPage({ searchParams, basePath, title }: ListingResultsPageProps) {
  const filters = parseListingFilters(await searchParams)
  const [cities, listings, t, locale] = await Promise.all([
    getCities().catch(() => []),
    getListings(filters).catch(() => EMPTY_LISTINGS),
    getTranslations("ListingResultsPage"),
    getLocale(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">{t(title)}</h1>

      <div className="flex flex-col gap-6 sm:flex-row">
        <aside className="hidden w-64 shrink-0 sm:block">
          <ListingFilters cities={cities} filters={filters} basePath={basePath} />
        </aside>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="sm:hidden" />}>
                <SlidersHorizontal />
                {t("filters")}
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>{t("filters")}</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-4">
                  <ListingFilters cities={cities} filters={filters} basePath={basePath} />
                </div>
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground">
              {t("resultsCount", { count: listings.total })}
            </p>

            <SortSelect filters={filters} basePath={basePath} />
          </div>

          {listings.data.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          <ListingPagination
            page={listings.page}
            totalPages={listings.totalPages}
            filters={filters}
            basePath={basePath}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
