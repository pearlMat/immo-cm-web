import { api } from "@/lib/api"
import type { AdminListingFilters } from "@/types/filters"
import type {
  AdminDashboardStats,
  Listing,
  ListingStatusLog,
  PaginatedListings,
} from "@/types/listing"

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
