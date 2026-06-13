import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LoginForm } from "@/components/forms/LoginForm"

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "LoginPage" })

  return {
    title: t("metaTitle"),
    description: t("subtitle"),
  }
}

export default async function LoginPage() {
  const t = await getTranslations("LoginPage")

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <LoginForm />
    </div>
  )
}
