import { z } from "zod"

import type { AuthErrorTranslator } from "@/schemas/auth.schema"

const NAME_MIN_LENGTH = 2

export function makeNeighborhoodSchema(t: AuthErrorTranslator) {
  return z.object({
    name: z
      .string({ error: () => t("required") })
      .min(NAME_MIN_LENGTH, { error: t("nameTooShort") }),
  })
}

export type NeighborhoodFormValues = z.infer<ReturnType<typeof makeNeighborhoodSchema>>

export function makeAmenitySchema(t: AuthErrorTranslator) {
  return z.object({
    label: z
      .string({ error: () => t("required") })
      .min(NAME_MIN_LENGTH, { error: t("nameTooShort") }),
  })
}

export type AmenityFormValues = z.infer<ReturnType<typeof makeAmenitySchema>>
