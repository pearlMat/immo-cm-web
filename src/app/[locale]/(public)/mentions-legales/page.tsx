import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

interface LegalPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "LegalPage" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function LegalPage() {
  const t = await getTranslations("LegalPage")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-medium">{t("publisherTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("publisherBody")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-medium">{t("termsTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("termsBody")}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-medium">{t("privacyTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("privacyBody")}</p>
      </section>
    </div>
  )
}
