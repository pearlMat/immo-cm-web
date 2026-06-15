import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ListingForm } from "@/components/forms/ListingForm"

interface AdminEditListingPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ListingForm")
  return { title: t("titleEdit") }
}

export default async function AdminEditListingPage({ params }: AdminEditListingPageProps) {
  const [{ id }, t] = await Promise.all([params, getTranslations("ListingForm")])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("titleEdit")}</h1>
      <ListingForm
        mode="edit"
        listingId={id}
        context="admin"
        defaultContact={{ phone: "", whatsapp: "" }}
      />
    </div>
  )
}
