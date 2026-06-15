import { z } from "zod"

import type { AuthErrorTranslator } from "@/schemas/auth.schema"

const REASON_MIN_LENGTH = 10

export function makeReasonSchema(t: AuthErrorTranslator) {
  return z.object({
    reason: z
      .string({ error: () => t("required") })
      .min(REASON_MIN_LENGTH, { error: t("reasonTooShort") }),
  })
}

export type ReasonFormValues = z.infer<ReturnType<typeof makeReasonSchema>>
