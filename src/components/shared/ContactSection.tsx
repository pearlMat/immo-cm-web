import { useTranslations } from "next-intl"
import { Phone, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPhone } from "@/lib/utils"

interface ContactSectionProps {
  agentPhone?: string
  agentWhatsapp?: string | null
}

function toWhatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  const international = digits.startsWith("237") ? digits : `237${digits}`
  return `https://wa.me/${international}`
}

export function ContactSection({ agentPhone, agentWhatsapp }: ContactSectionProps) {
  const t = useTranslations("ContactSection")

  if (!agentPhone) {
    return null
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-medium">{t("title")}</h2>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm">
            <Phone className="size-4" />
            {formatPhone(agentPhone)}
          </span>
          <Button render={<a href={`tel:${agentPhone}`} />} size="sm">
            {t("call")}
          </Button>
        </div>
        {agentWhatsapp && (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm">
              <MessageCircle className="size-4" />
              {t("whatsapp")}
            </span>
            <Button
              render={<a href={toWhatsappLink(agentWhatsapp)} target="_blank" rel="noopener noreferrer" />}
              variant="outline"
              size="sm"
            >
              {t("writeOnWhatsapp")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
