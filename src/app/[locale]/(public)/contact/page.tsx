import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/forms/ContactForm"

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ContactPage" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function ContactPage() {
  const t = await getTranslations("ContactPage")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Button
        render={
          <a href="https://wa.me/237600000000" target="_blank" rel="noopener noreferrer" />
        }
        variant="outline"
        className="self-start"
      >
        <MessageCircle />
        {t("writeOnWhatsapp")}
      </Button>

      <ContactForm />
    </div>
  )
}
