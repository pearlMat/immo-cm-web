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
import { ApiError } from "@/lib/api"
import { updateProfile } from "@/lib/agent"
import {
  makePersonalInfoSchema,
  type PersonalInfoFormOutput,
  type PersonalInfoFormValues,
} from "@/schemas/profile.schema"

interface PersonalInfoFormProps {
  defaultValues: PersonalInfoFormValues
}

export function PersonalInfoForm({ defaultValues }: PersonalInfoFormProps) {
  const t = useTranslations("Auth")
  const tErrors = useTranslations("Auth.errors")
  const tProfile = useTranslations("AgentProfile")
  const queryClient = useQueryClient()

  const form = useForm<PersonalInfoFormValues, unknown, PersonalInfoFormOutput>({
    resolver: zodResolver(makePersonalInfoSchema((key) => tErrors(key))),
    defaultValues,
  })

  async function onSubmit(values: PersonalInfoFormOutput) {
    try {
      await updateProfile(values)
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success(tProfile("updateSuccess"))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tProfile("errorToast"))
    }
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
        <Button type="submit" disabled={form.formState.isSubmitting} className="self-start">
          {form.formState.isSubmitting ? tProfile("saving") : tProfile("save")}
        </Button>
      </form>
    </Form>
  )
}
