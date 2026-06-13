import { useTranslations } from "next-intl"

import { formatFCFA } from "@/lib/utils"
import { PaymentPeriod } from "@/types/enums"

interface PriceDisplayProps {
  price: number
  paymentPeriod?: PaymentPeriod | null
  className?: string
}

export function PriceDisplay({ price, paymentPeriod, className }: PriceDisplayProps) {
  const t = useTranslations("PaymentPeriod")

  return (
    <span className={className}>
      {formatFCFA(price)}
      {paymentPeriod === PaymentPeriod.NEGOTIABLE && (
        <span className="text-muted-foreground"> ({t(paymentPeriod)})</span>
      )}
      {paymentPeriod &&
        paymentPeriod !== PaymentPeriod.NEGOTIABLE && (
          <span className="text-muted-foreground"> / {t(paymentPeriod)}</span>
        )}
    </span>
  )
}
