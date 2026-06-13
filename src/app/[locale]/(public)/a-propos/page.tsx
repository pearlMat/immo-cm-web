import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "AboutPage" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("AboutPage")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
        <p>{t("paragraph3")}</p>
      </div>
    </div>
  )
}
