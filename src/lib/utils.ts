import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats an integer amount as FCFA with thousands separators, e.g. 150000 -> "150 000 FCFA" */
export function formatFCFA(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-FR")
    .format(amount)
    .replace(/[  ]/g, " ")
  return `${formatted} FCFA`
}

/** Formats a Cameroon phone number, e.g. "+2376XXXXXXXX" -> "+237 6XX XXX XXX" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  const local = digits.startsWith("237") ? digits.slice(3) : digits

  if (local.length !== 9) {
    return phone
  }

  return `+237 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 9)}`
}

const DATE_LOCALES: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
}

/** Formats an ISO date string, e.g. "2025-06-03" -> "03 juin 2025" (fr) or "June 3, 2025" (en) */
export function formatDate(date: string, locale: string = "fr"): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? DATE_LOCALES.fr, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}
