import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm"
import { PersonalInfoForm } from "@/components/forms/PersonalInfoForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerUser } from "@/lib/auth-server"
import { UserAccountType } from "@/types/enums"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AgentProfile")
  return { title: t("title") }
}

export default async function AgentProfilePage() {
  const [user, t, tAuth] = await Promise.all([
    getServerUser(),
    getTranslations("AgentProfile"),
    getTranslations("Auth"),
  ])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("personalInfoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user?.accountType && (
              <p className="text-sm text-muted-foreground">
                {tAuth("accountTypeLabel")}:{" "}
                {user.accountType === UserAccountType.AGENT
                  ? tAuth("accountTypeAgent")
                  : tAuth("accountTypeLandlord")}
              </p>
            )}
            <PersonalInfoForm
              defaultValues={{
                fullName: user?.fullName ?? "",
                phone: user?.phone ?? "",
                whatsapp: user?.whatsapp ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("securityTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
