import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm"
import { Link } from "@/i18n/navigation"

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({
  params,
}: ResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ResetPasswordPage" })

  return {
    title: t("metaTitle"),
    description: t("subtitle"),
  }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams
  const t = await getTranslations("ResetPasswordPage")

  if (!token) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{t("invalidTokenTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("invalidTokenBody")}</p>
        <Link href="/mot-de-passe-oublie" className="font-medium underline">
          {t("forgotPasswordLink")}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  )
}
