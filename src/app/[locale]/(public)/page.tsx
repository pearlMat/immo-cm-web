import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listings/ListingCard"
import { SearchBar } from "@/components/listings/SearchBar"
import { Link } from "@/i18n/navigation"
import { EMPTY_LISTINGS, getCities, getListings } from "@/lib/listings"

export default async function HomePage() {
  const [cities, featured, t] = await Promise.all([
    getCities().catch(() => []),
    getListings({ limit: 6 }, { revalidate: 300 }).catch(() => EMPTY_LISTINGS),
    getTranslations("Home"),
  ])

  return (
    <div className="flex flex-col">
      <section className="relative flex flex-col items-center gap-6 bg-muted/40 px-4 py-16 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="text-muted-foreground">{t("heroSubtitle")}</p>
        </div>
        <SearchBar cities={cities} className="w-full max-w-3xl" />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12">
        <h2 className="text-xl font-semibold">{t("recentListings")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center">
        <h2 className="text-xl font-semibold">{t("ctaTitle")}</h2>
        <p className="text-muted-foreground">{t("ctaSubtitle")}</p>
        <Button render={<Link href="/agent/annonces/nouvelle" />}>{t("ctaButton")}</Button>
      </section>
    </div>
  )
}
