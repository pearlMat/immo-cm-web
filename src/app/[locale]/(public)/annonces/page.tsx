import { ListingResultsPage } from "@/components/listings/ListingResultsPage"
import type { SearchParams } from "@/lib/listings"

interface BrowsePageProps {
  searchParams: Promise<SearchParams>
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  return <ListingResultsPage searchParams={searchParams} basePath="/annonces" title="titleBrowse" />
}
