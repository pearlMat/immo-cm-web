"use client"

import { useState, type FormEvent } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api"
import { resendVerification } from "@/lib/auth"

export function ResendVerificationForm() {
  const t = useTranslations("Auth")
  const tPage = useTranslations("VerifyEmailPage")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email") as string
    setSubmitting(true)

    try {
      await resendVerification(email)
      toast.success(tPage("resendSuccess"))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tPage("resendError"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" disabled={submitting}>
        {tPage("resendButton")}
      </Button>
    </form>
  )
}
