"use client"

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
import { useRouter } from "@/i18n/navigation"
import { ApiError } from "@/lib/api"
import { resetPassword } from "@/lib/auth"
import {
  makeResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth.schema"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations("Auth")
  const tErrors = useTranslations("Auth.errors")
  const tPage = useTranslations("ResetPasswordPage")
  const router = useRouter()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(makeResetPasswordSchema((key) => tErrors(key))),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      await resetPassword({ token, password: values.password })
      toast.success(tPage("successToast"))
      router.push("/connexion")
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tPage("errorToast"))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
      </form>
    </Form>
  )
}
