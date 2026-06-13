import { z } from "zod"

import { UserAccountType } from "@/types/enums"

export type AuthErrorTranslator = (key: string) => string

const PHONE_REGEX = /^(\+237\s?)?6\d{2}\s?\d{3}\s?\d{3}$/
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

/** Normalizes a Cameroon phone number to "+2376XXXXXXXX" */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  const local = digits.startsWith("237") ? digits.slice(3) : digits
  return `+237${local}`
}

function emailField(t: AuthErrorTranslator) {
  return z
    .string({ error: () => t("required") })
    .min(1, { error: t("required") })
    .pipe(z.email({ error: t("invalidEmail") }))
}

export function phoneField(t: AuthErrorTranslator) {
  return z
    .string({ error: () => t("required") })
    .min(1, { error: t("required") })
    .regex(PHONE_REGEX, { error: t("invalidPhone") })
    .transform(normalizePhone)
}

export function passwordField(t: AuthErrorTranslator) {
  return z
    .string({ error: () => t("required") })
    .min(8, { error: t("passwordMin") })
    .regex(PASSWORD_COMPLEXITY_REGEX, { error: t("passwordComplexity") })
}

export function makeRegisterSchema(t: AuthErrorTranslator) {
  return z
    .object({
      fullName: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
      email: emailField(t),
      phone: phoneField(t),
      whatsapp: z
        .union([phoneField(t), z.literal("")])
        .optional()
        .transform((value) => (value ? value : undefined)),
      accountType: z.enum([UserAccountType.AGENT, UserAccountType.LANDLORD], {
        error: () => t("accountTypeRequired"),
      }),
      password: passwordField(t),
      confirmPassword: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: t("passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export function makeLoginSchema(t: AuthErrorTranslator) {
  return z.object({
    email: emailField(t),
    password: z
      .string({ error: () => t("required") })
      .min(1, { error: t("required") }),
  })
}

export function makeForgotPasswordSchema(t: AuthErrorTranslator) {
  return z.object({
    email: emailField(t),
  })
}

export function makeResetPasswordSchema(t: AuthErrorTranslator) {
  return z
    .object({
      password: passwordField(t),
      confirmPassword: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: t("passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type RegisterFormValues = z.input<ReturnType<typeof makeRegisterSchema>>
export type RegisterFormOutput = z.output<ReturnType<typeof makeRegisterSchema>>
export type LoginFormValues = z.infer<ReturnType<typeof makeLoginSchema>>
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof makeForgotPasswordSchema>>
export type ResetPasswordFormValues = z.infer<ReturnType<typeof makeResetPasswordSchema>>
