import { z } from "zod"

import { phoneField, type AuthErrorTranslator } from "@/schemas/auth.schema"
import { ListingType, PaymentPeriod, PropertyType } from "@/types/enums"

const MAX_PHOTOS = 10
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"]

export interface PhotoItem {
  id: string
  url?: string
  file?: File
}

function toNumberOrUndefined(value: string | number | undefined): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined
  return Number(value)
}

function requiredPositiveNumber(t: AuthErrorTranslator) {
  return z
    .union([z.string(), z.number()])
    .transform(toNumberOrUndefined)
    .pipe(
      z
        .number({ error: () => t("required") })
        .positive({ error: t("positiveNumber") })
    )
}

function optionalPositiveNumber(t: AuthErrorTranslator) {
  return z
    .union([z.string(), z.number()])
    .optional()
    .transform(toNumberOrUndefined)
    .pipe(z.number().positive({ error: t("positiveNumber") }).optional())
}

export function makeListingSchema(t: AuthErrorTranslator) {
  return z
    .object({
      title: z
        .string({ error: () => t("required") })
        .min(5, { error: t("titleMin") }),
      listingType: z.enum(ListingType, { error: () => t("required") }),
      propertyType: z.enum(PropertyType, { error: () => t("required") }),
      cityId: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
      neighborhoodId: z
        .string({ error: () => t("required") })
        .min(1, { error: t("required") }),
      address: z.string().optional(),
      price: requiredPositiveNumber(t),
      paymentPeriod: z.enum(PaymentPeriod).optional(),
      bedrooms: optionalPositiveNumber(t),
      bathrooms: optionalPositiveNumber(t),
      areaM2: optionalPositiveNumber(t),
      description: z
        .string({ error: () => t("required") })
        .min(50, { error: t("descriptionMin") }),
      amenityIds: z.array(z.string()).default([]),
      agentPhone: phoneField(t),
      agentWhatsapp: z
        .union([phoneField(t), z.literal("")])
        .optional()
        .transform((value) => (value ? value : undefined)),
      photos: z
        .array(
          z.custom<PhotoItem>((value) => {
            return (
              typeof value === "object" &&
              value !== null &&
              "id" in value &&
              ("url" in value || "file" in value)
            )
          })
        )
        .min(1, { error: t("photosMin") })
        .max(MAX_PHOTOS, { error: t("photosMax") }),
    })
    .check((ctx) => {
      const { listingType, paymentPeriod, photos } = ctx.value

      if (listingType === ListingType.RENT && !paymentPeriod) {
        ctx.issues.push({
          code: "custom",
          message: t("paymentPeriodRequired"),
          path: ["paymentPeriod"],
          input: paymentPeriod,
        })
      }

      photos.forEach((photo, index) => {
        if (!photo.file) return

        if (!ACCEPTED_PHOTO_TYPES.includes(photo.file.type)) {
          ctx.issues.push({
            code: "custom",
            message: t("photoTypeInvalid"),
            path: ["photos", index],
            input: photo,
          })
        }

        if (photo.file.size > MAX_PHOTO_SIZE_BYTES) {
          ctx.issues.push({
            code: "custom",
            message: t("photoTooLarge"),
            path: ["photos", index],
            input: photo,
          })
        }
      })
    })
}

export type ListingFormValues = z.input<ReturnType<typeof makeListingSchema>>
export type ListingFormOutput = z.output<ReturnType<typeof makeListingSchema>>
