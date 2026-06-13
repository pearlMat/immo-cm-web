import { z } from "zod"

import { type AuthErrorTranslator, passwordField, phoneField } from "./auth.schema"

export function makePersonalInfoSchema(t: AuthErrorTranslator) {
  return z.object({
    fullName: z
      .string({ error: () => t("required") })
      .min(1, { error: t("required") }),
    phone: phoneField(t),
    whatsapp: z
      .union([phoneField(t), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
}

export function makeChangePasswordSchema(t: AuthErrorTranslator) {
  return z
    .object({
      currentPassword: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
      newPassword: passwordField(t),
      confirmPassword: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      error: t("passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type PersonalInfoFormValues = z.input<ReturnType<typeof makePersonalInfoSchema>>
export type PersonalInfoFormOutput = z.output<ReturnType<typeof makePersonalInfoSchema>>
export type ChangePasswordFormValues = z.infer<ReturnType<typeof makeChangePasswordSchema>>
