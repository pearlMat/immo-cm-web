"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { ApiError } from "@/lib/api"
import { register as registerUser } from "@/lib/auth"
import {
  makeRegisterSchema,
  type RegisterFormOutput,
  type RegisterFormValues,
} from "@/schemas/auth.schema"
import { UserAccountType } from "@/types/enums"

export function RegisterForm() {
  const t = useTranslations("Auth")
  const tErrors = useTranslations("Auth.errors")
  const tPage = useTranslations("RegisterPage")
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<RegisterFormValues, unknown, RegisterFormOutput>({
    resolver: zodResolver(makeRegisterSchema((key) => tErrors(key))),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      accountType: UserAccountType.AGENT,
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterFormOutput) {
    try {
      await registerUser(values)
      setSubmitted(true)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tPage("errorToast"))
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-semibold">{tPage("successTitle")}</h2>
        <p className="text-sm text-muted-foreground">{tPage("successBody")}</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fullNameLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phoneLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("phonePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("whatsappLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("phonePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("accountTypeLabel")}</FormLabel>
              <div role="radiogroup" aria-label={t("accountTypeLabel")} className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.name}
                    value={UserAccountType.AGENT}
                    checked={field.value === UserAccountType.AGENT}
                    onChange={() => field.onChange(UserAccountType.AGENT)}
                  />
                  {t("accountTypeAgent")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.name}
                    value={UserAccountType.LANDLORD}
                    checked={field.value === UserAccountType.LANDLORD}
                    onChange={() => field.onChange(UserAccountType.LANDLORD)}
                  />
                  {t("accountTypeLandlord")}
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("passwordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tPage("submitting") : tPage("submit")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {tPage("alreadyHaveAccount")}{" "}
          <Link href="/connexion" className="font-medium text-foreground underline">
            {tPage("loginLink")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
