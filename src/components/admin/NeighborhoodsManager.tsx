"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createNeighborhood, deleteNeighborhood, updateNeighborhood } from "@/lib/admin"
import { ApiError } from "@/lib/api"
import { getCities } from "@/lib/listings"
import { makeNeighborhoodSchema } from "@/schemas/content.schema"
import type { Neighborhood } from "@/types/reference"

export function NeighborhoodsManager() {
  const t = useTranslations("NeighborhoodsPage")
  const tErrors = useTranslations("ContentManagement")
  const queryClient = useQueryClient()
  const schema = makeNeighborhoodSchema((key) => tErrors(key))

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 60_000,
    retry: 1,
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [addValues, setAddValues] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Neighborhood | null>(null)
  const [pending, setPending] = useState(false)

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["cities"] })
  }

  function startEdit(neighborhood: Neighborhood) {
    setEditingId(neighborhood.id)
    setEditValue(neighborhood.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue("")
  }

  async function handleSaveEdit() {
    const result = schema.safeParse({ name: editValue })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    if (!editingId) return

    setPending(true)
    try {
      await updateNeighborhood(editingId, result.data.name)
      await invalidate()
      toast.success(t("updateSuccess"))
      cancelEdit()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleAdd(cityId: string) {
    const value = addValues[cityId] ?? ""
    const result = schema.safeParse({ name: value })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setPending(true)
    try {
      await createNeighborhood(cityId, result.data.name)
      await invalidate()
      toast.success(t("addSuccess"))
      setAddValues((prev) => ({ ...prev, [cityId]: "" }))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setPending(true)
    try {
      await deleteNeighborhood(deleteTarget.id)
      await invalidate()
      toast.success(t("deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(cities ?? []).map((city) => (
        <Card key={city.id}>
          <CardHeader>
            <CardTitle>{city.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {city.neighborhoods.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
            {city.neighborhoods.map((neighborhood) => (
              <div key={neighborhood.id} className="flex items-center gap-2">
                {editingId === neighborhood.id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      aria-label={t("renameLabel", { name: neighborhood.name })}
                    />
                    <Button size="sm" onClick={handleSaveEdit} disabled={pending}>
                      {t("save")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} disabled={pending}>
                      {t("cancel")}
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{neighborhood.name}</span>
                    <Button size="sm" variant="outline" onClick={() => startEdit(neighborhood)}>
                      {t("rename")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(neighborhood)}
                    >
                      {t("delete")}
                    </Button>
                  </>
                )}
              </div>
            ))}

            <div className="mt-2 flex items-center gap-2">
              <Input
                value={addValues[city.id] ?? ""}
                onChange={(e) =>
                  setAddValues((prev) => ({ ...prev, [city.id]: e.target.value }))
                }
                placeholder={t("addPlaceholder")}
                className="h-8"
                aria-label={t("addPlaceholder")}
              />
              <Button size="sm" onClick={() => handleAdd(city.id)} disabled={pending}>
                {t("add")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        destructive
        loading={pending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
