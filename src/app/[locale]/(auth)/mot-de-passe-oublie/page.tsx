import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm"

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ForgotPasswordPage" })

  return {
    title: t("metaTitle"),
    description: t("subtitle"),
  }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPasswordPage")

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
