"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
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
import { Link, useRouter } from "@/i18n/navigation"
import { ApiError } from "@/lib/api"
import { login } from "@/lib/auth"
import { dashboardFor } from "@/lib/dashboard"
import { makeLoginSchema, type LoginFormValues } from "@/schemas/auth.schema"

export function LoginForm() {
  const t = useTranslations("Auth")
  const tErrors = useTranslations("Auth.errors")
  const tPage = useTranslations("LoginPage")
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(makeLoginSchema((key) => tErrors(key))),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const { user } = await login(values)
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      router.push(dashboardFor(user.role))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tPage("errorToast"))
    }
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
        <p className="text-right text-sm">
          <Link href="/mot-de-passe-oublie" className="text-muted-foreground underline">
            {tPage("forgotPassword")}
          </Link>
        </p>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tPage("submitting") : tPage("submit")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {tPage("noAccount")}{" "}
          <Link href="/inscription" className="font-medium text-foreground underline">
            {tPage("registerLink")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
