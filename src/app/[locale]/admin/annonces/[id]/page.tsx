import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ListingReviewPanel } from "@/components/admin/ListingReviewPanel"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

interface ListingReviewPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ListingReviewPageProps): Promise<Metadata> {
  const { id } = await params
  const t = await getTranslations("ListingReviewPage")
  return { title: t("title", { reference: id }) }
}

export default async function ListingReviewPage({ params }: ListingReviewPageProps) {
  const { id } = await params
  const t = await getTranslations("ListingReviewPage")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" render={<Link href="/admin/annonces" />}>
          {t("back")}
        </Button>
      </div>
      <ListingReviewPanel id={id} />
    </div>
  )
}
