"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

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
import { forgotPassword } from "@/lib/auth"
import {
  makeForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schema"

export function ForgotPasswordForm() {
  const t = useTranslations("Auth")
  const tErrors = useTranslations("Auth.errors")
  const tPage = useTranslations("ForgotPasswordPage")
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(makeForgotPasswordSchema((key) => tErrors(key))),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await forgotPassword(values)
    } catch {
      // Always show a generic confirmation, regardless of outcome.
    } finally {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">{tPage("confirmationMessage")}</p>
        <Link href="/connexion" className="font-medium underline">
          {tPage("backToLogin")}
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tPage("submitting") : tPage("submit")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/connexion" className="font-medium text-foreground underline">
            {tPage("backToLogin")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
