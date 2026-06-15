"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { PhotoUploader } from "@/components/forms/PhotoUploader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "@/i18n/navigation"
import { getAdminListing, updateAdminListing } from "@/lib/admin"
import {
  createListing,
  getAgentListing,
  getAmenities,
  updateListing,
} from "@/lib/agent"
import { ApiError } from "@/lib/api"
import { getCities } from "@/lib/listings"
import {
  makeListingSchema,
  type ListingFormOutput,
  type ListingFormValues,
} from "@/schemas/listing.schema"
import { ListingStatus, ListingType, PaymentPeriod, PropertyType } from "@/types/enums"

interface ListingFormProps {
  mode: "create" | "edit"
  listingId?: string
  defaultContact: { phone: string; whatsapp: string }
  context?: "agent" | "admin"
}

export function ListingForm({ mode, listingId, defaultContact, context = "agent" }: ListingFormProps) {
  const t = useTranslations("ListingForm")
  const tErrors = useTranslations("Auth.errors")
  const tPropertyType = useTranslations("PropertyType")
  const tListingType = useTranslations("ListingType")
  const tPaymentPeriod = useTranslations("PaymentPeriod")
  const router = useRouter()

  const citiesQuery = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 60_000,
    retry: 1,
  })

  const amenitiesQuery = useQuery({
    queryKey: ["amenities"],
    queryFn: getAmenities,
    staleTime: 60_000,
    retry: 1,
  })

  const listingQuery = useQuery({
    queryKey: [context === "admin" ? "admin-listing" : "agent-listing", listingId],
    queryFn: () =>
      context === "admin" ? getAdminListing(listingId!) : getAgentListing(listingId!),
    enabled: mode === "edit" && !!listingId,
    staleTime: 60_000,
    retry: 1,
  })

  const cities = citiesQuery.data ?? []
  const amenities = amenitiesQuery.data ?? []

  const form = useForm<ListingFormValues, unknown, ListingFormOutput>({
    resolver: zodResolver(makeListingSchema((key) => tErrors(key))),
    defaultValues: {
      title: "",
      listingType: ListingType.RENT,
      propertyType: PropertyType.APARTMENT,
      cityId: "",
      neighborhoodId: "",
      address: "",
      price: "",
      paymentPeriod: undefined,
      bedrooms: "",
      bathrooms: "",
      areaM2: "",
      description: "",
      amenityIds: [],
      agentPhone: defaultContact.phone,
      agentWhatsapp: defaultContact.whatsapp,
      photos: [],
    },
  })

  useEffect(() => {
    const listing = listingQuery.data
    if (!listing) return

    form.reset({
      title: listing.title,
      listingType: listing.listingType,
      propertyType: listing.propertyType,
      cityId: listing.cityId,
      neighborhoodId: listing.neighborhoodId,
      address: listing.address ?? "",
      price: listing.price,
      paymentPeriod: listing.paymentPeriod ?? undefined,
      bedrooms: listing.bedrooms ?? "",
      bathrooms: listing.bathrooms ?? "",
      areaM2: listing.areaM2 ?? "",
      description: listing.description,
      amenityIds: listing.amenities.map((amenity) => amenity.id),
      agentPhone: listing.agentPhone ?? defaultContact.phone,
      agentWhatsapp: listing.agentWhatsapp ?? defaultContact.whatsapp,
      photos: listing.images.map((image) => ({ id: image.id, url: image.url })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingQuery.data])

  const listingType = form.watch("listingType")
  const cityId = form.watch("cityId")
  const description = form.watch("description")
  const selectedCity = cities.find((city) => city.id === cityId)

  async function onSubmit(values: ListingFormOutput) {
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("listingType", values.listingType)
    formData.append("propertyType", values.propertyType)
    formData.append("cityId", values.cityId)
    formData.append("neighborhoodId", values.neighborhoodId)
    if (values.address) formData.append("address", values.address)
    formData.append("price", String(values.price))
    if (values.paymentPeriod) formData.append("paymentPeriod", values.paymentPeriod)
    if (values.bedrooms !== undefined) formData.append("bedrooms", String(values.bedrooms))
    if (values.bathrooms !== undefined) formData.append("bathrooms", String(values.bathrooms))
    if (values.areaM2 !== undefined) formData.append("areaM2", String(values.areaM2))
    formData.append("description", values.description)
    values.amenityIds.forEach((id) => formData.append("amenityIds[]", id))
    formData.append("agentPhone", values.agentPhone)
    if (values.agentWhatsapp) formData.append("agentWhatsapp", values.agentWhatsapp)

    const existingImageIds: string[] = []
    const photoOrder: string[] = []
    values.photos.forEach((photo) => {
      photoOrder.push(photo.id)
      if (photo.file) {
        formData.append("photos", photo.file)
      } else if (photo.url) {
        existingImageIds.push(photo.id)
      }
    })
    existingImageIds.forEach((id) => formData.append("existingImageIds[]", id))
    formData.append("photoOrder", JSON.stringify(photoOrder))

    try {
      if (mode === "create") {
        await createListing(formData)
        toast.success(t("createSuccess"))
        router.push("/agent/mes-annonces")
      } else if (context === "admin") {
        await updateAdminListing(listingId!, formData)
        toast.success(t("updateSuccess"))
        router.push(`/admin/annonces/${listingId}`)
      } else {
        await updateListing(listingId!, formData)
        toast.success(t("updateSuccess"))
        router.push("/agent/mes-annonces")
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    }
  }

  if (mode === "edit" && listingQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  const listing = listingQuery.data

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {mode === "edit" && context === "agent" && listing?.status === ListingStatus.APPROVED && (
          <Alert variant="destructive">
            <AlertTitle>{t("approvedWarningTitle")}</AlertTitle>
            <AlertDescription>{t("approvedWarningBody")}</AlertDescription>
          </Alert>
        )}

        {/* 1. Type d'annonce */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.type")}</h2>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("titleLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="listingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("listingTypeLabel")}</FormLabel>
                <div className="flex gap-2">
                  {([ListingType.RENT, ListingType.SALE] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={field.value === type ? "default" : "outline"}
                      aria-pressed={field.value === type}
                      onClick={() => field.onChange(type)}
                    >
                      {tListingType(type)}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("propertyTypeLabel")}</FormLabel>
                <div role="radiogroup" aria-label={t("propertyTypeLabel")} className="flex flex-wrap gap-4">
                  {Object.values(PropertyType).map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={field.name}
                        value={type}
                        checked={field.value === type}
                        onChange={() => field.onChange(type)}
                      />
                      {tPropertyType(type)}
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* 2. Localisation */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.location")}</h2>

          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cityLabel")}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      field.onChange(value)
                      form.setValue("neighborhoodId", "")
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("cityPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhoodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("neighborhoodLabel")}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (typeof value === "string") field.onChange(value)
                  }}
                  disabled={!selectedCity}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("neighborhoodPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCity?.neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood.id} value={neighborhood.id}>
                        {neighborhood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("addressLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* 3. Prix */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.price")}</h2>

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("priceLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={field.value as string | number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {listingType === ListingType.RENT && (
            <FormField
              control={form.control}
              name="paymentPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentPeriodLabel")}</FormLabel>
                  <div role="radiogroup" aria-label={t("paymentPeriodLabel")} className="flex flex-wrap gap-4">
                    {Object.values(PaymentPeriod).map((period) => (
                      <label key={period} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={field.name}
                          value={period}
                          checked={field.value === period}
                          onChange={() => field.onChange(period)}
                        />
                        {tPaymentPeriod(period)}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        {/* 4. Détails */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.details")}</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bedroomsLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.value as string | number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bathroomsLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.value as string | number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areaM2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("areaLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.value as string | number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* 5. Description */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.description")}</h2>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("descriptionLabel")}</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormDescription>
                  {t("descriptionCount", { count: description.length })}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* 6. Équipements */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.amenities")}</h2>

          <FormField
            control={form.control}
            name="amenityIds"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((amenity) => {
                    const amenityIds = field.value ?? []
                    const checked = amenityIds.includes(amenity.id)
                    return (
                      <label key={amenity.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            if (value) {
                              field.onChange([...amenityIds, amenity.id])
                            } else {
                              field.onChange(amenityIds.filter((id) => id !== amenity.id))
                            }
                          }}
                        />
                        {amenity.label}
                      </label>
                    )
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* 7. Photos */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.photos")}</h2>

          <FormField
            control={form.control}
            name="photos"
            render={({ field, fieldState }) => (
              <FormItem>
                <PhotoUploader
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </FormItem>
            )}
          />
        </section>

        {/* 8. Contact */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("sections.contact")}</h2>

          <FormField
            control={form.control}
            name="agentPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("agentPhoneLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder="+237 6XX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agentWhatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("agentWhatsappLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder="+237 6XX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" disabled={form.formState.isSubmitting} className="self-start">
          {form.formState.isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  )
}
