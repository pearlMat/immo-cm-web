"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { makeReasonSchema, type ReasonFormValues } from "@/schemas/moderation.schema"

interface RejectionReasonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  loading?: boolean
  onConfirm: (reason: string) => void
}

export function RejectionReasonModal({
  open,
  onOpenChange,
  title,
  description,
  loading = false,
  onConfirm,
}: RejectionReasonModalProps) {
  const t = useTranslations("RejectionModal")
  const tErrors = useTranslations("Auth.errors")

  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(makeReasonSchema((key) => (key === "required" ? tErrors("required") : t("reasonTooShort")))),
    defaultValues: { reason: "" },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  function onSubmit(values: ReasonFormValues) {
    onConfirm(values.reason)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("reasonPlaceholder")}
                      aria-label={t("reasonLabel")}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {t("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
