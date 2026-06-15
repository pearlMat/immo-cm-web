import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ListingForm } from "@/components/forms/ListingForm"
import { getServerUser } from "@/lib/auth-server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ListingForm")
  return { title: t("titleCreate") }
}

export default async function NewListingPage() {
  const [user, t] = await Promise.all([getServerUser(), getTranslations("ListingForm")])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("titleCreate")}</h1>
      <ListingForm
        mode="create"
        defaultContact={{ phone: user?.phone ?? "", whatsapp: user?.whatsapp ?? "" }}
      />
    </div>
  )
}
