"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { ConfirmModal } from "@/components/shared/ConfirmModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createAmenity, deleteAmenity, updateAmenity } from "@/lib/admin"
import { getAmenities } from "@/lib/agent"
import { ApiError } from "@/lib/api"
import { makeAmenitySchema } from "@/schemas/content.schema"
import type { Amenity } from "@/types/reference"

export function AmenitiesManager() {
  const t = useTranslations("AmenitiesPage")
  const tErrors = useTranslations("ContentManagement")
  const queryClient = useQueryClient()
  const schema = makeAmenitySchema((key) => tErrors(key))

  const { data: amenities, isLoading } = useQuery({
    queryKey: ["amenities"],
    queryFn: getAmenities,
    staleTime: 60_000,
    retry: 1,
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [addValue, setAddValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null)
  const [pending, setPending] = useState(false)

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["amenities"] })
  }

  function startEdit(amenity: Amenity) {
    setEditingId(amenity.id)
    setEditValue(amenity.label)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue("")
  }

  async function handleSaveEdit() {
    const result = schema.safeParse({ label: editValue })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    if (!editingId) return

    setPending(true)
    try {
      await updateAmenity(editingId, result.data.label)
      await invalidate()
      toast.success(t("updateSuccess"))
      cancelEdit()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("errorToast"))
    } finally {
      setPending(false)
    }
  }

  async function handleAdd() {
    const result = schema.safeParse({ label: addValue })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    setPending(true)
    try {
      await createAmenity(result.data.label)
      await invalidate()
      toast.success(t("addSuccess"))
      setAddValue("")
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
      await deleteAmenity(deleteTarget.id)
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
    <div className="flex flex-col gap-4">
      {(amenities ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnLabel")}</TableHead>
              <TableHead>{t("columnSlug")}</TableHead>
              <TableHead>{t("columnActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(amenities ?? []).map((amenity) => (
              <TableRow key={amenity.id}>
                <TableCell>
                  {editingId === amenity.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      aria-label={t("editLabel", { label: amenity.label })}
                    />
                  ) : (
                    amenity.label
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {amenity.slug}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {editingId === amenity.id ? (
                      <>
                        <Button size="sm" onClick={handleSaveEdit} disabled={pending}>
                          {t("save")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={pending}>
                          {t("cancel")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(amenity)}>
                          {t("edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(amenity)}
                        >
                          {t("delete")}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-end gap-2">
        <Input
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          placeholder={t("addPlaceholder")}
          className="h-8 w-64"
          aria-label={t("addPlaceholder")}
        />
        <Button size="sm" onClick={handleAdd} disabled={pending}>
          {t("add")}
        </Button>
      </div>

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
