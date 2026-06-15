import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ListingForm } from "@/components/forms/ListingForm"
import { getServerUser } from "@/lib/auth-server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ListingForm")
  return { title: t("titleEdit") }
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, user, t] = await Promise.all([
    params,
    getServerUser(),
    getTranslations("ListingForm"),
  ])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("titleEdit")}</h1>
      <ListingForm
        mode="edit"
        listingId={id}
        defaultContact={{ phone: user?.phone ?? "", whatsapp: user?.whatsapp ?? "" }}
      />
    </div>
  )
}
