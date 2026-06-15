import { api } from "@/lib/api"
import type { ChangePasswordPayload, UpdateProfilePayload } from "@/types/auth"
import type { AgentListingFilters } from "@/types/filters"
import type { AgentListingStats, Listing, PaginatedListings } from "@/types/listing"
import type { Notification } from "@/types/notification"
import type { Amenity } from "@/types/reference"
import type { User } from "@/types/user"

/** Fetches a paginated, filtered list of the current agent's listings. */
export function getAgentListings(filters: AgentListingFilters = {}): Promise<PaginatedListings> {
  return api.get<PaginatedListings>("/agent/listings", {
    params: {
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    },
  })
}

/** Fetches counts of the current agent's listings by status. */
export function getAgentListingStats(): Promise<AgentListingStats> {
  return api.get<AgentListingStats>("/agent/listings/stats")
}

/** Deletes one of the current agent's listings. */
export function deleteAgentListing(id: string): Promise<void> {
  return api.delete<void>(`/agent/listings/${id}`)
}

/** Resubmits a rejected listing for re-review. */
export function resubmitAgentListing(id: string): Promise<void> {
  return api.post<void>(`/agent/listings/${id}/resubmit`)
}

/** Fetches the current user's most recent notifications. */
export function getRecentNotifications(limit: number): Promise<Notification[]> {
  return api.get<Notification[]>("/notifications", { params: { limit } })
}

/** Updates the current user's personal information. */
export function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return api.patch<User>("/auth/me", payload)
}

/** Changes the current user's password. */
export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return api.post<void>("/auth/change-password", payload)
}

/** Fetches the list of available listing amenities. */
export function getAmenities(): Promise<Amenity[]> {
  return api.get<Amenity[]>("/amenities")
}

/** Fetches a single listing owned by the current agent, for editing. */
export function getAgentListing(id: string): Promise<Listing> {
  return api.get<Listing>(`/agent/listings/${id}`)
}

/** Creates a new listing from a multipart form (fields + photo files). */
export function createListing(formData: FormData): Promise<Listing> {
  return api.post<Listing>("/agent/listings", formData)
}

/** Updates an existing listing from a multipart form (fields + photo files). */
export function updateListing(id: string, formData: FormData): Promise<Listing> {
  return api.patch<Listing>(`/agent/listings/${id}`, formData)
}
