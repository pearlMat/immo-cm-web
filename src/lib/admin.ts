import { api } from "@/lib/api"
import type { AdminListingFilters, AdminUserFilters } from "@/types/filters"
import type {
  AdminDashboardStats,
  Listing,
  ListingStatusLog,
  PaginatedListings,
} from "@/types/listing"
import type { Amenity, Neighborhood } from "@/types/reference"
import type { AdminUser, PaginatedUsers } from "@/types/user"

export interface ListingWithStatusLog extends Listing {
  statusLog: ListingStatusLog[]
}

/** Fetches admin dashboard counters (pending/approved/rejected listings, agent counts). */
export function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return api.get<AdminDashboardStats>("/admin/stats")
}

/** Fetches a paginated, filtered list of listings for moderation. */
export function getAdminListings(filters: AdminListingFilters = {}): Promise<PaginatedListings> {
  return api.get<PaginatedListings>("/admin/listings", {
    params: {
      status: filters.status,
      cityId: filters.cityId,
      listingType: filters.listingType,
      propertyType: filters.propertyType,
      agentName: filters.agentName,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    },
  })
}

/** Fetches a single listing (any status) with its status history, for admin review. */
export function getAdminListing(id: string): Promise<ListingWithStatusLog> {
  return api.get<ListingWithStatusLog>(`/admin/listings/${id}`)
}

/** Approves a pending listing, making it publicly visible. */
export function approveListing(id: string): Promise<void> {
  return api.post<void>(`/admin/listings/${id}/approve`)
}

/** Rejects a listing with a mandatory reason, shown to the agent. */
export function rejectListing(id: string, reason: string): Promise<void> {
  return api.post<void>(`/admin/listings/${id}/reject`, { reason })
}

/** Deletes a listing with a mandatory reason. */
export function deleteListing(id: string, reason: string): Promise<void> {
  return api.post<void>(`/admin/listings/${id}/delete`, { reason })
}

/** Approves multiple listings at once. */
export function bulkApproveListings(ids: string[]): Promise<void> {
  return api.post<void>("/admin/listings/bulk-approve", { ids })
}

/** Rejects multiple listings at once with a shared reason. */
export function bulkRejectListings(ids: string[], reason: string): Promise<void> {
  return api.post<void>("/admin/listings/bulk-reject", { ids, reason })
}

/** Deletes multiple listings at once with a shared reason. */
export function bulkDeleteListings(ids: string[], reason: string): Promise<void> {
  return api.post<void>("/admin/listings/bulk-delete", { ids, reason })
}

/** Fetches a paginated, filtered list of users for the admin user management table. */
export function getAdminUsers(filters: AdminUserFilters = {}): Promise<PaginatedUsers> {
  return api.get<PaginatedUsers>("/admin/users", {
    params: {
      role: filters.role,
      status: filters.status,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    },
  })
}

/** Fetches a single user for the admin user detail page. */
export function getAdminUser(id: string): Promise<AdminUser> {
  return api.get<AdminUser>(`/admin/users/${id}`)
}

/** Suspends a user, hiding their approved listings. */
export function suspendUser(id: string): Promise<void> {
  return api.post<void>(`/admin/users/${id}/suspend`)
}

/** Reactivates a suspended or banned user. */
export function reactivateUser(id: string): Promise<void> {
  return api.post<void>(`/admin/users/${id}/reactivate`)
}

/** Permanently deletes a user account. */
export function deleteUser(id: string): Promise<void> {
  return api.delete<void>(`/admin/users/${id}`)
}

/** Creates a neighborhood under the given city. */
export function createNeighborhood(cityId: string, name: string): Promise<Neighborhood> {
  return api.post<Neighborhood>(`/admin/cities/${cityId}/neighborhoods`, { name })
}

/** Renames a neighborhood. */
export function updateNeighborhood(id: string, name: string): Promise<Neighborhood> {
  return api.patch<Neighborhood>(`/admin/neighborhoods/${id}`, { name })
}

/** Deletes a neighborhood. */
export function deleteNeighborhood(id: string): Promise<void> {
  return api.delete<void>(`/admin/neighborhoods/${id}`)
}

/** Creates an amenity. */
export function createAmenity(label: string): Promise<Amenity> {
  return api.post<Amenity>("/admin/amenities", { label })
}

/** Renames an amenity. */
export function updateAmenity(id: string, label: string): Promise<Amenity> {
  return api.patch<Amenity>(`/admin/amenities/${id}`, { label })
}

/** Deletes an amenity. */
export function deleteAmenity(id: string): Promise<void> {
  return api.delete<void>(`/admin/amenities/${id}`)
}
