import { ListingResultsPage } from "@/components/listings/ListingResultsPage"
import type { SearchParams } from "@/lib/listings"

interface SearchPageProps {
  searchParams: Promise<SearchParams>
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <ListingResultsPage
      searchParams={searchParams}
      basePath="/annonces/recherche"
      title="titleSearch"
    />
  )
}
