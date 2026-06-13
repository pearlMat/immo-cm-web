import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm"
import { Link } from "@/i18n/navigation"
import { verifyEmail } from "@/lib/auth"

interface VerifyEmailPageProps {
  params: Promise<{ locale: string; token: string }>
}

export async function generateMetadata({ params }: VerifyEmailPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "VerifyEmailPage" })

  return {
    title: t("metaTitle"),
  }
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params
  const t = await getTranslations("VerifyEmailPage")

  let verified = false

  try {
    await verifyEmail(token)
    verified = true
  } catch {
    verified = false
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      {verified ? (
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">{t("successTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("successBody")}</p>
          <Link href="/connexion" className="font-medium underline">
            {t("loginLink")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold">{t("errorTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("errorBody")}</p>
          </div>
          <ResendVerificationForm />
        </div>
      )}
    </div>
  )
}
